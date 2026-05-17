from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from emails.services import enviar_comunicado_geral
from eventos_session.permissions import HasValidSessionToken


class EnviarEmailsView(APIView):
    """
    Controlador responsável por receber as requisições de comunicados
    e delegar o processamento para a camada de serviços do app emails.
    """

    authentication_classes = []  # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.
    permission_classes = [HasValidSessionToken]

    def post(self, request, evento_id):
        assunto = request.data.get("assunto")
        mensagem_texto = request.data.get("mensagem")

        if not assunto or not mensagem_texto:
            return Response(
                {"erro": "Os campos 'assunto' e 'mensagem' são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            enviar_comunicado_geral(assunto=assunto, mensagem_texto=mensagem_texto)

            return Response(
                {
                    "mensagem": "Comunicado encaminhado para a fila de processamento assíncrono."
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"erro": f"Falha interna ao registrar comunicado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
