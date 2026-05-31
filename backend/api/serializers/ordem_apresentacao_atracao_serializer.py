from rest_framework import serializers

from ..models.ordem_apresentacao_atracao import OrdemApresentacaoAtracao
from ..serializers.atracao_serializer import AtracaoSerializer


class OrdemApresentacaoAtracaoSerializer(serializers.ModelSerializer):
    atracao_display = AtracaoSerializer(source="atracao", read_only=True)

    class Meta:
        model = OrdemApresentacaoAtracao
        fields = ["id", "sessao", "atracao", "atracao_display", "ordem"]
