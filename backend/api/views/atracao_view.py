from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.mail import send_mass_mail
from django.conf import settings
from eventos_session.permissions import HasValidSessionToken

from ..serializers.atracao_serializer import AtracaoSerializer
from ..models.atracao import Atracao


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
