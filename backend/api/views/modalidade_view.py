from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.modalidade import Modalidade
from ..serializers import ModalidadeSerializer


class ModalidadeListView(APIView):
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        modalidades = Modalidade.objects.all()
        serializer = ModalidadeSerializer(modalidades, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = ModalidadeSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModalidadeDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Modalidade.objects.get(pk=pk)
        except Modalidade.DoesNotExist:
            return None

    def get(self, request, pk):
        modalidade = self.get_object(pk)
        if not modalidade:
            return Response({"erro": "modalidade não encontrada"}, status=404)

        serializer = ModalidadeSerializer(modalidade)
        return Response(serializer.data)

    def put(self, request, pk):
        modalidade = self.get_object(pk)
        if not modalidade:
            return Response({"erro": "Modalidade não encontrada"}, status=404)

        serializer = ModalidadeSerializer(modalidade, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        modalidade = self.get_object(pk)
        if not modalidade:
            return Response({"erro": "Modalidade não encontrada"}, status=404)

        modalidade.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
