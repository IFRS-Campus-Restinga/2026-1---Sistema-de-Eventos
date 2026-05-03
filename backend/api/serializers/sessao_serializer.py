from rest_framework import serializers

from ..models import Sessao


class SessaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sessao
        fields = "__all__"
