from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.etapa_evento import EtapaEvento
from ..serializers.etapa_evento_serializer import EtapaEventoSerializer


class EtapaEventoListView(APIView):
    queryset = EtapaEvento.objects.all()
    serializer_class = EtapaEventoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return EtapaEventoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        etapas = EtapaEvento.objects.all()
        serializer = EtapaEventoSerializer(etapas, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = EtapaEventoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EtapaEventoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return EtapaEvento.objects.get(pk=pk)
        except EtapaEvento.DoesNotExist:
            return None

    def get(self, request, pk):
        etapa = self.get_object(pk)
        if not etapa:
            return Response({"erro": "EtapaEvento não encontrado"}, status=404)

        serializer = EtapaEventoSerializer(etapa)
        return Response(serializer.data)

    def put(self, request, pk):
        etapa = self.get_object(pk)
        if not etapa:
            return Response({"erro": "EtapaEvento não encontrado"}, status=404)

        serializer = EtapaEventoSerializer(etapa, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        etapa = self.get_object(pk)
        if not etapa:
            return Response({"erro": "EtapaEvento não encontrado"}, status=404)

        etapa.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
