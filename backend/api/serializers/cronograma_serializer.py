from rest_framework import serializers

from ..models.cronograma import Cronograma


class CronogramaSerializer(serializers.ModelSerializer):
    tipo_programacao_display = serializers.CharField(
        source="get_tipo_programacao_display", read_only=True
    )

    class Meta:
        model = Cronograma
        fields = [
            "id",
            "tipo_programacao",
            "tipo_programacao_display",
            "data_inicio",
            "data_fim",
            "ativo",
        ]
