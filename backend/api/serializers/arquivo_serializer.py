from rest_framework import serializers
from ..models.arquivo import Arquivo


class ArquivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arquivo
        fields = "__all__"
