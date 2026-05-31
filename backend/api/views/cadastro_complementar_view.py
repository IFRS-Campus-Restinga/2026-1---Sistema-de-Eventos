from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.enumerations.area_conhecimento_escolha import (
    AreaConhecimentoEscolha as AreaConhecimento,
)
from api.enumerations.nivel_ensino import NivelEnsino
from api.serializers.cadastro_complementar_serializer import (
    CadastroComplementarSerializer,
)
from eventos_session.permissions import HasValidSessionToken
from emails.services import enviar_email_boas_vindas


class CadastroComplementarView(APIView):
    authentication_classes = []  # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.

    def get_permissions(self):
        if (
            self.request.method == "GET"
        ):  # Se for Request "GET" é livre para ser chamado.
            return [AllowAny()]
        elif (
            self.request.method == "POST"
        ):  # Se for Request "POST" usa o validador de sessão do projeto.
            return [HasValidSessionToken()]
        return super().get_permissions()

    def get(self, request):  # Entrega todos os NivelEnsino e AreaConhecimento.
        niveis = [{"id": c[0], "name": c[1]} for c in NivelEnsino.choices]
        areas = [{"id": c[0], "name": c[1]} for c in AreaConhecimento.choices]
        return Response({"niveis": niveis, "areas": areas}, status=status.HTTP_200_OK)

    def post(self, request):  # Chama o serializer para fazer as validações
        serializer = CadastroComplementarSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():  # Executa o "save" se o serializer for válido.
            user = serializer.save()

            # Funções após tudo confirmado

            # Disparo Email Boas-Vindas
            enviar_email_boas_vindas(
                nome_usuario=user.usuario.first_name,
                sobrenome_usuario=user.usuario.last_name,
                email_usuario=user.usuario.email,
            )

            return Response(
                {"mensagem": "Dados atualizados!"}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
