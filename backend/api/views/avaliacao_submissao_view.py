from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.avaliacao_submissao import AvaliacaoSubmissao
from ..serializers.avaliacao_submissao_serializer import AvaliacaoSubmissaoSerializer


class AvaliacaoSubmissaoListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        atracao_id = request.query_params.get("atracao")
        avaliacoes = AvaliacaoSubmissao.objects.all()
        if atracao_id:
            avaliacoes = avaliacoes.filter(atracao_id=atracao_id)
        serializer = AvaliacaoSubmissaoSerializer(avaliacoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AvaliacaoSubmissaoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvaliacaoSubmissaoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return AvaliacaoSubmissao.objects.get(pk=pk)
        except AvaliacaoSubmissao.DoesNotExist:
            return None

    def get(self, request, pk):
        avaliacao = self.get_object(pk)
        if avaliacao is None:
            return Response(
                {"detail": "Avaliação não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AvaliacaoSubmissaoSerializer(avaliacao)
        return Response(serializer.data)

    def put(self, request, pk):
        avaliacao = self.get_object(pk)
        if avaliacao is None:
            return Response(
                {"detail": "Avaliação não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AvaliacaoSubmissaoSerializer(avaliacao, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        avaliacao = self.get_object(pk)
        if avaliacao is None:
            return Response(
                {"detail": "Avaliação não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        avaliacao.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
