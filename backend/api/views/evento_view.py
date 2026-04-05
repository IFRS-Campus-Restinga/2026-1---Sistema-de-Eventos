from rest_framework.views import APIView
from ..serializers.evento_serializer import EventoSerializer
from ..models.evento import Evento
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny


class EventoListView(APIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [AllowAny]
    
    def get(self,request):
        eventos = Evento.objects.all()
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data)
    
    def post(self,request):
        serializer = EventoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    