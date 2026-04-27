from rest_framework import serializers

from ..enumerations.status_evento import StatusEvento
from ..models.evento import Evento
from ..models.inscricao_evento import InscricaoEvento
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

    def validate(self, attrs):
        perfil = attrs.get("perfil") or getattr(self.instance, "perfil", None)
        evento = attrs.get("evento") or getattr(self.instance, "evento", None)

        if perfil and evento:
            inscricao_existente = InscricaoEvento.objects.filter(
                perfil=perfil,
                evento=evento,
            )

            if self.instance is not None:
                inscricao_existente = inscricao_existente.exclude(pk=self.instance.pk)

            if inscricao_existente.exists():
                raise serializers.ValidationError(
                    {"mensagem": ["Este perfil ja esta inscrito neste evento."]}
                )

            if evento.status_evento != StatusEvento.INSCRICOES_ABERTAS:
                raise serializers.ValidationError(
                    {"mensagem": ["Inscrições ainda não estão abertas."]}
                )

        return attrs

    def create(self, validated_data):
        instance = InscricaoEvento(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance

    class Meta:
        model = InscricaoEvento
        fields = [
            "id",
            "status",
            "data_hora",
            "perfil_id",
            "evento_id",
        ]
