from django.utils import timezone
from rest_framework import serializers

from ..enumerations.tipo_etapa import TipoEtapa
from ..models.evento import Evento
from ..models.inscricao_evento import InscricaoEvento
from ..models.perfil import Perfil


class InscricaoEventoSerializer(serializers.ModelSerializer):
    # para fins de criar uma lista mais bonitinha
    perfil_usuario_nome = serializers.CharField(
        source="perfil.usuario.nome", read_only=True
    )

    perfil_usuario_id = serializers.IntegerField(
        source="perfil.usuario.id", read_only=True
    )
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
        now = timezone.now()

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

            # Busca APENAS a etapa de inscrição pública
            etapas_relacionadas = getattr(evento, "etapas", None)
            etapa = None

            if etapas_relacionadas is not None:
                # Inscrição só é permitida se INSCRICAO_PUBLICO está configurada
                etapa = etapas_relacionadas.filter(
                    tipo_etapa=TipoEtapa.INSCRICAO_PUBLICO
                ).first()

            if etapa is None:
                raise serializers.ValidationError(
                    {
                        "mensagem": [
                            "Evento sem período de inscrição (INSCRICAO_PUBLICO) configurado."
                        ]
                    }
                )

            # Valida sempre o intervalo de inscrição
            inicio = getattr(etapa, "data_inicio", None)
            fim = getattr(etapa, "data_fim", None)

            if not (inicio and fim):
                raise serializers.ValidationError(
                    {
                        "mensagem": [
                            "Período de inscrições não está configurado para este evento."
                        ]
                    }
                )

            if not (inicio <= now <= fim):
                raise serializers.ValidationError(
                    {
                        "mensagem": [
                            "Inscrição não concluída, o evento não está com as inscrições abertas."
                        ]
                    }
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
            "perfil_usuario_nome",
            "perfil_usuario_id",
            "perfil_id",
            "evento_id",
            "presente",
        ]
