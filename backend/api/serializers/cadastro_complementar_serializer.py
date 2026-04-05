from django.contrib.auth.models import User
from rest_framework import serializers

from api.enumerations.area_conhecimento import AreaConhecimento
from api.enumerations.nivel_ensino import NivelEnsino


class CadastroComplementarSerializer(serializers.Serializer):
    usuario_id = serializers.IntegerField()
    nivel_ensino = serializers.ChoiceField(choices=NivelEnsino.choices)
    area_conhecimento = serializers.ChoiceField(choices=AreaConhecimento.choices)

    def validate_usuario_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Usuário não encontrado.")
        return value

    def save(self):
        # TODO: A parte de salvar está mal feita precisa refinar as validações e o processo de salvar os dados do usuário, no momento apenas retorna o usuário para o frontend
        data = self.validated_data
        user = User.objects.get(id=data["usuario_id"])
        return user
