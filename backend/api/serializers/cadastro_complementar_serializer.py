from rest_framework import serializers
from api.enumerations.area_conhecimento_escolha import (
    AreaConhecimentoEscolha as AreaConhecimento,
)
from api.enumerations.nivel_ensino import NivelEnsino
from api.models.perfil import Perfil
from ..validators.cadastro_complementar_validator import validar_novo_perfil
from emails.services import enviar_email_boas_vindas


class CadastroComplementarSerializer(serializers.Serializer):
    nivel_ensino = serializers.ChoiceField(
        choices=NivelEnsino.choices,
        error_messages={
            "invalid_choice": "Por favor, selecione um nível de ensino válido.",
        },
    )

    area_conhecimento = serializers.ChoiceField(
        choices=AreaConhecimento.choices,
        error_messages={
            "invalid_choice": "Por favor, selecione uma área de conhecimento válida.",
        },
    )

    def validate(self, attrs):
        request = self.context.get("request")
        hub_id = request.session_payload.get("external_user_id")

        # Chama validação para o novo perfil ser criado.
        user = validar_novo_perfil(hub_id)

        # Usuário é empacotado(adicionado) junto com os dados do formulário.
        attrs["usuario_validado"] = user

        return attrs

    def create(self, validated_data):
        user = validated_data.pop("usuario_validado")
        perfil = Perfil.objects.create(
            usuario=user,
            nivel_ensino=validated_data["nivel_ensino"],
            area_conhecimento=validated_data["area_conhecimento"],
        )

        # Disparo da tarefa assíncrona após a garantia de salvamento
        enviar_email_boas_vindas(
            nome_usuario=user.first_name,
            sobrenome_usuario=user.last_name,
            email_usuario=user.email,
        )

        return perfil
