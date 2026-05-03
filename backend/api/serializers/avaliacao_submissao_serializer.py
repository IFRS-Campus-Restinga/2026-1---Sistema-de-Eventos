from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from ..models.avaliacao_submissao import AvaliacaoSubmissao
from ..models.atracao import Atracao

User = get_user_model()


class AvaliacaoSubmissaoSerializer(serializers.ModelSerializer):
    """Serializer para Avaliação de Submissões"""

    avaliador = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )
    avaliador_nome = serializers.SerializerMethodField()
    submissao_titulo = serializers.ReadOnlyField(source="submissao.titulo")
    submissao_evento = serializers.ReadOnlyField(source="submissao.evento.id")

    class Meta:
        model = AvaliacaoSubmissao
        fields = [
            "id",
            "avaliador",
            "avaliador_nome",
            "submissao",
            "submissao_titulo",
            "submissao_evento",
            "status_aprovacao",
            "nota",
            "comentarios",
            "data_avaliacao",
            "ativo",
        ]

    def validate(self, data):
        """
        Executa a validação completa do modelo, incluindo o método clean().
        """
        # Criamos uma instância temporária para rodar o full_clean
        instance = AvaliacaoSubmissao(**data)
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data

    def get_avaliador_nome(self, obj):
        if not obj.avaliador:
            return None
        return obj.avaliador.get_full_name() or obj.avaliador.username

    def create(self, validated_data):
        instance = AvaliacaoSubmissao(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.full_clean()
        instance.save()
        return instance
