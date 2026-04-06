from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..serializers.evento_serializer import EventoSerializer
from ..models.evento import Evento
from api.permissions import IsAdminOrCoordenador, PodeGerenciarEvento


class EventoListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        eventos = Evento.objects.filter(ativo=True)
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EventoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventoDetailView(APIView):
    permission_classes = [PodeGerenciarEvento]

    def get(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)

            self.check_object_permissions(request, evento)

            serializer = EventoSerializer(evento)
            return Response(serializer.data)

        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)


class EventoUpdateView(APIView):
    permission_classes = [IsAdminOrCoordenador]

    def put(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)

            serializer = EventoSerializer(evento, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            return Response(serializer.errors, status=400)

        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)


class EventoDeleteView(APIView):
    permission_classes = [IsAdminOrCoordenador]

    def delete(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)

            evento.ativo = False
            evento.save()

            return Response({"msg": "Evento desativado com sucesso"}, status=200)

        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)