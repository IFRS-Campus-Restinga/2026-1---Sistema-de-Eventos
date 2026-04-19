from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.cronograma import Cronograma
from ..models.evento import Evento
from ..serializers.cronograma_serializer import CronogramaSerializer


class CronogramaListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cronogramas = Cronograma.objects.all()
        serializer = CronogramaSerializer(cronogramas, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CronogramaSerializer(data=request.data)
        if serializer.is_valid():
            # Verificar se o evento existe
            evento_id = request.data.get("evento")
            try:
                evento = Evento.objects.get(id=evento_id)
                cronograma = serializer.save(evento=evento)
                return Response(
                    CronogramaSerializer(cronograma).data,
                    status=status.HTTP_201_CREATED,
                )
            except Evento.DoesNotExist:
                return Response(
                    {"error": "Evento não encontrado"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CronogramaDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            cronograma = Cronograma.objects.get(pk=pk)
            serializer = CronogramaSerializer(cronograma)
            return Response(serializer.data)
        except Cronograma.DoesNotExist:
            return Response(
                {"error": "Cronograma não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, pk):
        try:
            cronograma = Cronograma.objects.get(pk=pk)
            serializer = CronogramaSerializer(cronograma, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Cronograma.DoesNotExist:
            return Response(
                {"error": "Cronograma não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            cronograma = Cronograma.objects.get(pk=pk)
            cronograma.delete()
            return Response(
                {"message": "Cronograma deletado com sucesso"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Cronograma.DoesNotExist:
            return Response(
                {"error": "Cronograma não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )
