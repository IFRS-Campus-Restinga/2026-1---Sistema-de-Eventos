from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.criterio_avaliacao_submissao import CriterioAvaliacaoSubmissao
from ..serializers import CriterioAvaliacaoSubmissaoSerializer
from .perms_generic_view import PodeGerenciarCriterioAvaliacaoSubmissao


class CriterioAvaliacaoSubmissaoListView(APIView):
    queryset = CriterioAvaliacaoSubmissao.objects.all()
    serializer_class = CriterioAvaliacaoSubmissaoSerializer
    permission_classes = [PodeGerenciarCriterioAvaliacaoSubmissao]

    def get_serializer(self, *args, **kwargs):
        return CriterioAvaliacaoSubmissaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        criterios = CriterioAvaliacaoSubmissao.objects.all()
        serializer = CriterioAvaliacaoSubmissaoSerializer(criterios, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = CriterioAvaliacaoSubmissaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CriterioAvaliacaoSubmissaoDetailView(APIView):
    permission_classes = [PodeGerenciarCriterioAvaliacaoSubmissao]

    def get_object(self, pk):
        try:
            return CriterioAvaliacaoSubmissao.objects.get(pk=pk)
        except CriterioAvaliacaoSubmissao.DoesNotExist:
            return None

    def get(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "CriterioAvaliacaoSubmissao não encontrado"},
                status=404,
            )

        serializer = CriterioAvaliacaoSubmissaoSerializer(criterio)
        return Response(serializer.data)

    def put(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "CriterioAvaliacaoSubmissao não encontrado"},
                status=404,
            )

        serializer = CriterioAvaliacaoSubmissaoSerializer(criterio, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "CriterioAvaliacaoSubmissao não encontrado"},
                status=404,
            )

        criterio.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
