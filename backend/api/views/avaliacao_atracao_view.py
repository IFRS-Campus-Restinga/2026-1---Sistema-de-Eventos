from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.tipo_etapa import TipoEtapa
from ..models.atracao import Atracao
from ..models.avaliacao_atracao import AvaliacaoAtracao
from ..models.etapa_evento import EtapaEvento
from ..serializers import AvaliacaoAtracaoSerializer
from .perms_generic_view import PodeVerAvaliacaoAtracao


class AvaliacaoAtracaoListView(APIView):
    queryset = AvaliacaoAtracao.objects.all()
    serializer_class = AvaliacaoAtracaoSerializer
    permission_classes = [PodeVerAvaliacaoAtracao]

    def get_serializer(self, *args, **kwargs):
        return AvaliacaoAtracaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        # checar permissão geral (autenticação)
        self.check_permissions(request)

        criterios = AvaliacaoAtracao.objects.all()
        atracao_id = request.query_params.get("atracao")
        mine = request.query_params.get("mine")

        if atracao_id:
            criterios = criterios.filter(atracao_id=atracao_id)

        if mine in ("1", "true", "True", "sim", "yes"):
            if not request.user or not request.user.is_authenticated:
                return Response({"erro": "Autenticação requerida"}, status=401)
            criterios = criterios.filter(avaliador=request.user)

        else:
            # avaliadores vejam apenas suas próprias avaliações; coordenador/administrador veem todas
            user = request.user
            if not (user and user.is_authenticated):
                return Response({"erro": "Autenticação requerida"}, status=401)

            is_admin_or_coordenador = (
                user.is_superuser
                or user.groups.filter(
                    name__in=["Administrador", "Coordenador"]
                ).exists()
            )
            if not is_admin_or_coordenador:
                criterios = criterios.filter(avaliador=user)

        serializer = AvaliacaoAtracaoSerializer(criterios, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        # exige usuário autenticado e permissão para avaliar a atração
        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        atracao_id = dados.get("atracao")
        if not atracao_id:
            return Response({"erro": "Campo atracao é obrigatório"}, status=400)

        try:
            atracao = Atracao.objects.get(pk=atracao_id)
        except Atracao.DoesNotExist:
            return Response({"erro": "Atração não encontrada"}, status=404)

        if not request.user.has_perm("api.avaliar_atracao", atracao):
            return Response(
                {"erro": "Usuário não tem permissão para avaliar esta atração"},
                status=403,
            )

        # verificar se a etapa de realização do evento está aberta
        agora = timezone.now()
        etapa_realizacao = EtapaEvento.objects.filter(
            evento=atracao.evento,
            tipo_etapa=TipoEtapa.REALIZACAO_EVENTO,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_realizacao:
            return Response(
                {"erro": "Período de realização do evento não está aberto"}, status=400
            )

        serializer = AvaliacaoAtracaoSerializer(
            data=dados, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvaliacaoAtracaoDetailView(APIView):
    permission_classes = [PodeVerAvaliacaoAtracao]

    def get_object(self, pk):
        try:
            return AvaliacaoAtracao.objects.get(pk=pk)
        except AvaliacaoAtracao.DoesNotExist:
            return None

    def get(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "AvaliacaoAtracao não encontrado"},
                status=404,
            )

        # checar permissão de objeto (vai permitir admin/coordenador ou avaliador dono)
        self.check_object_permissions(request, criterio)

        serializer = AvaliacaoAtracaoSerializer(criterio)
        return Response(serializer.data)

    def put(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "AvaliacaoAtracao não encontrado"},
                status=404,
            )

        # exige usuário autenticado e permissão para avaliar a atração
        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        # checar permissão de objeto (admin/coordenador ou avaliador dono) antes de permitir edição
        self.check_object_permissions(request, criterio)

        if not request.user.has_perm("api.avaliar_atracao", criterio.atracao):
            return Response(
                {"erro": "Usuário não tem permissão para avaliar esta atração"},
                status=403,
            )

        # verificar se a etapa de realização do evento está aberta
        agora = timezone.now()
        etapa_realizacao = EtapaEvento.objects.filter(
            evento=criterio.atracao.evento,
            tipo_etapa=TipoEtapa.REALIZACAO_EVENTO,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_realizacao:
            return Response(
                {"erro": "Período de realização do evento não está aberto"}, status=400
            )

        serializer = AvaliacaoAtracaoSerializer(
            criterio, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        criterio = self.get_object(pk)
        if not criterio:
            return Response(
                {"erro": "AvaliacaoAtracao não encontrado"},
                status=404,
            )

        # checar permissão de objeto antes de deletar
        self.check_object_permissions(request, criterio)

        criterio.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
