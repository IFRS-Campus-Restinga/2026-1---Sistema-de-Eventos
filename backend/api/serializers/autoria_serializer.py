from rest_framework import serializers

from ..models.autoria import Autoria


class AutoriaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)

    class Meta:
        model = Autoria
        fields = ["id", "ordem", "tipo", "tipo_display", "usuario", "submissao"]
