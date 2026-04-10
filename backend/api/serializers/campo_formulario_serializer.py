from rest_framework import serializers

from ..models.campo_formulario import CampoFormulario


class CampoFormularioSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampoFormulario
        fields = ["id", "nome", "tipo_dado", "obrigatorio", "modalidade"]
