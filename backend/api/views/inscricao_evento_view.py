from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.inscricao_evento import InscricaoEvento
from ..serializers import InscricaoEventoSerializer


class InscricaoEventoListView(APIView):
    queryset = InscricaoEvento.objects.all()
    serializer_class = InscricaoEventoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return InscricaoEventoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        inscricoes_eventos = InscricaoEvento.objects.all()
        serializer = InscricaoEventoSerializer(inscricoes_eventos, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = InscricaoEventoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InscricaoEventoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return InscricaoEvento.objects.get(pk=pk)
        except InscricaoEvento.DoesNotExist:
            return None

    def get(self, request, pk):
        inscricao_evento = self.get_object(pk)
        if not inscricao_evento:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        serializer = InscricaoEventoSerializer(inscricao_evento)
        return Response(serializer.data)

    def put(self, request, pk):
        inscricao_evento = self.get_object(pk)
        if not inscricao_evento:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        serializer = InscricaoEventoSerializer(inscricao_evento, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        inscricao_evento = self.get_object(pk)
        if not inscricao_evento:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        InscricaoEvento.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
