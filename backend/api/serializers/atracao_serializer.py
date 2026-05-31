import json
import logging

from django.core.exceptions import ValidationError
from rest_framework import serializers

from ..models.atracao import Atracao
from ..models.campo_formulario import CampoFormulario
from ..models.coautor import Coautor
from ..models.espaco import Espaco
from ..models.resposta import Resposta
from ..enumerations.nivel_ensino import NivelEnsino
from .coautor_serializer import CoautorSerializer
from .espaco_serializer import EspacoSerializer

logger = logging.getLogger(__name__)


class AtracaoSerializer(serializers.ModelSerializer):
    equipe = CoautorSerializer(many=True, required=False, read_only=True)
    tipo = serializers.ReadOnlyField(source="modalidade.nome")
    espaco_detalhe = EspacoSerializer(source="espaco", read_only=True)
    espaco = serializers.PrimaryKeyRelatedField(
        queryset=Espaco.objects.all(),
        required=False,
        allow_null=True,
    )
    # Sobrescreve o ChoiceField automático do model para aceitar CSV/lista.
    nivel_ensino = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    nivel_ensino_display = serializers.SerializerMethodField()

    equipe_json = serializers.CharField(required=False, allow_blank=True, default="")
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
            "anexo_pdf",
            "acessibilidade",
            "evento",
            "status",
            "sugestao_vagas",
            "equipe",
            "equipe_json",
            "data_hora_inicio",
            "data_hora_fim",
            "espaco",
            "espaco_detalhe",
            "local_atracao",
            "respostas_campos",
            "respostas_campos_json",
        ]

    def validate(self, data):
        """
        Executa a validação completa do modelo, incluindo o método clean().
        """
        # Removemos campos que não existem no modelo (campos exclusivos do Serializer)
        model_data = data.copy()
        model_data.pop("equipe_json", None)
        model_data.pop("respostas_campos_json", None)

        espaco = model_data.get("espaco")
        if espaco:
            model_data["local_atracao"] = str(espaco)

        modalidade = model_data.get("modalidade") or getattr(self.instance, "modalidade", None)
        sugestao_vagas = model_data.get("sugestao_vagas")
        if sugestao_vagas is not None and modalidade and modalidade.limite_vagas > 0:
            if sugestao_vagas > modalidade.limite_vagas:
                raise serializers.ValidationError(
                    {
                        "sugestao_vagas": (
                            f"A sugestão de vagas não pode ultrapassar o limite da modalidade "
                            f"({modalidade.limite_vagas})."
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
                        itens = [str(item).strip() for item in parsed if str(item).strip()]
                    elif isinstance(parsed, str):
                        valor_texto = parsed.strip()
                except (json.JSONDecodeError, ValueError, TypeError):
                    pass

            if not itens:
                itens = [item.strip() for item in valor_texto.split(",") if item.strip()]

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

    def get_respostas_campos(self, obj):
        respostas = obj.respostas.select_related("campo_formulario").all()
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

    def _sincronizar_respostas(self, atracao, respostas_campos_data):
        Resposta.objects.filter(atracao=atracao).delete()

        if not isinstance(respostas_campos_data, dict):
            return

        modalidade_id = atracao.modalidade_id
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
                    atracao=atracao,
                    campo_formulario_id=campo_id,
                    valor=valor_texto,
                )
            )

        if respostas_para_criar:
            Resposta.objects.bulk_create(respostas_para_criar)

    def create(self, validated_data):
        logger.info(f"Creating Atracao with validated_data: {validated_data}")
        equipe_data = validated_data.pop("equipe_json", [])
        respostas_campos_data = validated_data.pop("respostas_campos_json", {})

        espaco = validated_data.get("espaco")
        if espaco:
            validated_data["local_atracao"] = str(espaco)

        if not isinstance(equipe_data, list):
            equipe_data = []

        atracao = Atracao.objects.create(**validated_data)
        for membro in equipe_data:
            if membro.get("nome"):
                Coautor.objects.create(atracao=atracao, **membro)

        self._sincronizar_respostas(atracao, respostas_campos_data)
        return atracao

    def update(self, instance, validated_data):
        equipe_data = validated_data.pop("equipe_json", None)
        respostas_campos_data = validated_data.pop("respostas_campos_json", None)

        espaco = validated_data.get("espaco")
        if espaco:
            validated_data["local_atracao"] = str(espaco)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if equipe_data and isinstance(equipe_data, list):
            instance.equipe.all().delete()
            for membro in equipe_data:
                if membro.get("nome"):
                    Coautor.objects.create(atracao=instance, **membro)

        if isinstance(respostas_campos_data, dict):
            self._sincronizar_respostas(instance, respostas_campos_data)

        return instance
