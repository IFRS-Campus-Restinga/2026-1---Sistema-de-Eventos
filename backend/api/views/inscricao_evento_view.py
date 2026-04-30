from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.inscricao_evento import InscricaoEvento
from ..serializers import InscricaoEventoSerializer

from rest_framework.permissions import IsAuthenticated
from ..models.perfil import Perfil

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

class RegistrarPresencaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        evento_id = request.data.get('evento_id')

        if not evento_id:
            return Response({"erro": "evento_id é obrigatório."}, status=404)
        
        try:
            perfil = Perfil.objects.get(usuario=request.user)
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil nao encontrado"}, status=404)
        
        try:
            inscricao = InscricaoEvento.objects.get(perfil=perfil, evento_id=evento_id)
        except InscricaoEvento.DoesNotExist:
            return Response({"erro": "Inscrição nao encontrada"}, status=404)
        
        if inscricao.presente:
            return Response({"msg":"Presença já registrada"}, status=200)
        
        inscricao.presente = True
        inscricao.save(update_fields=['presente'])

        return Response({"msg":"Presença registrada com sucesso"}, status=200)
    