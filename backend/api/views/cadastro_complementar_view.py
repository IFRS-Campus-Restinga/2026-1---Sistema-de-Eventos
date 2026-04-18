from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.enumerations.area_conhecimento import AreaConhecimento
from api.enumerations.nivel_ensino import NivelEnsino
from api.serializers.cadastro_complementar_serializer import (
    CadastroComplementarSerializer,
)
from eventos_session.permissions import HasValidSessionToken


class CadastroComplementarView(APIView):
    authentication_classes = []  # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        elif self.request.method == "POST":
            return [HasValidSessionToken()]  # validador customizado
        return super().get_permissions()

    def get(self, request):
        niveis = [{"id": c[0], "name": c[1]} for c in NivelEnsino.choices]
        areas = [{"id": c[0], "name": c[1]} for c in AreaConhecimento.choices]
        return Response({"niveis": niveis, "areas": areas}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CadastroComplementarSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"mensagem": "Dados atualizados!"}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
