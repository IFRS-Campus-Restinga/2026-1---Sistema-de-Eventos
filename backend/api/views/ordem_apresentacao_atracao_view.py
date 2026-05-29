from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.ordem_apresentacao_atracao import OrdemApresentacaoAtracao
from ..serializers import OrdemApresentacaoAtracaoSerializer
from .perms_generic_view import IsAdmin


# ordem são salvas em lote / grupo se orientando pela sessao, logo salva todas as ordens de uma única sessao
class OrdemApresentacaoAtracaoListView(APIView):
    queryset = OrdemApresentacaoAtracao.objects.all()
    serializer_class = OrdemApresentacaoAtracaoSerializer
    permission_classes = [IsAdmin]

    def get(self, request):
        sessao_id = request.query_params.get("sessao")

        ordens = OrdemApresentacaoAtracao.objects.all()

        if sessao_id:
            ordens = ordens.filter(sessao_id=sessao_id)

        serializer = OrdemApresentacaoAtracaoSerializer(ordens, many=True)
        return Response(serializer.data)

    def post(self, request):
        # deleta tudo e recria
        sessao_id = request.data.get("sessao")
        ordens = request.data.get("ordens", [])

        with transaction.atomic():
            OrdemApresentacaoAtracao.objects.filter(sessao_id=sessao_id).delete()

            dados_serializer = [{"sessao": sessao_id, **ordem} for ordem in ordens]

            serializer = OrdemApresentacaoAtracaoSerializer(
                data=dados_serializer, many=True
            )

            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(serializer.data)

    """
    def post(self, request):
        # deleta todos e recria
        dados = request.data
        if not dados:
            return Response({"erro": "Nenhum dado enviado"}, status=400)

        sessao_id = dados[0]["sessao"]

        serializer = OrdemApresentacaoAtracaoSerializer(data=dados, many=True)

        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            # remove tudo da sessão
            OrdemApresentacaoAtracao.objects.filter(sessao_id=sessao_id).delete()
            # recria tudo
            serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    """


class OrdemApresentacaoAtracaoDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_object(self, pk):
        try:
            return OrdemApresentacaoAtracao.objects.get(pk=pk)
        except OrdemApresentacaoAtracao.DoesNotExist:
            return None

    def get(self, request, pk):
        ordem = self.get_object(pk)
        if not ordem:
            return Response(
                {"erro": "Sessão não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrdemApresentacaoAtracaoSerializer(ordem)
        return Response(serializer.data)

    """
    def put(self, request, pk):
        ordem = self.get_object(pk)
        if not ordem:
            return Response({"erro": "Sessão não encontrada"}, status=404)

        # Se houver permissões de objeto específicas, adicione aqui
        # self.check_object_permissions(request, sessao)

        serializer = OrdemApresentacaoAtracaoSerializer(ordem, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """
