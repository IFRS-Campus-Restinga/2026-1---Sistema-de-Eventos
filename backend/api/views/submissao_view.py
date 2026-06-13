from django.db.models import Q
from guardian.shortcuts import get_objects_for_user
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.status_submissao import StatusSubmissao
from ..models.evento import Evento
from ..serializers.submissao_serializer import SubmissaoSerializer
from ..models.submissao import Submissao


class SubmissaoListView(APIView):
    permission_classes = [IsAuthenticated]

    ORDENACAO_MAP = {
        "criacao": "-id",
        "titulo": "titulo",
        "modalidade": "modalidade__nome",
        "nivel_ensino": "nivel_ensino",
        "status": "status_submissao",
        "autor": "autorias__usuario__username",
    }

    @staticmethod
    def _is_admin(user):
        return user.is_superuser or user.groups.filter(name="Administrador").exists()

    @staticmethod
    def _is_coordenador(user):
        return user.groups.filter(name="Coordenador").exists()

    @staticmethod
    def _is_truthy_param(value):
        return str(value).strip().lower() in {"1", "true", "sim", "yes"}

    def _base_queryset(self):
        return Submissao.objects.select_related("evento", "modalidade", "orientador")

    def _scoped_queryset(self, request):
        user = request.user
        queryset = self._base_queryset()

        if self._is_admin(user):
            return queryset

        if self._is_coordenador(user):
            eventos_coordenados = get_objects_for_user(
                user,
                "api.coordenar_evento",
                klass=Evento,
            ).values_list("id", flat=True)

            return queryset.filter(
                Q(evento_id__in=eventos_coordenados) | Q(autorias__usuario=user)
            ).distinct()

        return queryset.filter(autorias__usuario=user).distinct()

    def _aplicar_filtros(self, request, queryset):
        status_submissao = request.query_params.get("status")
        autor_id = request.query_params.get("autor")
        modalidade_id = request.query_params.get("modalidade")
        nivel_ensino = request.query_params.get("nivel_ensino")
        busca = request.query_params.get("busca")

        if status_submissao:
            queryset = queryset.filter(status_submissao=status_submissao)

        if autor_id:
            queryset = queryset.filter(autorias__usuario_id=autor_id)

        if modalidade_id:
            queryset = queryset.filter(modalidade_id=modalidade_id)

        if nivel_ensino:
            queryset = queryset.filter(nivel_ensino=nivel_ensino)

        if busca:
            queryset = queryset.filter(
                Q(titulo__icontains=busca)
                | Q(resumo__icontains=busca)
                | Q(palavras_chave__icontains=busca)
            )

        return queryset

    def _aplicar_ordenacao(self, request, queryset):
        ordenacao = request.query_params.get("ordenar", "criacao")
        campo = self.ORDENACAO_MAP.get(ordenacao, self.ORDENACAO_MAP["criacao"])
        return queryset.order_by(campo, "-id")

    def get(self, request):
        evento_id = request.query_params.get("evento")
        somente_minhas = self._is_truthy_param(request.query_params.get("minhas"))

        submissoes = self._scoped_queryset(request)

        if somente_minhas:
            submissoes = submissoes.filter(autorias__usuario=request.user)

        if evento_id:
            submissoes = submissoes.filter(evento_id=evento_id)

        submissoes = submissoes.exclude(
            status_submissao=StatusSubmissao.CONVERTIDA_EM_ATRACAO
        )
        submissoes = self._aplicar_filtros(request, submissoes)
        submissoes = self._aplicar_ordenacao(request, submissoes).distinct()

        serializer = SubmissaoSerializer(submissoes, many=True, context={"request": request})
        return Response(serializer.data)
