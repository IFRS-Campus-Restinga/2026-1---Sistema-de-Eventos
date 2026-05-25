from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.ordem_apresentacao_atracao import OrdemApresentacaoAtracao
from ..serializers import OrdemApresentacaoAtracaoSerializer
from .perms_generic_view import IsAdmin


class OrdemApresentacaoAtracaoListView(APIView):
    queryset = OrdemApresentacaoAtracao.objects.all()
    serializer_class = OrdemApresentacaoAtracaoSerializer
    permission_classes = [IsAdmin]


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
