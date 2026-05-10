from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


def validar_novo_perfil(hub_id):
    user = User.objects.filter(hub_id=hub_id).first()

    if not user:
        raise serializers.ValidationError(
            {"mensagem": "Usuário autenticado não encontrado na base de dados."}
        )

    if hasattr(user, "perfil"):
        raise serializers.ValidationError(
            {"mensagem": "Este usuário já possui um perfil cadastrado."}
        )

    return user
