from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.credenciamento import Credenciamento
from ..serializers.credenciamento_serializer import CredenciamentoSerializer
from .perms_generic_view import PodeGerenciarConteudoAdministrativo
from rest_framework.permissions import AllowAny



class CredenciamentoListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = CredenciamentoListView.objects.all()

        serializer = CredenciamentoSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CredenciamentoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CredenciamentoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Credenciamento.objects.get(pk=pk)
        except Credenciamento.DoesNotExist:
            return None

    def get(self, request, pk):
        credenciamento = self.get_object(pk)
        if credenciamento is None:
            return Response({"erro": "Credencial nao encontrada."}, status=404)

        serializer = CredenciamentoSerializer(credenciamento)
        return Response(serializer.data)

    def put(self, request, pk):
        Credenciamento = self.get_object(pk)
        if Credenciamento is None:
            return Response({"erro": "Credencial nao encontrada."}, status=404)

        serializer = CredenciamentoSerializer(credenciamento, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        credenciamento = self.get_object(pk)
        if credenciamento is None:
            return Response({"erro": "Credencial nao encontrada."}, status=404)

        return Response(status=status.HTTP_204_NO_CONTENT)
