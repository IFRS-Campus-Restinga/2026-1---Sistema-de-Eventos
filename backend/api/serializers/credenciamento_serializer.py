from rest_framework import serializers
from ..models.credenciamento import Credenciamento


class CredenciamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credenciamento
        fields = ['id', 'usuario', 'evento', 'perfil_participacao', 'instituicao_curso',]


class CredenciamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credenciamento
        fields = ["id", "usuario", "perfil_participacao"]
        read_only_fields = ["id", "usuario"]

    def create(self, validated_data):
        instance = Credenciamento(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance
