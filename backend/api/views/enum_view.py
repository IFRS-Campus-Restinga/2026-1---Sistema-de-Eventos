from django.db.models import IntegerChoices, TextChoices
from rest_framework.response import Response
from rest_framework.views import APIView


# View reutilizavel para listar enums simples como o enum TipoDado
class EnumChoicesAPIView(APIView):
    enum_class = None

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
