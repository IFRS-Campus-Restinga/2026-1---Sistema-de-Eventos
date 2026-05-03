from rest_framework import serializers

from ..models.campo_formulario import CampoFormulario


class CampoFormularioSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        instance = CampoFormulario(**validated_data)
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
        model = CampoFormulario
        fields = ["id", "nome", "tipo_dado", "obrigatorio", "modalidade"]
