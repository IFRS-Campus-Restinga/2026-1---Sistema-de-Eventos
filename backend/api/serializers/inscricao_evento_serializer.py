from rest_framework import serializers

from ..models.inscricao_evento import InscricaoEvento
from ..models.evento import Evento
from ..models.perfil import Perfil


class InscricaoEventoSerializer(serializers.ModelSerializer):
    perfil_id = serializers.PrimaryKeyRelatedField(
        queryset=Perfil.objects.all(),
        source="perfil",
    )
    evento_id = serializers.PrimaryKeyRelatedField(
        queryset=Evento.objects.all(),
        source="evento",
    )

    class Meta:
        model = InscricaoEvento
        fields = [
            "id",
            "status",
            "data_hora",
            "perfil_id",
            "evento_id",
        ]
