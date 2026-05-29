import json
import logging

from django.core.exceptions import ValidationError
from rest_framework import serializers

from ..models.atracao import Atracao
from ..models.campo_formulario import CampoFormulario
from ..models.coautor import Coautor
from ..models.espaco import Espaco
from ..models.resposta import Resposta
from .coautor_serializer import CoautorSerializer
from .espaco_serializer import EspacoSerializer

logger = logging.getLogger(__name__)


class AtracaoSerializer(serializers.ModelSerializer):
    equipe = CoautorSerializer(many=True, required=False, read_only=True)
    orientador_nome = serializers.ReadOnlyField(source="orientador.get_full_name")
    tipo = serializers.ReadOnlyField(source="modalidade.nome")
    espaco_detalhe = EspacoSerializer(source="espaco", read_only=True)
    espaco = serializers.PrimaryKeyRelatedField(
        queryset=Espaco.objects.all(),
        required=False,
        allow_null=True,
    )
    nivel_ensino_display = serializers.CharField(
        source="get_nivel_ensino_display", read_only=True
    )

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
            "orientador",
            "orientador_nome",
            "sou_orientador",
            "anexo_pdf",
            "acessibilidade",
            "evento",
            "status",
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

        # Criamos uma instância temporária para rodar o full_clean
        instance = Atracao(**model_data)
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data

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
