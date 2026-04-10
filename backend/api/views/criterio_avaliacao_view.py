from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.criterio_avaliacao import CriterioAvaliacao
from ..serializers import CriterioAvaliacaoSerializer


class CriterioAvaliacaoListView(APIView):
    queryset = CriterioAvaliacao.objects.all()
    serializer_class = CriterioAvaliacaoSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        criterios = CriterioAvaliacao.objects.all()
        serializer = CriterioAvaliacaoSerializer(criterios, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = CriterioAvaliacaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CriterioAvaliacaoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return CriterioAvaliacao.objects.get(pk=pk)
        except CriterioAvaliacao.DoesNotExist:
            return None

    def get(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response({"erro": "CriterioAvaliacao não encontrado"}, status=404)

        serializer = CriterioAvaliacaoSerializer(criterio)
        return Response(serializer.data)

    def put(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response({"erro": "CriterioAvaliacao não encontrado"}, status=404)

        serializer = CriterioAvaliacaoSerializer(criterio, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response({"erro": "CriterioAvaliacao não encontrado"}, status=404)

        criterio.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
