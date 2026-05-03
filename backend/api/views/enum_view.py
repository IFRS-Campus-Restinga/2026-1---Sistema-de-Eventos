from django.db.models import IntegerChoices, TextChoices
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated


# View reutilizavel para listar enums simples como o enum TipoDado
class EnumChoicesAPIView(APIView):
    enum_class = None

    # Camada de segurança para garantir que apenas requisições GET sejam permitidas
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]  # para requisição GET sempre será AllowAny
        return [
            IsAuthenticated()
        ]  # para qualquer requisição que não seja GET sempre bloqueará

    def get(self, request):
        if not self.enum_class:
            return Response({"erro": "Enum não definido"}, status=400)

        if not issubclass(self.enum_class, (TextChoices, IntegerChoices)):
            return Response({"erro": "Enum inválido"}, status=400)

        dados = [
            {
                "value": campo.value,
                "label": campo.label,
            }
            for campo in self.enum_class
        ]

        return Response(dados)
