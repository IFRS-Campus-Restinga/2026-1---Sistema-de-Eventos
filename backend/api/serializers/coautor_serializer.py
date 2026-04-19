from rest_framework import serializers
from ..models.coautor import Coautor


class CoautorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coautor
        fields = ['id', 'nome', 'instituicao_curso', 'funcao']
