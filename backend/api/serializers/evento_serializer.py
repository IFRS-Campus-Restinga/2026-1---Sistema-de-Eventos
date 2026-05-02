from rest_framework import serializers

from ..models.evento import Evento
from ..models.local import Local
from ..models.modalidade import Modalidade
from .local_serializer import LocalSerializer


class EventoSerializer(serializers.ModelSerializer):
    local = LocalSerializer(read_only=True)
    local_id = serializers.PrimaryKeyRelatedField(
        queryset=Local.objects.all(),
        source="local",
        write_only=True,
        required=True,
    )
    etapas = serializers.SerializerMethodField()
    modalidades = serializers.SerializerMethodField()
    modalidade_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Modalidade.objects.all(),
        source="modalidades",
        write_only=True,
        required=False,
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
            "etapas",
            "modalidades",
            "modalidade_ids",
        ]

    def get_etapas(self, obj):
        from .etapa_evento_serializer import EtapaEventoSerializer

        etapas = obj.etapas.all().order_by("data_inicio")
        return EtapaEventoSerializer(etapas, many=True).data

    def get_modalidades(self, obj):
        modalidades = obj.modalidades.all()
        return list(modalidades.values_list("id", flat=True))
