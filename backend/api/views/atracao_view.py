from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from guardian.shortcuts import (
    assign_perm,
    get_objects_for_user,
    get_users_with_perms,
    remove_perm,
)
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.status_submissao import StatusSubmissao
from ..enumerations.tipo_etapa import TipoEtapa
from ..models.atracao import Atracao
from ..models.avaliacao_atracao import AvaliacaoAtracao
from ..models.etapa_evento import EtapaEvento
from ..models.evento import Evento
from ..models.perfil import Perfil
from ..serializers.atracao_serializer import AtracaoSerializer
from ..services.submissao_atracao_policy import (
    STATUS_EDICAO_COORDENADOR,
    STATUS_EDICAO_USUARIO,
    STATUS_EXCLUSAO_COORDENADOR,
    STATUS_EXCLUSAO_USUARIO,
    coordenador_gerencia_evento,
    is_admin,
    is_coordenador,
    possui_status_permitido,
    usuario_eh_autor,
)
from .perms_generic_view import PodeGerenciarEquipeEvento

User = get_user_model()


class AtracaoListView(APIView):
    """Lista todas as atrações e permite criar uma nova."""

    permission_classes = [AllowAny]

    def _base_queryset(self):
        return Atracao.objects.filter(
            submissao__isnull=False,
            submissao__status_submissao=StatusSubmissao.CONVERTIDA_EM_ATRACAO,
        ).select_related(
            "submissao",
            "submissao__modalidade",
            "submissao__evento",
            "espaco",
        )

    ORDENACAO_MAP = {
        "criacao": "-id",
        "titulo": "submissao__titulo",
        "modalidade": "submissao__modalidade__nome",
        "status": "status",
    }

    def get(self, request):
        evento_id = request.query_params.get("evento")
        busca = request.query_params.get("busca")
        status_param = request.query_params.get("status")
        modalidade_id = request.query_params.get("modalidade")
        ordenar = request.query_params.get("ordenar", "criacao")

        atracoes = self._base_queryset()

        if evento_id:
            atracoes = atracoes.filter(submissao__evento_id=evento_id)

        if busca:
            atracoes = atracoes.filter(
                Q(submissao__titulo__icontains=busca)
                | Q(submissao__resumo__icontains=busca)
                | Q(submissao__palavras_chave__icontains=busca)
            )

        if status_param:
            atracoes = atracoes.filter(status=status_param)

        if modalidade_id:
            atracoes = atracoes.filter(submissao__modalidade_id=modalidade_id)

        campo_ordem = self.ORDENACAO_MAP.get(ordenar, self.ORDENACAO_MAP["criacao"])
        atracoes = atracoes.order_by(campo_ordem)

        serializer = AtracaoSerializer(atracoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AtracaoSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AtracaoDetailView(APIView):
    """Recupera, atualiza ou remove uma atração específica."""

    permission_classes = [AllowAny]

    def _base_queryset(self):
        return Atracao.objects.filter(
            submissao__isnull=False,
            submissao__status_submissao=StatusSubmissao.CONVERTIDA_EM_ATRACAO,
        ).select_related(
            "submissao",
            "submissao__modalidade",
            "submissao__evento",
            "espaco",
        )

    def get_object(self, pk):
        try:
            return self._base_queryset().get(pk=pk)
        except Atracao.DoesNotExist:
            return None

    def _validar_permissao_edicao(self, request, atracao):
        user = request.user
        if not user or not user.is_authenticated:
            return False, "Autenticação obrigatória para editar submissão/atração."

        if is_admin(user):
            return True, ""

        if is_coordenador(user):
            tem_escopo = coordenador_gerencia_evento(user, atracao) or usuario_eh_autor(
                user, atracao
            )
            if not tem_escopo:
                return (
                    False,
                    "Coordenador só pode editar submissões/atrações do evento que coordena ou de sua autoria.",
                )

            if possui_status_permitido(atracao, STATUS_EDICAO_COORDENADOR):
                return True, ""

            if usuario_eh_autor(
                user, atracao
            ) and self._autor_pode_editar_com_ressalvas(atracao):
                return True, ""

            return (
                False,
                "Coordenador só pode editar com status PREVISTA, SUBMETIDA, RASCUNHO ou CONFIRMADA.",
            )

        if not usuario_eh_autor(user, atracao):
            return False, "Você só pode editar submissões/atrações de sua autoria."

        if possui_status_permitido(atracao, STATUS_EDICAO_USUARIO):
            return True, ""

        if self._autor_pode_editar_com_ressalvas(atracao):
            return True, ""

        return False, "Aluno/Servidor só pode editar submissão/atração em RASCUNHO."

    def _autor_pode_editar_com_ressalvas(self, atracao):
        submissao = getattr(atracao, "submissao", None)
        status_submissao = getattr(submissao, "status_submissao", None)
        if status_submissao != StatusSubmissao.APROVADO_COM_RESSALVAS:
            return False

        return self._etapa_avaliacao_previa_aberta(atracao)

    def _etapa_avaliacao_previa_aberta(self, atracao):
        evento = getattr(getattr(atracao, "submissao", None), "evento", None)
        if not evento:
            return False

        now = timezone.now()
        return EtapaEvento.objects.filter(
            evento=evento,
            tipo_etapa=TipoEtapa.AVALIACAO_PREVIA,
            data_inicio__lte=now,
            data_fim__gte=now,
        ).exists()

    @staticmethod
    def _atracao_esta_programada(atracao):
        return atracao.ordem_apresentacoes.exists()

    def _validar_permissao_exclusao(self, request, atracao):
        user = request.user
        if not user or not user.is_authenticated:
            return (
                False,
                "Autenticação obrigatória para excluir submissão/atração.",
                status.HTTP_403_FORBIDDEN,
            )

        if is_admin(user):
            return True, "", status.HTTP_204_NO_CONTENT

        if self._atracao_esta_programada(atracao):
            return (
                False,
                "Não é possível excluir: a submissão/atração já foi programada.",
                status.HTTP_400_BAD_REQUEST,
            )

        if is_coordenador(user):
            tem_escopo = coordenador_gerencia_evento(user, atracao) or usuario_eh_autor(
                user, atracao
            )
            if not tem_escopo:
                return (
                    False,
                    "Coordenador só pode excluir submissões/atrações do evento que coordena ou de sua autoria.",
                    status.HTTP_403_FORBIDDEN,
                )

            if possui_status_permitido(atracao, STATUS_EXCLUSAO_COORDENADOR):
                return True, "", status.HTTP_204_NO_CONTENT

            return (
                False,
                "Coordenador só pode excluir com status PREVISTA, SUBMETIDA, RASCUNHO ou CONFIRMADA.",
                status.HTTP_403_FORBIDDEN,
            )

        if not usuario_eh_autor(user, atracao):
            return (
                False,
                "Você só pode excluir submissões/atrações de sua autoria.",
                status.HTTP_403_FORBIDDEN,
            )

        if possui_status_permitido(atracao, STATUS_EXCLUSAO_USUARIO):
            return True, "", status.HTTP_204_NO_CONTENT

        return (
            False,
            "Aluno/Servidor só pode excluir submissão/atração em SUBMETIDA ou RASCUNHO.",
            status.HTTP_403_FORBIDDEN,
        )

    def get(self, request, pk):
        atracao = self.get_object(pk)
        if atracao is None:
            return Response(
                {"detail": "Atração não encontrada."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = AtracaoSerializer(atracao)
        return Response(serializer.data)

    def put(self, request, pk):
        atracao = self.get_object(pk)
        if atracao is None:
            return Response(
                {"detail": "Atração não encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

        status_recebido = request.data.get("status", None)
        if status_recebido is not None:
            status_atual = str(getattr(atracao, "status", "") or "").strip().upper()
            status_novo = str(status_recebido or "").strip().upper()
            if status_novo and status_novo != status_atual and not is_admin(request.user):
                return Response(
                    {"detail": "Somente administrador pode alterar status da atração."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Se a submissão foi REPROVADA, bloquear alterações na atração
        submissao = getattr(atracao, "submissao", None)
        status_submissao = getattr(submissao, "status_submissao", None)
        if status_submissao == StatusSubmissao.REPROVADA:
            return Response(
                {"detail": "Não é possível modificar: a submissão foi reprovada."},
                status=status.HTTP_403_FORBIDDEN,
            )

        pode_editar, motivo = self._validar_permissao_edicao(request, atracao)
        if not pode_editar:
            return Response({"detail": motivo}, status=status.HTTP_403_FORBIDDEN)

        serializer = AtracaoSerializer(
            atracao, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        atracao = self.get_object(pk)
        if atracao is None:
            return Response(
                {"detail": "Atração não encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

        # Se a submissão foi REPROVADA, bloquear remoção da atração
        submissao = getattr(atracao, "submissao", None)
        status_submissao = getattr(submissao, "status_submissao", None)
        if status_submissao == StatusSubmissao.REPROVADA:
            return Response(
                {"detail": "Não é possível excluir: a submissão foi reprovada."},
                status=status.HTTP_403_FORBIDDEN,
            )

        pode_excluir, motivo, http_status = self._validar_permissao_exclusao(
            request, atracao
        )
        if not pode_excluir:
            return Response({"detail": motivo}, status=http_status)

        atracao.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AtracaoAvaliadorView(APIView):
    permission_classes = [PodeGerenciarEquipeEvento]

    avaliar_perm = "api.avaliar_atracao"

    def get(self, request, pk):
        try:
            atracao = Atracao.objects.get(pk=pk)
        except Atracao.DoesNotExist:
            return Response({"erro": "Atração não encontrada"}, status=404)
        modalidade = getattr(getattr(atracao, "submissao", None), "modalidade", None)
        # se modalidade da atração não requer avaliação, não faz sentido ter avaliadores
        if not modalidade or not modalidade.requer_avaliacao:
            return Response(
                {"erro": "Modalidade da atração não requer avaliação"}, status=400
            )

        avaliadores = get_users_with_perms(
            atracao, only_with_perms_in=["avaliar_atracao"], with_group_users=False
        )

        # serializar usuários com dados de perfil (perfil_id e nome quando disponíveis)
        avaliadores_serializados = []
        for u in avaliadores:
            perfil = Perfil.objects.filter(usuario=u).first()
            perfil_id = perfil.id if perfil else None
            nome = None
            if perfil and getattr(perfil, "nome", None):
                nome = perfil.nome
            else:
                nome = getattr(u, "get_full_name", lambda: "")() or u.username
            avaliadores_serializados.append(
                {
                    "id": u.id,
                    "perfil_id": perfil_id,
                    "nome": nome,
                    "username": u.username,
                }
            )

        return Response(
            {"atracao_id": atracao.id, "avaliadores": avaliadores_serializados},
            status=200,
        )

    def patch(self, request, pk):
        try:
            atracao = Atracao.objects.get(pk=pk)
        except Atracao.DoesNotExist:
            return Response({"erro": "Atração não encontrada"}, status=404)
        modalidade = getattr(getattr(atracao, "submissao", None), "modalidade", None)

        perfil_id = request.data.get("perfil_id")

        if not perfil_id:
            return Response({"erro": "Campo perfil_id é obrigatório"}, status=400)

        try:
            perfil = Perfil.objects.get(pk=perfil_id)
            usuario = perfil.usuario
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        # se modalidade da atração não requer avaliação, não faz sentido ter avaliadores
        if not modalidade or not modalidade.requer_avaliacao:
            return Response(
                {"erro": "Modalidade da atração não requer avaliação"}, status=400
            )

        # verifica limite de avaliadores definido pela modalidade
        if modalidade:
            limite = modalidade.limite_avaliadores or 0
            atuais = get_users_with_perms(
                atracao, only_with_perms_in=["avaliar_atracao"], with_group_users=False
            )
            if limite and len(atuais) >= limite:
                return Response(
                    {"erro": "Limite de avaliadores atingido para essa modalidade"},
                    status=400,
                )

        # usuário deve pertencer ao grupo 'Servidor' para ser escolhido como avaliador
        if not usuario.groups.filter(name="Servidor").exists():
            return Response(
                {"erro": "Usuário não pertence ao grupo Servidor"}, status=400
            )

        assign_perm(self.avaliar_perm, usuario, atracao)

        # garantir que usuário receba permissão de avaliador no nível do evento
        try:
            evento = getattr(getattr(atracao, "submissao", None), "evento", None)
            if evento is not None:
                assign_perm("api.avaliador_evento", usuario, evento)
        except Exception:
            pass
        avaliadores = get_users_with_perms(
            atracao, only_with_perms_in=["avaliar_atracao"], with_group_users=False
        )

        avaliadores_serializados = []
        for u in avaliadores:
            perfil = Perfil.objects.filter(usuario=u).first()
            perfil_id = perfil.id if perfil else None
            nome = None
            if perfil and getattr(perfil, "nome", None):
                nome = perfil.nome
            else:
                nome = getattr(u, "get_full_name", lambda: "")() or u.username
            avaliadores_serializados.append(
                {
                    "id": u.id,
                    "perfil_id": perfil_id,
                    "nome": nome,
                    "username": u.username,
                }
            )

        return Response(
            {
                "msg": "Avaliador associado à atração",
                "avaliadores": avaliadores_serializados,
            },
            status=200,
        )

    def delete(self, request, pk):
        try:
            atracao = Atracao.objects.get(pk=pk)
        except Atracao.DoesNotExist:
            return Response({"erro": "Atração não encontrada"}, status=404)

        perfil_id = request.data.get("perfil_id")

        if not perfil_id:
            return Response({"erro": "Campo perfil_id é obrigatório"}, status=400)

        try:
            perfil = Perfil.objects.get(pk=perfil_id)
            usuario = perfil.usuario
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        ja_avaliou = AvaliacaoAtracao.objects.filter(
            avaliador=usuario, atracao=atracao
        ).exists()
        if ja_avaliou:
            return Response(
                {"erro": "Não é possível remover avaliador com avaliação registrada"},
                status=400,
            )

        remove_perm(self.avaliar_perm, usuario, atracao)

        # se o usuário não tiver mais permissões de avaliar atrações neste evento
        # e não tiver avaliações neste evento, remover a permissão de avaliador no nível do evento
        try:
            evento = getattr(getattr(atracao, "submissao", None), "evento", None)
            if evento is None:
                raise ValueError("Atração sem evento associado na submissão")
            # verificar se existem outras atrações do mesmo evento com perm de avaliar
            atracoes_com_perm = get_objects_for_user(
                usuario, "api.avaliar_atracao", klass=Atracao
            ).filter(submissao__evento=evento)

            avaliacoes_no_evento = AvaliacaoAtracao.objects.filter(
                avaliador=usuario, atracao__submissao__evento=evento
            ).exists()

            if not atracoes_com_perm.exists() and not avaliacoes_no_evento:
                try:
                    remove_perm("api.avaliador_evento", usuario, evento)
                except Exception:
                    pass
        except Exception:
            pass
        avaliadores = get_users_with_perms(
            atracao, only_with_perms_in=["avaliar_atracao"], with_group_users=False
        )

        avaliadores_serializados = []
        for u in avaliadores:
            perfil = Perfil.objects.filter(usuario=u).first()
            perfil_id = perfil.id if perfil else None
            nome = None
            if perfil and getattr(perfil, "nome", None):
                nome = perfil.nome
            else:
                nome = getattr(u, "get_full_name", lambda: "")() or u.username
            avaliadores_serializados.append(
                {
                    "id": u.id,
                    "perfil_id": perfil_id,
                    "nome": nome,
                    "username": u.username,
                }
            )

        return Response(
            {
                "msg": "Avaliador removido da atração",
                "avaliadores": avaliadores_serializados,
            },
            status=200,
        )


class MinhasAtracoesAvaliadorView(APIView):
    """Lista atrações que o usuário pode avaliar (pendentes) e as já avaliadas."""

    permission_classes = [IsAuthenticated]

    def get(self, request, evento_id):
        user = request.user

        # valida evento
        try:
            evento = Evento.objects.get(pk=evento_id)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        # atrações do evento para as quais o usuário tem permissão obj-level
        atracoes_perm = (
            get_objects_for_user(user, "api.avaliar_atracao", klass=Atracao)
            .filter(submissao__evento_id=evento_id)
            .select_related(
                "submissao",
                "submissao__modalidade",
                "submissao__evento",
                "espaco",
            )
        )

        # avaliações já realizadas pelo usuário
        avaliacoes = AvaliacaoAtracao.objects.filter(avaliador=user).select_related(
            "atracao",
            "atracao__submissao",
            "atracao__submissao__modalidade",
            "atracao__submissao__evento",
            "atracao__espaco",
        )
        avaliadas_ids = {a.atracao_id: a for a in avaliacoes}

        now = timezone.now()

        resultados = []

        atracoes_perm_ids = set()
        for atr in atracoes_perm:
            atracoes_perm_ids.add(atr.id)
            # se já existe avaliação do usuário para essa atração
            if atr.id in avaliadas_ids:
                av = avaliadas_ids[atr.id]
                data = AtracaoSerializer(atr).data
                data["status"] = "avaliada"
                data["avaliacao_id"] = av.id
                data["avaliacao_disponivel"] = False
                resultados.append(data)
                continue

            # verificar se a etapa REALIZACAO_EVENTO está aberta para o evento
            etapa_aberta = EtapaEvento.objects.filter(
                evento=evento,
                tipo_etapa=TipoEtapa.REALIZACAO_EVENTO,
                data_inicio__lte=now,
                data_fim__gte=now,
            ).exists()

            data = AtracaoSerializer(atr).data
            data["avaliacao_id"] = None
            if etapa_aberta:
                data["status"] = "para_avaliar"
                data["avaliacao_disponivel"] = True
            else:
                # incluir atrações atribuídas mesmo fora do período, mas marcar como indisponível
                data["status"] = "fora_periodo"
                data["avaliacao_disponivel"] = False
            resultados.append(data)

        # também incluir avaliações feitas pelo usuário em atrações do mesmo evento
        for av in avaliacoes:
            # já incluída nas atrações com permissão
            if av.atracao_id in atracoes_perm_ids:
                continue
            # somente considerar avaliações cuja atração pertence ao evento requisitado
            if (
                not av.atracao
                or getattr(getattr(av.atracao, "submissao", None), "evento_id", None)
                != evento.id
            ):
                continue
            atr = av.atracao
            data = AtracaoSerializer(atr).data
            data["status"] = "avaliada"
            data["avaliacao_id"] = av.id
            resultados.append(data)

        return Response(resultados, status=200)
