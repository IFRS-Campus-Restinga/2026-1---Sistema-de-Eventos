from rest_framework import serializers

from ..models import Sessao
from ..serializers.espaco_serializer import EspacoSerializer
from ..serializers.ordem_apresentacao_atracao_serializer import (
    OrdemApresentacaoAtracaoSerializer,
)


class SessaoSerializer(serializers.ModelSerializer):
    espaco_display = EspacoSerializer(source="espaco", read_only=True)

    ordem_apresentacoes_display = OrdemApresentacaoAtracaoSerializer(
        source="ordem_apresentacoes",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Sessao
        fields = [
            "id",
            "evento",
            "espaco",
            "espaco_display",
            "atracoes",
            "ordem_apresentacoes_display",
            "nome",
            "data_horario_inicio",
            "data_horario_fim",
            "publicado_em",
            "ativo",
        ]
