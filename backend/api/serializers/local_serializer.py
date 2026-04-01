from rest_framework import serializers
from ..models.local import Local


class LocalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Local
        fields = ['nome', 'endereco']
