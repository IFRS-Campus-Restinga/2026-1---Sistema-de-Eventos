from rest_framework import serializers
from ..models.evento import Evento
from ..models.local import Local
from .local_serializer import LocalSerializer


class EventoSerializer(serializers.ModelSerializer):
    local = LocalSerializer(read_only=True)
    local_id = serializers.PrimaryKeyRelatedField(
        queryset=Local.objects.all(),
        source="local",
    )

    class Meta:
        model = Evento
        fields = [
            "id",
            "nome",
            "descricao",
            "status_evento",
            "carga_horaria",
            "setor",
            "tema",
            "local",
            "local_id",
        ]
