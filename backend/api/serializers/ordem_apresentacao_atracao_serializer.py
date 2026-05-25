from rest_framework import serializers

from ..models.ordem_apresentacao_atracao import OrdemApresentacaoAtracao


class OrdemApresentacaoAtracaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrdemApresentacaoAtracao
        fields = ["id", "sessao", "atracao", "ordem"]
