from rest_framework import serializers

from ..models.atracao import Atracao
from ..models.evento import Evento
from ..models.inscricao_atracao import InscricaoAtracao
from ..models.perfil import Perfil


class InscricaoAtracaoSerializer(serializers.ModelSerializer):
    perfil_usuario_id = serializers.IntegerField(
        source="perfil.usuario.id", read_only=True
    )
    perfil_id = serializers.PrimaryKeyRelatedField(
        queryset=Perfil.objects.all(),
        source="perfil",
    )
    atracao_id = serializers.PrimaryKeyRelatedField(
        queryset=Atracao.objects.all(),
        source="atracao",
    )
    evento_id = serializers.PrimaryKeyRelatedField(
        queryset=Evento.objects.all(),
        source="evento",
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        perfil = attrs.get("perfil") or getattr(self.instance, "perfil", None)
        atracao = attrs.get("atracao") or getattr(self.instance, "atracao", None)
        evento = attrs.get("evento") or getattr(self.instance, "evento", None)

        if atracao:
            evento_da_atracao = getattr(atracao, "evento", None)

            if evento is not None and evento_da_atracao is not None:
                if evento.id != evento_da_atracao.id:
                    raise serializers.ValidationError(
                        {
                            "evento_id": [
                                "O evento informado deve ser o mesmo evento da atração."
                            ]
                        }
                    )

            if evento is None:
                attrs["evento"] = evento_da_atracao

        if perfil and atracao:
            inscricao_existente = InscricaoAtracao.objects.filter(
                perfil=perfil,
                atracao=atracao,
            )

            if self.instance is not None:
                inscricao_existente = inscricao_existente.exclude(pk=self.instance.pk)

            if inscricao_existente.exists():
                raise serializers.ValidationError(
                    {"mensagem": ["Este perfil já está inscrito nesta atração."]}
                )

        # Somente permitir inscrição em atracoes do tipo 'oficina'
        modalidade = getattr(atracao, "modalidade", None)
        modalidade_nome = (
            getattr(modalidade, "nome", "") if modalidade is not None else ""
        )
        if modalidade_nome and modalidade_nome.strip().lower() != "oficina":
            raise serializers.ValidationError(
                {
                    "atracao_id": [
                        "Inscrições somente são permitidas para atrações do tipo 'Oficina'."
                    ]
                }
            )

        return attrs

    def create(self, validated_data):
        instance = InscricaoAtracao(**validated_data)
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
        model = InscricaoAtracao
        fields = [
            "id",
            "status",
            "data_hora",
            "perfil_usuario_id",
            "perfil_id",
            "atracao_id",
            "evento_id",
            "presente",
        ]
