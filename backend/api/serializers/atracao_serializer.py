import json
import logging

from django.core.exceptions import ValidationError
from rest_framework import serializers

from ..models.atracao import Atracao
from ..models.autoria import Autoria
from ..models.campo_formulario import CampoFormulario
from ..models.coautor import Coautor
from ..models.espaco import Espaco
from ..models.resposta import Resposta
from ..enumerations.nivel_ensino import NivelEnsino
from ..enumerations.tipo_autoria import TipoAutoria
from ..services.submissao_service import sincronizar_submissao_por_registro_legado
from .autoria_serializer import AutoriaSerializer
from .coautor_serializer import CoautorSerializer
from .espaco_serializer import EspacoSerializer

logger = logging.getLogger(__name__)


class AtracaoSerializer(serializers.ModelSerializer):
    equipe = CoautorSerializer(
        source="submissao.equipe", many=True, required=False, read_only=True
    )
    autorias = AutoriaSerializer(many=True, required=False, read_only=True)
    autor_nome = serializers.SerializerMethodField()
    orientador_nome = serializers.SerializerMethodField()
    equipe_nomes = serializers.SerializerMethodField()
    tipo = serializers.ReadOnlyField(source="modalidade.nome")
    espaco_detalhe = EspacoSerializer(source="espaco", read_only=True)
    espaco = serializers.PrimaryKeyRelatedField(
        queryset=Espaco.objects.all(),
        required=False,
        allow_null=True,
    )
    # Sobrescreve o ChoiceField automático do model para aceitar CSV/lista.
    nivel_ensino = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    nivel_ensino_display = serializers.SerializerMethodField()

    equipe_json = serializers.CharField(required=False, allow_blank=True, default="")
    autoria_json = serializers.CharField(required=False, allow_blank=True, default="")
    respostas_campos = serializers.SerializerMethodField(read_only=True)
    respostas_campos_json = serializers.CharField(
        required=False, allow_blank=True, default=""
    )

    class Meta:
        model = Atracao
        fields = [
            "id",
            "titulo",
            "resumo",
            "palavras_chave",
            "modalidade",
            "tipo",
            "nivel_ensino",
            "nivel_ensino_display",
            "area_conhecimento",
            "autor_nome",
            "orientador",
            "orientador_nome",
            "anexo_pdf",
            "acessibilidade",
            "evento",
            "status",
            "sugestao_vagas",
            "equipe",
            "equipe_json",
            "autorias",
            "autoria_json",
            "equipe_nomes",
            "data_hora_inicio",
            "data_hora_fim",
            "espaco",
            "espaco_detalhe",
            "local_atracao",
            "respostas_campos",
            "respostas_campos_json",
        ]

    # aq a gnt pega e resolve os nomes pra apresentar na tela de inscrição em atrações
    def _resolver_nome_usuario(self, usuario):
        if not usuario:
            return ""

        candidatos = [
            getattr(usuario, "nome", None),
            getattr(usuario, "get_full_name", lambda: "")(),
            f"{getattr(usuario, 'first_name', '')} {getattr(usuario, 'last_name', '')}".strip(),
            getattr(usuario, "username", None),
            str(getattr(usuario, "id", "")),
        ]
        for candidato in candidatos:
            if candidato:
                return str(candidato).strip()
        return ""

    def get_autor_nome(self, obj):
        submissao = getattr(obj, "submissao", None)
        autorias = getattr(submissao, "autorias", None) if submissao else None
        if not autorias:
            return ""

        autoria_autor = (
            autorias.select_related("usuario")
            .filter(tipo=TipoAutoria.AUTOR)
            .order_by("ordem", "id")
            .first()
        )
        if autoria_autor:
            return self._resolver_nome_usuario(autoria_autor.usuario)
        return ""

    def get_orientador_nome(self, obj):
        submissao = getattr(obj, "submissao", None)
        if submissao and getattr(submissao, "orientador", None):
            nome_orientador = self._resolver_nome_usuario(submissao.orientador)
            if nome_orientador:
                return nome_orientador

        autorias = getattr(submissao, "autorias", None) if submissao else None
        if not autorias:
            return ""

        autoria_orientador = (
            autorias.select_related("usuario")
            .filter(tipo=TipoAutoria.ORIENTADOR)
            .order_by("ordem", "id")
            .first()
        )
        if autoria_orientador:
            return self._resolver_nome_usuario(autoria_orientador.usuario)

        return ""

    # precisa dessa porqueira aq, se n ele n puxa, fé
    def get_equipe_nomes(self, obj):
        submissao = getattr(obj, "submissao", None)
        membros = submissao.equipe.all().order_by("id") if submissao else []
        return [membro.nome for membro in membros if getattr(membro, "nome", "")]

    def validate(self, data):
        """
        Executa a validação completa do modelo, incluindo o método clean().
        """
        # Removemos campos que não existem no modelo (campos exclusivos do Serializer)
        model_data = data.copy()
        model_data.pop("equipe_json", None)
        model_data.pop("autoria_json", None)
        model_data.pop("respostas_campos_json", None)

        espaco = model_data.get("espaco")
        if espaco:
            model_data["local_atracao"] = str(espaco)

        modalidade = model_data.get("modalidade") or getattr(
            self.instance, "modalidade", None
        )
        sugestao_vagas = model_data.get("sugestao_vagas")
        limite_modalidade = None
        if modalidade:
            limite_modalidade = getattr(
                modalidade,
                "limite_maximo_vagas",
                getattr(modalidade, "limite_vagas", None),
            )

        if (
            sugestao_vagas is not None
            and limite_modalidade is not None
            and limite_modalidade > 0
        ):
            if sugestao_vagas > limite_modalidade:
                raise serializers.ValidationError(
                    {
                        "sugestao_vagas": (
                            f"A sugestão de vagas não pode ultrapassar o limite da modalidade "
                            f"({limite_modalidade})."
                        )
                    }
                )

        # nivel_ensino aceita múltiplos valores no formato CSV neste fluxo.
        # slug é gerado automaticamente no save().
        # Excluímos ambos do full_clean para evitar validações indevidas neste ponto.
        instance = Atracao(**model_data)
        try:
            instance.full_clean(exclude=["nivel_ensino", "slug"])
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data

    def validate_nivel_ensino(self, value):
        if value in (None, ""):
            return value

        itens = []
        if isinstance(value, (list, tuple)):
            itens = [str(item).strip() for item in value if str(item).strip()]
        else:
            valor_texto = str(value).strip()

            # Aceita entrada com aspas externas (ex.: "\"ENSINO_MEDIO_INTEGRADO,SUBSEQUENTE\"").
            if (
                len(valor_texto) >= 2
                and valor_texto[0] == valor_texto[-1]
                and valor_texto[0] in {'"', "'"}
            ):
                valor_texto = valor_texto[1:-1].strip()

            # Aceita payload em formato JSON (lista ou string).
            if valor_texto.startswith("[") and valor_texto.endswith("]"):
                try:
                    parsed = json.loads(valor_texto)
                    if isinstance(parsed, list):
                        itens = [
                            str(item).strip() for item in parsed if str(item).strip()
                        ]
                    elif isinstance(parsed, str):
                        valor_texto = parsed.strip()
                except (json.JSONDecodeError, ValueError, TypeError):
                    pass

            if not itens:
                itens = [
                    item.strip() for item in valor_texto.split(",") if item.strip()
                ]

        if not itens:
            return ""

        validos = {choice[0] for choice in NivelEnsino.choices}
        invalidos = [item for item in itens if item not in validos]
        if invalidos:
            raise serializers.ValidationError(
                f"Nível(is) de ensino inválido(s): {', '.join(invalidos)}"
            )

        # Mantemos persistência como CSV para compatibilidade de schema.
        return ",".join(itens)

    def get_nivel_ensino_display(self, obj):
        valor = getattr(obj, "nivel_ensino", None)
        if not valor:
            return ""

        mapa = {choice[0]: str(choice[1]) for choice in NivelEnsino.choices}
        itens = [item.strip() for item in str(valor).split(",") if item.strip()]
        if not itens:
            return ""

        labels = [mapa.get(item, item) for item in itens]
        return ", ".join(labels)

    def validate_equipe_json(self, value):
        if not value:
            return []
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, ValueError):
            return []

    def validate_respostas_campos_json(self, value):
        if not value:
            return {}
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else {}
        except (json.JSONDecodeError, ValueError):
            return {}

    def validate_autoria_json(self, value):
        if not value:
            return []
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, ValueError):
            return []

    def _normalizar_autorias(self, autoria_data):
        if not isinstance(autoria_data, list):
            return []

        tipos_validos = {choice[0] for choice in TipoAutoria.choices}
        autorias_normalizadas = []
        usuarios_vistos = set()
        ordens_vistas = set()

        for index, item in enumerate(autoria_data):
            if not isinstance(item, dict):
                continue

            usuario_id = item.get("usuario") or item.get("user_id")
            if usuario_id in (None, ""):
                continue

            try:
                usuario_id = int(usuario_id)
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    {"autoria_json": f"Usuário inválido na posição {index + 1}."}
                )

            if usuario_id in usuarios_vistos:
                raise serializers.ValidationError(
                    {
                        "autoria_json": "Um mesmo usuário não pode aparecer mais de uma vez."
                    }
                )
            usuarios_vistos.add(usuario_id)

            tipo_valor = item.get("tipo") or item.get("funcao")
            tipo = str(tipo_valor or "").strip().upper()
            if tipo not in tipos_validos:
                raise serializers.ValidationError(
                    {
                        "autoria_json": (
                            f"Tipo de autoria inválido na posição {index + 1}. "
                            "Use AUTOR, COAUTOR ou ORIENTADOR."
                        )
                    }
                )

            ordem = item.get("ordem", index + 1)
            try:
                ordem = int(ordem)
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    {"autoria_json": f"Ordem inválida na posição {index + 1}."}
                )

            if ordem <= 0:
                raise serializers.ValidationError(
                    {
                        "autoria_json": f"A ordem deve ser maior que zero na posição {index + 1}."
                    }
                )

            if ordem in ordens_vistas:
                raise serializers.ValidationError(
                    {"autoria_json": "A ordem de autoria não pode se repetir."}
                )
            ordens_vistas.add(ordem)

            autorias_normalizadas.append(
                {
                    "usuario_id": usuario_id,
                    "tipo": tipo,
                    "ordem": ordem,
                }
            )

        if autorias_normalizadas:
            total_autores = len(
                [a for a in autorias_normalizadas if a["tipo"] == TipoAutoria.AUTOR]
            )
            if total_autores != 1:
                raise serializers.ValidationError(
                    {"autoria_json": "A submissão deve possuir exatamente 1 AUTOR."}
                )

        return autorias_normalizadas

    def get_respostas_campos(self, obj):
        submissao = getattr(obj, "submissao", None)
        respostas_manager = getattr(submissao, "respostas", None) if submissao else None
        if not respostas_manager:
            return {}

        respostas = respostas_manager.select_related("campo_formulario").all()
        retorno = {}
        for resposta in respostas:
            chave = f"campo_{resposta.campo_formulario_id}"
            tipo = getattr(resposta.campo_formulario, "tipo_dado", None)

            if tipo == "BOOLEANO":
                retorno[chave] = str(resposta.valor).strip().lower() in (
                    "true",
                    "1",
                    "sim",
                )
                continue

            if tipo == "NUMERO":
                valor_texto = str(resposta.valor).strip()
                if valor_texto == "":
                    retorno[chave] = ""
                else:
                    try:
                        retorno[chave] = int(valor_texto)
                    except ValueError:
                        try:
                            retorno[chave] = float(valor_texto)
                        except ValueError:
                            retorno[chave] = resposta.valor
                continue

            retorno[chave] = resposta.valor
        return retorno

    def _sincronizar_respostas(self, submissao, respostas_campos_data):
        Resposta.objects.filter(atracao=submissao).delete()

        if not isinstance(respostas_campos_data, dict):
            return

        modalidade_id = submissao.modalidade_id
        if not modalidade_id:
            return

        campos_ids_validos = set(
            CampoFormulario.objects.filter(
                modalidade_id=modalidade_id, ativo=True
            ).values_list("id", flat=True)
        )

        respostas_para_criar = []
        for chave, valor in respostas_campos_data.items():
            if not isinstance(chave, str) or not chave.startswith("campo_"):
                continue

            try:
                campo_id = int(chave.replace("campo_", "", 1))
            except (TypeError, ValueError):
                continue

            if campo_id not in campos_ids_validos:
                continue

            if valor is None:
                continue

            valor_texto = str(valor)
            if valor_texto.strip() == "":
                continue

            respostas_para_criar.append(
                Resposta(
                    atracao=submissao,
                    campo_formulario_id=campo_id,
                    valor=valor_texto,
                )
            )

        if respostas_para_criar:
            Resposta.objects.bulk_create(respostas_para_criar)

    def _sincronizar_autorias(self, submissao, autorias_data):
        if not isinstance(autorias_data, list):
            return

        submissao.autorias.all().delete()
        if not autorias_data:
            return

        autorias_ordenadas = sorted(
            autorias_data, key=lambda autoria: autoria.get("ordem", 0)
        )
        objetos = [
            Autoria(submissao=submissao, **autoria) for autoria in autorias_ordenadas
        ]
        Autoria.objects.bulk_create(objetos)

    def _normalizar_coautores_legacy(self, equipe_data):
        if not isinstance(equipe_data, list):
            return []

        membros_normalizados = []
        for membro in equipe_data:
            if not isinstance(membro, dict):
                continue

            nome = str(membro.get("nome") or "").strip()
            if not nome:
                continue

            membros_normalizados.append(
                {
                    "nome": nome,
                    "instituicao_curso": membro.get("instituicao_curso") or "",
                    "funcao": membro.get("funcao") or TipoAutoria.COAUTOR,
                }
            )

        return membros_normalizados

    def create(self, validated_data):
        logger.info(f"Creating Atracao with validated_data: {validated_data}")
        equipe_data = validated_data.pop("equipe_json", [])
        autoria_data = validated_data.pop("autoria_json", [])
        respostas_campos_data = validated_data.pop("respostas_campos_json", {})

        espaco = validated_data.get("espaco")
        if espaco:
            validated_data["local_atracao"] = str(espaco)

        if not isinstance(equipe_data, list):
            equipe_data = []

        atracao = Atracao.objects.create(**validated_data)
        submissao = sincronizar_submissao_por_registro_legado(atracao)

        equipe_legacy_normalizada = self._normalizar_coautores_legacy(equipe_data)
        for membro in equipe_legacy_normalizada:
            if membro.get("nome"):
                Coautor.objects.create(submissao=submissao, **membro)

        autorias_normalizadas = self._normalizar_autorias(
            autoria_data if autoria_data else equipe_data
        )
        if autorias_normalizadas:
            self._sincronizar_autorias(submissao, autorias_normalizadas)

        self._sincronizar_respostas(submissao, respostas_campos_data)
        return atracao

    def update(self, instance, validated_data):
        equipe_data = validated_data.pop("equipe_json", None)
        autoria_data = validated_data.pop("autoria_json", None)
        respostas_campos_data = validated_data.pop("respostas_campos_json", None)

        espaco = validated_data.get("espaco")
        if espaco:
            validated_data["local_atracao"] = str(espaco)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        submissao = sincronizar_submissao_por_registro_legado(instance)

        if equipe_data and isinstance(equipe_data, list):
            submissao.equipe.all().delete()
            equipe_legacy_normalizada = self._normalizar_coautores_legacy(equipe_data)
            for membro in equipe_legacy_normalizada:
                if membro.get("nome"):
                    Coautor.objects.create(submissao=submissao, **membro)

        if isinstance(autoria_data, list):
            autorias_normalizadas = self._normalizar_autorias(autoria_data)
            self._sincronizar_autorias(submissao, autorias_normalizadas)
        elif isinstance(equipe_data, list):
            autorias_normalizadas = self._normalizar_autorias(equipe_data)
            if autorias_normalizadas:
                self._sincronizar_autorias(submissao, autorias_normalizadas)

        if isinstance(respostas_campos_data, dict):
            self._sincronizar_respostas(submissao, respostas_campos_data)

        sincronizar_submissao_por_registro_legado(instance)
        return instance
