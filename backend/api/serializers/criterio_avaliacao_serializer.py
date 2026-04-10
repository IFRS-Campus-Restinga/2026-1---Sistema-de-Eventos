from rest_framework import serializers

from ..models.criterio_avaliacao import CriterioAvaliacao


class CriterioAvaliacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriterioAvaliacao
        fields = ["id", "nome", "descricao", "modalidade"]
