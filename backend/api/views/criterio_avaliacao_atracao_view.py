from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.criterio_avaliacao_atracao import CriterioAvaliacaoAtracao
from ..serializers import CriterioAvaliacaoAtracaoSerializer
from .perms_generic_view import PodeGerenciarCriterioAvaliacaoAtracao


class CriterioAvaliacaoAtracaoListView(APIView):
    queryset = CriterioAvaliacaoAtracao.objects.all()
    serializer_class = CriterioAvaliacaoAtracaoSerializer
    permission_classes = [PodeGerenciarCriterioAvaliacaoAtracao]

    def get_serializer(self, *args, **kwargs):
        return CriterioAvaliacaoAtracaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        criterios = CriterioAvaliacaoAtracao.objects.all()
        serializer = CriterioAvaliacaoAtracaoSerializer(criterios, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = CriterioAvaliacaoAtracaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CriterioAvaliacaoAtracaoDetailView(APIView):
    permission_classes = [PodeGerenciarCriterioAvaliacaoAtracao]

    def get_object(self, pk):
        try:
            return CriterioAvaliacaoAtracao.objects.get(pk=pk)
        except CriterioAvaliacaoAtracao.DoesNotExist:
            return None

    def get(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "CriterioAvaliacaoAtracao não encontrado"},
                status=404,
            )

        serializer = CriterioAvaliacaoAtracaoSerializer(criterio)
        return Response(serializer.data)

    def put(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "CriterioAvaliacaoAtracao não encontrado"},
                status=404,
            )

        serializer = CriterioAvaliacaoAtracaoSerializer(criterio, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "CriterioAvaliacaoAtracao não encontrado"},
                status=404,
            )

        criterio.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
