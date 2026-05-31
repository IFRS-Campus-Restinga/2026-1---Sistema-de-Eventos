from rest_framework import serializers

from ..models.autoria import Autoria


class AutoriaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)
    usuario_nome = serializers.SerializerMethodField()
    nome = serializers.SerializerMethodField()

    def get_usuario_nome(self, obj):
        usuario = getattr(obj, "usuario", None)
        if not usuario:
            return ""

        return (
            getattr(usuario, "nome", None)
            or getattr(usuario, "name", None)
            or getattr(usuario, "username", None)
            or str(getattr(usuario, "id", ""))
        )

    def get_nome(self, obj):
        return self.get_usuario_nome(obj)

    class Meta:
        model = Autoria
        fields = [
            "id",
            "ordem",
            "tipo",
            "tipo_display",
            "usuario",
            "usuario_nome",
            "nome",
            "submissao",
        ]
