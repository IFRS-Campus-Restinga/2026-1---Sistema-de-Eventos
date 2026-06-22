from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.tipo_etapa import TipoEtapa
from ..models.avaliacao_submissao import AvaliacaoSubmissao
from ..models.etapa_evento import EtapaEvento
from ..models.submissao import Submissao
from ..serializers.avaliacao_submissao_serializer import AvaliacaoSubmissaoSerializer
from .perms_generic_view import PodeVerAvaliacaoSubmissao


class AvaliacaoSubmissaoListView(APIView):
    queryset = AvaliacaoSubmissao.objects.all()
    serializer_class = AvaliacaoSubmissaoSerializer
    permission_classes = [PodeVerAvaliacaoSubmissao]

    def get_serializer(self, *args, **kwargs):
        return AvaliacaoSubmissaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        self.check_permissions(request)

        avaliacoes = AvaliacaoSubmissao.objects.all()
        submissao_id = request.query_params.get("submissao")
        mine = request.query_params.get("mine")

        if submissao_id:
            avaliacoes = avaliacoes.filter(submissao_id=submissao_id)

        # Filtro se o usuário quiser isolar estritamente o que é dele
        if mine in ("1", "true", "True", "sim", "yes"):
            if not request.user or not request.user.is_authenticated:
                return Response({"erro": "Autenticação requerida"}, status=401)
            avaliacoes = avaliacoes.filter(avaliador=request.user)
        else:
            # Segurança implícita: avaliadores sem privilégios administrativos
            # caem na filtragem forçada do seu próprio ID para evitar vazamento
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
                # usuários comuns podem ver avaliações que eles fizeram
                # e avaliações relacionadas às suas submissões (como autor/orientador)
                from django.db.models import Q

                avaliacoes = avaliacoes.filter(
                    Q(avaliador=user)
                    | Q(submissao__autorias__usuario=user)
                    | Q(submissao__orientador=user)
                ).distinct()

        serializer = AvaliacaoSubmissaoSerializer(avaliacoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        submissao_id = dados.get("submissao")
        if not submissao_id:
            return Response({"erro": "Campo submissao é obrigatório"}, status=400)

        try:
            submissao = Submissao.objects.get(pk=submissao_id)
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        # Validação do Guardian: O usuário logado recebeu permissão explícita para avaliar ESTA submissão?
        if not request.user.has_perm("api.avaliar_submissao", submissao):
            return Response(
                {
                    "erro": "Usuário não tem permissão de objeto para avaliar esta submissão"
                },
                status=403,
            )

        # Validação da Regra de Negócio Temporal: A etapa de Avaliação Prévia está vigente?
        agora = timezone.now()
        evento = getattr(submissao, "evento", None)
        etapa_avaliacao = EtapaEvento.objects.filter(
            evento=evento,
            tipo_etapa=TipoEtapa.AVALIACAO_PREVIA,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_avaliacao:
            return Response(
                {
                    "erro": "O período regulamentar de avaliação prévia para este evento não está aberto"
                },
                status=400,
            )

        serializer = AvaliacaoSubmissaoSerializer(
            data=dados, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvaliacaoSubmissaoDetailView(APIView):
    permission_classes = [PodeVerAvaliacaoSubmissao]

    def get_object(self, pk):
        try:
            return AvaliacaoSubmissao.objects.get(pk=pk)
        except AvaliacaoSubmissao.DoesNotExist:
            return None

    def get(self, request, pk):
        avaliacao = self.get_object(pk)
        if not avaliacao:
            return Response({"erro": "AvaliacaoSubmissao não encontrada"}, status=404)

        self.check_object_permissions(request, avaliacao)
        serializer = AvaliacaoSubmissaoSerializer(avaliacao)
        return Response(serializer.data)

    def put(self, request, pk):
        avaliacao = self.get_object(pk)
        if not avaliacao:
            return Response({"erro": "AvaliacaoSubmissao não encontrada"}, status=404)

        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        # Valida se o usuário é o dono do registro ou possui superpoderes
        self.check_object_permissions(request, avaliacao)

        if not request.user.has_perm("api.avaliar_submissao", avaliacao.submissao):
            return Response(
                {
                    "erro": "Usuário perdeu ou não possui permissão ativa para avaliar esta submissão"
                },
                status=403,
            )

        # Validação de janela temporal idêntica para modificações e updates
        agora = timezone.now()
        evento = getattr(avaliacao.submissao, "evento", None)
        etapa_avaliacao = EtapaEvento.objects.filter(
            evento=evento,
            tipo_etapa=TipoEtapa.AVALIACAO_PREVIA,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_avaliacao:
            return Response(
                {
                    "erro": "Modificações bloqueadas: O período de avaliação prévia está encerrado ou fechado"
                },
                status=400,
            )

        serializer = AvaliacaoSubmissaoSerializer(
            avaliacao, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        avaliacao = self.get_object(pk)
        if not avaliacao:
            return Response({"erro": "AvaliacaoSubmissao não encontrada"}, status=404)

        self.check_object_permissions(request, avaliacao)
        avaliacao.delete()
        return Response({"msg": "Avaliação excluída com sucesso"}, status=204)
