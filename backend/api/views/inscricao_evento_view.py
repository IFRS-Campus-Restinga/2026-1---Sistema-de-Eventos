from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.status_inscricao import StatusInscricao
from ..enumerations.tipo_etapa import TipoEtapa
from ..models.inscricao_evento import InscricaoEvento
from ..models.perfil import Perfil
from ..serializers import InscricaoEventoSerializer


class InscricaoEventoListView(APIView):
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


class MinhasInscricoesEventoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            perfil = Perfil.objects.get(usuario=request.user)
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        inscricoes_eventos = InscricaoEvento.objects.filter(perfil=perfil)
        serializer = InscricaoEventoSerializer(inscricoes_eventos, many=True)
        return Response(serializer.data)


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

    def post(self, request, pk=None):
        evento_id = pk

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
            return Response({"msg": "Presença já registrada"}, status=200)

        inscricao.presente = True
        inscricao.save(update_fields=["presente"])

        return Response({"msg": "Presença registrada com sucesso"}, status=200)


class CancelarInscricaoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        inscricao_id = pk

        if not inscricao_id:
            return Response({"erro": "inscricao_id é obrigatório."}, status=400)

        try:
            inscricao = InscricaoEvento.objects.get(pk=inscricao_id)
        except InscricaoEvento.DoesNotExist:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        try:
            perfil = Perfil.objects.get(usuario=request.user)
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        # Verifica se é admin/coordenador ou se é o próprio perfil
        grupos_usuario = [
            g.name if hasattr(g, "name") else g for g in request.user.groups.all()
        ]
        cargo_superior = (
            "Administrador" in grupos_usuario or "Coordenador" in grupos_usuario
        )
        proprio_perfil = inscricao.perfil_id == perfil.id

        if not (cargo_superior or proprio_perfil):
            return Response(
                {"erro": "Você não tem permissão para cancelar esta inscrição"},
                status=403,
            )

        if inscricao.status == StatusInscricao.CANCELADA:
            return Response({"erro": "Esta inscrição já foi cancelada"}, status=400)

        # Verifica se a etapa de inscrições está aberta
        evento = inscricao.evento
        etapa_inscricao = evento.etapas.filter(
            tipo_etapa=TipoEtapa.INSCRICAO_PUBLICO
        ).first()

        if not etapa_inscricao:
            return Response(
                {
                    "erro": "Evento sem período de inscrição configurado. Contate o organizador."
                },
                status=400,
            )

        now = timezone.now()
        if not (etapa_inscricao.data_inicio <= now <= etapa_inscricao.data_fim):
            return Response(
                {
                    "erro": "O período de inscrições para este evento já foi encerrado. Não é possível cancelar."
                },
                status=400,
            )

        inscricao.status = StatusInscricao.CANCELADA
        inscricao.save(update_fields=["status"])

        return Response({"msg": "Inscrição cancelada com sucesso"}, status=200)
