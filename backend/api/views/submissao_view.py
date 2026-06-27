from django.db.models import Q
from django.utils import timezone
from guardian.shortcuts import get_objects_for_user
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.status_atracao import StatusAtracao
from ..enumerations.status_submissao import StatusSubmissao
from ..enumerations.tipo_etapa import TipoEtapa
from ..models.atracao import Atracao
from ..models.avaliacao_submissao import AvaliacaoSubmissao
from ..models.etapa_evento import EtapaEvento
from ..models.evento import Evento
from ..models.submissao import Submissao
from ..serializers.submissao_serializer import SubmissaoSerializer


def _aplicar_edicao_submissao(submissao, request):
    campos_editaveis = {
        "titulo",
        "resumo",
        "palavras_chave",
        "modalidade",
        "nivel_ensino",
        "area_conhecimento",
        "orientador",
        "sou_orientador",
        "acessibilidade",
        "sugestao_vagas",
    }

    payload = {}
    for campo in campos_editaveis:
        if campo in request.data:
            payload[campo] = request.data.get(campo)

    if not payload:
        return None

    serializer = SubmissaoSerializer(
        submissao,
        data=payload,
        partial=True,
        context={"request": request},
    )
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    serializer.save()
    return None


class SubmissaoHomologarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            submissao = Submissao.objects.get(pk=pk)
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        if submissao.status_submissao == StatusSubmissao.REPROVADA:
            return Response(
                {"erro": "Submissão reprovada. A homologação não é permitida."},
                status=403,
            )

        erro_edicao = _aplicar_edicao_submissao(submissao, request)
        if erro_edicao is not None:
            return erro_edicao

        # Homologar = criar/garantir a relação com Atracao e converter status na submissão
        atracao = getattr(submissao, "atracao", None)
        if atracao is None:
            atracao = Atracao.objects.create(submissao=submissao)

        # Homologar = confirmar a atração
        atracao.status = StatusAtracao.CONFIRMADA
        atracao.save(update_fields=["status"])

        atracao.evento = submissao.evento
        atracao.save(update_fields=["evento"])

        # Homologar também converte o status da submissão
        submissao.status_submissao = StatusSubmissao.CONVERTIDA_EM_ATRACAO
        submissao.save(update_fields=["status_submissao"])

        serializer = SubmissaoSerializer(submissao, context={"request": request})
        return Response(serializer.data, status=200)


class SubmissaoReprovarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            submissao = Submissao.objects.get(pk=pk)
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        if submissao.status_submissao == StatusSubmissao.REPROVADA:
            return Response(
                {"erro": "Submissão já reprovada."},
                status=403,
            )

        erro_edicao = _aplicar_edicao_submissao(submissao, request)
        if erro_edicao is not None:
            return erro_edicao

        submissao.status_submissao = StatusSubmissao.REPROVADA
        submissao.save(update_fields=["status_submissao"])

        serializer = SubmissaoSerializer(submissao, context={"request": request})
        return Response(serializer.data, status=200)


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

        submissoes = self._aplicar_filtros(request, submissoes)
        submissoes = self._aplicar_ordenacao(request, submissoes).distinct()

        serializer = SubmissaoSerializer(
            submissoes, many=True, context={"request": request}
        )
        return Response(serializer.data)


class SubmissaoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    STATUS_EXCLUSAO_COORDENADOR = {
        "PREVISTA",
        "SUBMETIDA",
        "RASCUNHO",
    }
    STATUS_EXCLUSAO_USUARIO = {
        "PREVISTA",
        "SUBMETIDA",
        "RASCUNHO",
    }

    @staticmethod
    def _is_admin(user):
        return user.is_superuser or user.groups.filter(name="Administrador").exists()

    @staticmethod
    def _is_coordenador(user):
        return user.groups.filter(name="Coordenador").exists()

    def _coordenador_gerencia_evento(self, user, submissao):
        return (
            get_objects_for_user(
                user,
                "api.coordenar_evento",
                klass=Evento,
            )
            .filter(pk=submissao.evento_id)
            .exists()
        )

    def _usuario_eh_autor(self, user, submissao):
        return submissao.autorias.filter(usuario=user).exists()

    def _pode_excluir(self, user, submissao):
        status = str(submissao.status_submissao or "").upper()

        if self._is_admin(user):
            return True

        if self._is_coordenador(user):
            escopo = self._coordenador_gerencia_evento(
                user, submissao
            ) or self._usuario_eh_autor(user, submissao)
            return escopo and status in self.STATUS_EXCLUSAO_COORDENADOR

        return (
            self._usuario_eh_autor(user, submissao)
            and status in self.STATUS_EXCLUSAO_USUARIO
        )

    def _pode_editar(self, user, submissao):
        if self._is_admin(user):
            return True

        if self._is_coordenador(user):
            return self._coordenador_gerencia_evento(
                user, submissao
            ) or self._usuario_eh_autor(user, submissao)

        return self._usuario_eh_autor(user, submissao)

    def put(self, request, pk):
        try:
            submissao = (
                Submissao.objects.select_related("evento", "modalidade", "orientador")
                .prefetch_related("autorias")
                .get(pk=pk)
            )
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        if not self._pode_editar(request.user, submissao):
            return Response(
                {"erro": "issão para editar esta submissão."},
                status=403,
            )

        payload = (
            request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        )

        status_recebido = payload.get("status_submissao", payload.get("status"))
        if status_recebido is not None and not self._is_admin(request.user):
            return Response(
                {"erro": "Somente administrador pode alterar status da submissão."},
                status=403,
            )

        if status_recebido is not None:
            payload["status_submissao"] = status_recebido

        payload.pop("status", None)

        serializer = SubmissaoSerializer(
            submissao,
            data=payload,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            submissao = (
                Submissao.objects.select_related("evento")
                .prefetch_related("autorias")
                .get(pk=pk)
            )
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        if not self._pode_excluir(request.user, submissao):
            return Response(
                {"erro": "issão para excluir esta submissão."},
                status=403,
            )

        submissao.delete()
        return Response(status=204)


class MinhasSubmissoesAvaliadorView(APIView):
    """Lista as submissões que o usuário logado possui permissão para avaliar no evento."""

    permission_classes = [IsAuthenticated]

    def get(self, request, evento_id):
        user = request.user

        # 1. Valida se o evento existe
        try:
            evento = Evento.objects.get(pk=evento_id)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        # 2. Busca submissões do evento onde o usuário tem permissão fina concedida pelo Guardian
        submissoes_perm = (
            get_objects_for_user(user, "api.avaliar_submissao", klass=Submissao)
            .filter(evento_id=evento_id)
            .select_related("modalidade", "evento")
        )

        # 3. Busca avaliações já realizadas por este usuário
        avaliacoes = AvaliacaoSubmissao.objects.filter(avaliador=user).select_related(
            "submissao", "submissao__modalidade", "submissao__evento"
        )
        avaliadas_ids = {av.submissao_id: av for av in avaliacoes}

        now = timezone.now()
        resultados = []
        submissoes_perm_ids = set()

        for sub in submissoes_perm:
            submissoes_perm_ids.add(sub.id)

            # Contextualiza os dados iniciais usando o Serializer do seu sistema
            # Se o seu serializer não for o padrão ModelSerializer, mude a chamada abaixo
            data = SubmissaoSerializer(sub).data

            # Caso A: O usuário já realizou/salvou a avaliação dessa submissão
            if sub.id in avaliadas_ids:
                av = avaliadas_ids[sub.id]
                data["status"] = "avaliada"
                data["avaliacao_id"] = av.id
                data["avaliacao_disponivel"] = False
                resultados.append(data)
                continue

            # Caso B: Pendente de avaliação. Verifica se a janela de AVALIACAO_PREVIA está aberta
            etapa_aberta = EtapaEvento.objects.filter(
                evento=evento,
                tipo_etapa=TipoEtapa.AVALIACAO_PREVIA,
                data_inicio__lte=now,
                data_fim__gte=now,
            ).exists()

            data["avaliacao_id"] = None
            if etapa_aberta:
                data["status"] = "para_avaliar"
                data["avaliacao_disponivel"] = True
            else:
                data["status"] = "fora_periodo"
                data["avaliacao_disponivel"] = False

            resultados.append(data)

        # Caso C: Inclui avaliações feitas pelo usuário mas que perderam o vínculo do Guardian por algum motivo
        for av in avaliacoes:
            if av.submissao_id in submissoes_perm_ids:
                continue
            if (
                not av.submissao
                or getattr(av.submissao, "evento_id", None) != evento.id
            ):
                continue

            sub = av.submissao
            data = SubmissaoSerializer(sub).data
            data["status"] = "avaliada"
            data["avaliacao_id"] = av.id
            data["avaliacao_disponivel"] = False
            resultados.append(data)

        return Response(resultados, status=200)
