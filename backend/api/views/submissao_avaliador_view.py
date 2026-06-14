from django.contrib.auth import get_user_model
from guardian.shortcuts import assign_perm, remove_perm, get_users_with_perms
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.submissao import Submissao
from ..models.perfil import Perfil
from ..enumerations.status_submissao import StatusSubmissao
from .perms_generic_view import PodeGerenciarAvaliadoresSubmissao

User = get_user_model()


def _serializar_usuarios_submissao(usuarios):
    """
    Mantém a homogeneidade da serialização de listagem de usuários do seu sistema,
    resolvendo perfis internos de forma amigável para exibição no frontend.
    """
    serialized = []
    for user in usuarios:
        perfil = Perfil.objects.filter(usuario=user).first()
        perfil_id = perfil.id if perfil else None

        if perfil and getattr(perfil, "nome", None):
            nome = perfil.nome
        else:
            nome = getattr(user, "get_full_name", lambda: "")() or user.username

        serialized.append(
            {
                "id": user.id,
                "username": user.username,
                "perfil_id": perfil_id,
                "nome": nome,
                "email": user.email,
            }
        )
    return serialized


class SubmissaoAvaliadorView(APIView):
    permission_classes = [PodeGerenciarAvaliadoresSubmissao]
    avaliador_submissao_perm = "api.avaliar_submissao"

    def get(self, request, pk):
        """Retorna todos os avaliadores vinculados especificamente a esta submissão."""
        try:
            submissao = Submissao.objects.get(pk=pk)
            # A classe de permissão validará se o usuário pode gerenciar o Evento desta Submissão
            self.check_object_permissions(request, submissao)
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        # Recupera os usuários que têm a permissão de objeto específica concedida pelo Guardian
        avaliadores = get_users_with_perms(
            submissao,
            only_with_perms_in=["avaliar_submissao"],
            with_group_users=False,
        )

        return Response(
            {
                "submissao_id": submissao.id,
                "submissao_titulo": submissao.titulo,
                "avaliadores": _serializar_usuarios_submissao(avaliadores),
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        """Associa um avaliador (via perfil_id) a uma submissão de trabalho e atualiza o status."""
        try:
            submissao = Submissao.objects.get(pk=pk)
            self.check_object_permissions(request, submissao)
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        perfil_id = request.data.get("perfil_id")
        if not perfil_id:
            return Response({"erro": "Campo perfil_id é obrigatório"}, status=400)

        try:
            perfil = Perfil.objects.get(pk=perfil_id)
            novo_avaliador = perfil.usuario
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        # Regra de integridade institucional idêntica à do Evento: precisa ser do grupo Servidor
        if not novo_avaliador.groups.filter(name="Servidor").exists():
            return Response(
                {
                    "erro": "O usuário selecionado deve obrigatoriamente pertencer ao grupo 'Servidor'"
                },
                status=400,
            )

        # Concede a permissão fina a nível de linha de banco de dados (Object-level permission)
        assign_perm(self.avaliador_submissao_perm, novo_avaliador, submissao)

        # --- NOVA REGRA DE NEGÓCIO ---
        # Se a submissão ainda está apenas como SUBMETIDA, evolui o status para EM_AVALIACAO
        if submissao.status_submissao == StatusSubmissao.SUBMETIDA:
            submissao.status_submissao = StatusSubmissao.EM_AVALIACAO
            # Salvando apenas o campo alterado por performance e boa prática
            submissao.save(update_fields=["status_submissao"])
        # ------------------------------

        avaliadores_atualizados = get_users_with_perms(
            submissao,
            only_with_perms_in=["avaliar_submissao"],
            with_group_users=False,
        )

        return Response(
            {
                "msg": "Avaliador vinculado com sucesso à submissão",
                "submissao_id": submissao.id,
                "submissao_status": submissao.status_submissao,  # Bom incluir para o frontend saber que mudou
                "avaliador_adicionado": {
                    "id": novo_avaliador.id,
                    "username": novo_avaliador.username,
                },
                "avaliadores": _serializar_usuarios_submissao(avaliadores_atualizados),
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        """Remove o elo de permissão entre o avaliador e a submissão."""
        try:
            submissao = Submissao.objects.get(pk=pk)
            self.check_object_permissions(request, submissao)
        except Submissao.DoesNotExist:
            return Response({"erro": "Submissão não encontrada"}, status=404)

        perfil_id = request.data.get("perfil_id")
        if not perfil_id:
            return Response({"erro": "Campo perfil_id é obrigatório"}, status=400)

        try:
            perfil = Perfil.objects.get(pk=perfil_id)
            avaliador_removido = perfil.usuario
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        # Revoga a permissão fina do Guardian
        remove_perm(self.avaliador_submissao_perm, avaliador_removido, submissao)

        avaliadores_restantes = get_users_with_perms(
            submissao,
            only_with_perms_in=["avaliar_submissao"],
            with_group_users=False,
        )

        return Response(
            {
                "msg": "Permissão de avaliação revogada com sucesso para esta submissão",
                "submissao_id": submissao.id,
                "avaliador_removido": {
                    "id": avaliador_removido.id,
                    "username": avaliador_removido.username,
                },
                "avaliadores": _serializar_usuarios_submissao(avaliadores_restantes),
            },
            status=status.HTTP_200_OK,
        )
