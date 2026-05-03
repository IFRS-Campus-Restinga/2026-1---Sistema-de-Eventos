from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.inscricao_atracao import InscricaoAtracao
from ..serializers.inscricao_atracao_serializer import InscricaoAtracaoSerializer


class InscricaoAtracaoListView(APIView):
    queryset = InscricaoAtracao.objects.all()
    serializer_class = InscricaoAtracaoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return InscricaoAtracaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        inscricoes = InscricaoAtracao.objects.all()
        serializer = InscricaoAtracaoSerializer(inscricoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InscricaoAtracaoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InscricaoAtracaoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return InscricaoAtracao.objects.get(pk=pk)
        except InscricaoAtracao.DoesNotExist:
            return None

    def get(self, request, pk):
        inscricao = self.get_object(pk)
        if not inscricao:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        serializer = InscricaoAtracaoSerializer(inscricao)
        return Response(serializer.data)

    def put(self, request, pk):
        inscricao = self.get_object(pk)
        if not inscricao:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        serializer = InscricaoAtracaoSerializer(inscricao, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        inscricao = self.get_object(pk)
        if not inscricao:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        inscricao.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
