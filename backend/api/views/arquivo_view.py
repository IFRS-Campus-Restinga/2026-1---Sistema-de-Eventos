from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.arquivo import Arquivo
from ..serializers.arquivo_serializer import ArquivoSerializer


class ArquivoListView(APIView):
    queryset = Arquivo.objects.all()
    serializer_class = ArquivoSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        arquivos = Arquivo.objects.all()
        serializer = ArquivoSerializer(arquivos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ArquivoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
