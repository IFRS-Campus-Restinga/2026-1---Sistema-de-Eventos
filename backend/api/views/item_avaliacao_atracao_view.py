from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.item_avaliacao_atracao import ItemAvaliaçãoAtracao
from ..serializers import ItemAvaliaçãoAtracaoSerializer


class ItemAvaliaçãoAtracaoListView(APIView):
    queryset = ItemAvaliaçãoAtracao.objects.all()
    serializer_class = ItemAvaliaçãoAtracaoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return ItemAvaliaçãoAtracaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        items = ItemAvaliaçãoAtracao.objects.all()
        serializer = ItemAvaliaçãoAtracaoSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = ItemAvaliaçãoAtracaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemAvaliaçãoAtracaoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return ItemAvaliaçãoAtracao.objects.get(pk=pk)
        except ItemAvaliaçãoAtracao.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliaçãoAtracao não encontrado"},
                status=404,
            )

        serializer = ItemAvaliaçãoAtracaoSerializer(item)
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliaçãoAtracao não encontrado"},
                status=404,
            )

        serializer = ItemAvaliaçãoAtracaoSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliaçãoAtracao não encontrado"},
                status=404,
            )

        item.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
