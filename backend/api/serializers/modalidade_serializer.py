from rest_framework import serializers

from ..models.modalidade import Modalidade
from .campo_formulario_serializer import CampoFormularioSerializer
from .criterio_avaliacao_serializer import CriterioAvaliacaoSerializer


class ModalidadeSerializer(serializers.ModelSerializer):
    campos = CampoFormularioSerializer(
        many=True,
        source="campoformulario_set",
        read_only=True,
        required=False,
    )
    evento = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
        source="evento_set",
    )
    criterios = CriterioAvaliacaoSerializer(
        many=True,
        source="criterioavaliacao_set",
        read_only=True,
        required=False,
    )

    def create(self, validated_data):
        instance = Modalidade(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance

    class Meta:
        model = Modalidade
        fields = [
            "id",
            "evento",
            "campos",
            "nome",
            "requer_avaliacao",
            "requer_avaliacao_submissao",
            "limite_avaliadores",
            "emite_certificado",
            "campos",
            "criterios",
            "limite_vagas",
        ]
