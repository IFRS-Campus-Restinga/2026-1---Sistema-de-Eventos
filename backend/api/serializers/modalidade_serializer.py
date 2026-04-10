from rest_framework import serializers

from ..models.modalidade import Modalidade
from .campo_formulario_serializer import CampoFormularioSerializer
from .criterio_avaliacao_serializer import CriterioAvaliacaoSerializer


class ModalidadeSerializer(serializers.ModelSerializer):
    campos = CampoFormularioSerializer(
        many=True,
        source="campoformulario_set",
    )
    criterios = CriterioAvaliacaoSerializer(many=True, source="criterioavaliacao_set")

    class Meta:
        model = Modalidade
        fields = [
            "id",
            "campos",
            "nome",
            "requer_avaliacao",
            "emite_certificado",
            "campos",
            "criterios",
        ]
