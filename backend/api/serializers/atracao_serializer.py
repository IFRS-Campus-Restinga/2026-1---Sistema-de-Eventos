import json
import logging

from django.contrib.auth import get_user_model
from rest_framework import serializers

from ..models.atracao import Atracao
from ..models.espaco import Espaco
from ..models.evento import Evento
from ..models.modalidade import Modalidade
from ..services.atracao_submission_service import (
    atualizar_atracao_com_submissao,
    criar_atracao_com_submissao,
)
from ..enumerations.nivel_ensino import NivelEnsino
from ..enumerations.tipo_autoria import TipoAutoria
from .autoria_serializer import AutoriaSerializer
from .coautor_serializer import CoautorSerializer
from .espaco_serializer import EspacoSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


class AtracaoSerializer(serializers.ModelSerializer):
    fluxo_direto_atracao = serializers.BooleanField(
        write_only=True, required=False, default=False
    )
    titulo = serializers.CharField(source="submissao.titulo")
    resumo = serializers.CharField(
        source="submissao.resumo", required=False, allow_blank=True, allow_null=True
    )
    palavras_chave = serializers.CharField(
        source="submissao.palavras_chave",
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    equipe = CoautorSerializer(
        source="submissao.equipe", many=True, required=False, read_only=True
    )
    autorias = AutoriaSerializer(
        source="submissao.autorias", many=True, required=False, read_only=True
    )
    autor_nome = serializers.SerializerMethodField()
    orientador_nome = serializers.SerializerMethodField()
    equipe_nomes = serializers.SerializerMethodField()
    modalidade = serializers.PrimaryKeyRelatedField(
        source="submissao.modalidade",
        queryset=Modalidade.objects.all(),
        required=False,
        allow_null=True,
    )
    tipo = serializers.ReadOnlyField(source="submissao.modalidade.nome")
    evento = serializers.PrimaryKeyRelatedField(
        source="submissao.evento",
        queryset=Evento.objects.all(),
        required=False,
        allow_null=False,
    )
    espaco_detalhe = EspacoSerializer(source="espaco", read_only=True)
    espaco = serializers.PrimaryKeyRelatedField(
        queryset=Espaco.objects.all(),
        required=False,
        allow_null=True,
    )
    orientador = serializers.PrimaryKeyRelatedField(
        source="submissao.orientador",
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )
    sou_orientador = serializers.BooleanField(
        source="submissao.sou_orientador", required=False
    )
    anexo_pdf = serializers.FileField(
        source="submissao.anexo_pdf", required=False, allow_null=True
    )
    acessibilidade = serializers.BooleanField(
        source="submissao.acessibilidade", required=False
    )
    sugestao_vagas = serializers.IntegerField(
        source="submissao.sugestao_vagas", required=False, allow_null=True
    )
    slug = serializers.CharField(source="submissao.slug", read_only=True)
    # Sobrescreve o ChoiceField automático do model para aceitar CSV/lista.
    nivel_ensino = serializers.CharField(
        source="submissao.nivel_ensino",
        required=False, allow_blank=True, allow_null=True
    )
    area_conhecimento = serializers.CharField(
        source="submissao.area_conhecimento",
        required=False,
        allow_blank=True,
        allow_null=True,
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
            "fluxo_direto_atracao",
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
            "sou_orientador",
            "orientador_nome",
            "anexo_pdf",
            "acessibilidade",
            "evento",
            "status",
            "sugestao_vagas",
            "slug",
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

    CAMPOS_SUBMISSAO = (
        "titulo",
        "resumo",
        "palavras_chave",
        "modalidade",
        "nivel_ensino",
        "area_conhecimento",
        "orientador",
        "sou_orientador",
        "anexo_pdf",
        "acessibilidade",
        "evento",
        "sugestao_vagas",
    )

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
        submissao_data = data.get("submissao", {})
        espaco = data.get("espaco")
        if espaco:
            data["local_atracao"] = str(espaco)

        modalidade = submissao_data.get("modalidade") or getattr(
            getattr(self.instance, "submissao", None), "modalidade", None
        )
        sugestao_vagas = submissao_data.get("sugestao_vagas")
        limite_modalidade = None
        requer_controle_vagas = (
            bool(getattr(modalidade, "requer_controle_vagas", False))
            if modalidade
            else False
        )

        if not requer_controle_vagas:
            if sugestao_vagas not in (None, ""):
                raise serializers.ValidationError(
                    {
                        "sugestao_vagas": (
                            "Esta modalidade não permite sugestão de vagas."
                        )
                    }
                )
            submissao_data["sugestao_vagas"] = None

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

        evento = submissao_data.get("evento") or getattr(
            getattr(self.instance, "submissao", None), "evento", None
        )
        if espaco and evento:
            espaco_local_id = getattr(espaco, "local_id", None)
            evento_local_id = getattr(evento, "local_id", None)
            if espaco_local_id and evento_local_id and espaco_local_id != evento_local_id:
                raise serializers.ValidationError(
                    {
                        "espaco": "O espaço selecionado precisa pertencer ao mesmo local do evento."
                    }
                )

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
        submissao = getattr(obj, "submissao", None)
        valor = getattr(submissao, "nivel_ensino", None) if submissao else None
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

    def create(self, validated_data):
        logger.info(f"Creating Atracao with validated_data: {validated_data}")
        request = self.context.get("request")
        usuario_solicitante = getattr(request, "user", None) if request else None
        return criar_atracao_com_submissao(
            validated_data,
            self.CAMPOS_SUBMISSAO,
            usuario_solicitante=usuario_solicitante,
        )

    def update(self, instance, validated_data):
        request = self.context.get("request")
        usuario_solicitante = getattr(request, "user", None) if request else None
        return atualizar_atracao_com_submissao(
            instance,
            validated_data,
            self.CAMPOS_SUBMISSAO,
            usuario_solicitante=usuario_solicitante,
        )
