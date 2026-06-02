from celery import shared_task
from django.core.mail import send_mail
import logging

logger = logging.getLogger(
    __name__
)  # Log para vermos o resultado no terminal do Celery

"""
Função genérica de envio. Não deve ser chamada diretamente por Serializers.
Fluxo correto: seu Serializer isValid -> Faz o que você normalmente faria -> View chama essa Task com as propriedades.
"""


# max_retries=tenta 3 vezes antes de desistir, bind=True acessa metadados/logs das tarefas
@shared_task(bind=True, max_retries=3)
def enviar_email(self, assunto, mensagem_texto, destinatarios):
    try:
        # Conecta ao provedor SMTP configurado no settings
        send_mail(
            subject=assunto,
            message=mensagem_texto,
            from_email=None,  # None = EMAIL_HOST_USER do settings.py
            recipient_list=destinatarios,
            fail_silently=False,
        )
        # Transforma a lista em string apenas para exibição clara no log
        lista_str = ", ".join(destinatarios)
        logger.info(f"Sucesso: E-mail enviado para [{lista_str}]")

        return f"Enviado para {destinatarios}"

    except Exception as exc:
        lista_str = (
            ", ".join(destinatarios)
            if isinstance(destinatarios, list)
            else destinatarios
        )
        logger.error(
            f"Erro ao enviar para [{lista_str}]. Tentando novamente... Detalhes: {exc}"
        )

        # Celery tenta novamente
        raise self.retry(exc=exc, countdown=60)
