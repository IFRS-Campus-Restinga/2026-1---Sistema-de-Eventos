from rest_framework import serializers

from ..models.espaco import Espaco


class EspacoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Espaco
        fields = [
            "id",
            "nome",
            "capacidade",
            "predio_bloco",
            "recursos_disponiveis",
            "ativo",
            "local",
        ]
