from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.mail import send_mass_mail
from django.conf import settings
from eventos_session.permissions import HasValidSessionToken

from ..serializers.atracao_serializer import AtracaoSerializer
from ..models.atracao import Atracao
from django.contrib.auth import get_user_model
from guardian.shortcuts import assign_perm, get_users_with_perms, remove_perm
from .perms_generic_view import PodeGerenciarEquipeEvento
from ..models.perfil import Perfil

User = get_user_model()


class AtracaoListView(APIView):
    """Lista todas as atrações e permite criar uma nova."""

    permission_classes = [AllowAny]

    def get(self, request):
        evento_id = request.query_params.get("evento")
        if evento_id:
            atracoes = Atracao.objects.filter(
                evento_id=evento_id
            )  # atrações de um evento específico
        else:
            atracoes = Atracao.objects.all()  # retorna todas as atrações

        serializer = AtracaoSerializer(atracoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AtracaoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AtracaoDetailView(APIView):
    """Recupera, atualiza ou remove uma atração específica."""

    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Atracao.objects.get(pk=pk)
        except Atracao.DoesNotExist:
            return None

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
        serializer = AtracaoSerializer(atracao, data=request.data)
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
        atracao.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EnviarEmailsView(APIView):
    """Endpoint responsável por receber a requisição e processar o envio de e-mails em lote."""

    # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.
    authentication_classes = []
    permission_classes = [HasValidSessionToken]

    def post(self, request, evento_id):
        # Dados do front
        assunto = request.data.get("assunto")
        mensagem = request.data.get("mensagem")
        atracoes_ids = request.data.get("atracoes_ids", [])

        if not assunto or not mensagem:
            return Response(
                {"detail": "Os campos 'assunto' e 'mensagem' são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            emails_enviados = self._processar_envio_emails(
                atracoes_ids, assunto, mensagem
            )
            return Response(
                {
                    "mensagem": f"Comunicado processado para {emails_enviados} destinatários."
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            # Captura erros do SMTP e outros
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _processar_envio_emails(self, atracoes_ids, assunto, mensagem):
        # TODO: Substituir pela query real baseada no modelo de inscrições
        # quando tentei criar um inscrição evento não deixava finalizar por uma validação dai não conseguia testar com consistencia.
        emails_mock = [
            "sandro_are@hotmail.com",
            "2024010490@aluno.restinga.ifrs.edu.br",
        ]  # qualquer email para testes só sair adicionando

        if (
            not emails_mock
        ):  # evitar acionar todo processo de envio se não houver destinatários
            return 0

        remetente = getattr(settings, "DEFAULT_FROM_EMAIL", "nao-responda@ifrs.edu.br")

        mensagens = [(assunto, mensagem, remetente, [email]) for email in emails_mock]

        return send_mass_mail(mensagens, fail_silently=False)


class AtracaoAvaliadorView(APIView):
    permission_classes = [PodeGerenciarEquipeEvento]

    avaliar_perm = "api.avaliar_atracao"

    def get(self, request, pk):
        try:
            atracao = Atracao.objects.get(pk=pk)
        except Atracao.DoesNotExist:
            return Response({"erro": "Atração não encontrada"}, status=404)
        # se modalidade da atração não requer avaliação, não faz sentido ter avaliadores
        if not atracao.modalidade or not atracao.modalidade.requer_avaliacao:
            return Response(
                {"erro": "Modalidade da atração não requer avaliação"}, status=400
            )

        avaliadores = get_users_with_perms(
            atracao, only_with_perms_in=["avaliar_atracao"], with_group_users=False
        )

        return Response(
            {
                "atracao_id": atracao.id,
                "avaliadores": [
                    {"id": u.id, "username": u.username} for u in avaliadores
                ],
            },
            status=200,
        )

    def patch(self, request, pk):
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

        # se modalidade da atração não requer avaliação, não faz sentido ter avaliadores
        if not atracao.modalidade or not atracao.modalidade.requer_avaliacao:
            return Response(
                {"erro": "Modalidade da atração não requer avaliação"}, status=400
            )

        # verifica limite de avaliadores definido pela modalidade
        if atracao.modalidade:
            limite = atracao.modalidade.limite_avaliadores or 0
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

        avaliadores = get_users_with_perms(
            atracao, only_with_perms_in=["avaliar_atracao"], with_group_users=False
        )

        return Response(
            {
                "msg": "Avaliador associado à atração",
                "avaliadores": [
                    {"id": u.id, "username": u.username} for u in avaliadores
                ],
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

        remove_perm(self.avaliar_perm, usuario, atracao)

        avaliadores = get_users_with_perms(
            atracao, only_with_perms_in=["avaliar_atracao"], with_group_users=False
        )

        return Response(
            {
                "msg": "Avaliador removido da atração",
                "avaliadores": [
                    {"id": u.id, "username": u.username} for u in avaliadores
                ],
            },
            status=200,
        )
