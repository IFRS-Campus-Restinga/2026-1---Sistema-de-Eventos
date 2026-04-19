from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from ..serializers.atracao_serializer import AtracaoSerializer
from ..models.atracao import Atracao


class AtracaoListView(APIView):
    """Lista todas as atrações e permite criar uma nova."""

    permission_classes = [AllowAny]

    def get(self, request):
        atracoes = Atracao.objects.all()
        serializer = AtracaoSerializer(atracoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AtracaoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AtracaoDetailView(APIView):
    """Recupera, atualiza ou remove uma atração específica."""

    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Atracao.objects.get(pk=pk)
        except Atracao.DoesNotExist:
            return None

    def get(self, request, pk):
        atracao = self.get_object(pk)
        if atracao is None:
            return Response({"detail": "Atração não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AtracaoSerializer(atracao)
        return Response(serializer.data)

    def put(self, request, pk):
        atracao = self.get_object(pk)
        if atracao is None:
            return Response({"detail": "Atração não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AtracaoSerializer(atracao, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        atracao = self.get_object(pk)
        if atracao is None:
            return Response({"detail": "Atração não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        atracao.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
