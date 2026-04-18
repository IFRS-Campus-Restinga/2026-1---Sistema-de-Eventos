from django.contrib.auth import get_user_model
from rest_framework import serializers

from api.enumerations.area_conhecimento import AreaConhecimento
from api.enumerations.nivel_ensino import NivelEnsino
from api.models.perfil import Perfil

User = get_user_model()


class CadastroComplementarSerializer(serializers.Serializer):
    nivel_ensino = serializers.ChoiceField(choices=NivelEnsino.choices)
    area_conhecimento = serializers.ChoiceField(choices=AreaConhecimento.choices)

    def save(self):
        data = self.validated_data
        request = self.context.get("request")

        # ID Payload do Token do usuário autenticado
        hub_id = request.session_payload.get("external_user_id")

        try:  # Pesquisa o usuário no banco
            user = User.objects.get(hub_id=hub_id)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                # caso não exista um usuario na HUB com esse id, retorna um erro.
                {"mensagem": "Usuário autenticado não encontrado na base de dados."}
            )

        # Verifica se o usuário já tem perfil
        if hasattr(user, "perfil"):
            raise serializers.ValidationError(
                {"mensagem": "Este usuário já possui um perfil cadastrado."}
            )

        # Persistencia do Perfil
        perfil = Perfil.objects.create(
            usuario=user,
            nivel_ensino=data["nivel_ensino"],
            area_conhecimento=data["area_conhecimento"],
        )

        return perfil
