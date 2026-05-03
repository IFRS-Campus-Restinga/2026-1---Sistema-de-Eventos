from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.avaliacao_submissao import AvaliacaoSubmissao
from ..serializers.avaliacao_submissao_serializer import AvaliacaoSubmissaoSerializer


class AvaliacaoSubmissaoListView(APIView):
    """View para listar e criar avaliações de submissões"""

    queryset = AvaliacaoSubmissao.objects.all()
    serializer_class = AvaliacaoSubmissaoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return AvaliacaoSubmissaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        """Lista todas as avaliações, com filtros opcionais"""
        avaliacao = AvaliacaoSubmissao.objects.all()

        # Filtro por submissão
        submissao_id = request.query_params.get("submissao_id")
        if submissao_id:
            avaliacao = avaliacao.filter(submissao_id=submissao_id)

        # Filtro por avaliador
        avaliador_id = request.query_params.get("avaliador_id")
        if avaliador_id:
            avaliacao = avaliacao.filter(avaliador_id=avaliador_id)

        # Filtro por status
        status_filtro = request.query_params.get("status")
        if status_filtro:
            avaliacao = avaliacao.filter(status_aprovacao=status_filtro)

        serializer = AvaliacaoSubmissaoSerializer(avaliacao, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Cria uma nova avaliação"""
        dados = request.data
        serializer = AvaliacaoSubmissaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvaliacaoSubmissaoDetailView(APIView):
    """View para detalhe, atualização e exclusão de avaliações"""

    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return AvaliacaoSubmissao.objects.get(pk=pk)
        except AvaliacaoSubmissao.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retorna detalhes de uma avaliação específica"""
        avaliacao = self.get_object(pk)
        if not avaliacao:
            return Response(
                {"erro": "Avaliação não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = AvaliacaoSubmissaoSerializer(avaliacao)
        return Response(serializer.data)

    def put(self, request, pk):
        """Atualiza uma avaliação existente"""
        avaliacao = self.get_object(pk)
        if not avaliacao:
            return Response(
                {"erro": "Avaliação não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = AvaliacaoSubmissaoSerializer(avaliacao, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Deleta uma avaliação"""
        avaliacao = self.get_object(pk)
        if not avaliacao:
            return Response(
                {"erro": "Avaliação não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )

        avaliacao.delete()
        return Response(
            {"msg": "Avaliação deletada com sucesso"}, status=status.HTTP_204_NO_CONTENT
        )
