from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from ..models.etapa_evento import EtapaEvento
from ..models.evento import Evento
from .local_serializer import LocalSerializer


class EtapaEventoSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = EtapaEvento
        fields = [
            "id",
            "tipo_etapa",
            "data_inicio",
            "data_fim",
        ]
        extra_kwargs = {
            'evento': {'required': False, 'allow_null': True}
        }

    def get_evento(self, obj):
        evento = obj.evento

        if not evento:
            return None

        return {
            "id": evento.id,
            "nome": evento.nome,
            "tema": evento.tema,
            "status_evento": evento.status_evento,
            "local": LocalSerializer(evento.local).data if evento.local else None,
        }

    def validate(self, data):
            errors = {}
            data_inicio = data.get("data_inicio")
            data_fim = data.get("data_fim")
            tipo_etapa = data.get("tipo_etapa")
            evento = data.get("evento") # Isso virá do 'source="evento"' (evento_id)

            # 1. Validação de Cronologia
            if data_inicio and data_fim:
                if data_fim <= data_inicio:
                    errors["data_fim"] = _("A data de fim deve ser posterior à data de início.")

            # 2. Validação de Duplicidade (Apenas se o evento já existir)
            # Se for uma criação nova aninhada, 'evento' será None e pulamos isso.
            if tipo_etapa and evento:
                etapa_existente = EtapaEvento.objects.filter(tipo_etapa=tipo_etapa, evento=evento)
                if self.instance:
                    etapa_existente = etapa_existente.exclude(pk=self.instance.pk)
                
                if etapa_existente.exists():
                    errors["tipo_etapa"] = _("Já existe uma etapa deste tipo configurada para este evento.")

            if errors:
                raise serializers.ValidationError(errors)

            return data
