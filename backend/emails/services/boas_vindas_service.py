from emails.tasks import enviar_email
from ..models.template_sistema import TemplateSistema
from django.template import Template, Context


def enviar_email_boas_vindas(nome_usuario, sobrenome_usuario, email_usuario):
    """
    Monta o conteúdo do e-mail de boas-vindas e delega
    o envio assíncrono para a fila do Celery.
    """

    # Busca o template pelo identificador
    template = TemplateSistema.objects.get(identificador="welcome_email")

    # Contexto com as variáveis
    contexto = Context(
        {
            "nome_usuario": nome_usuario,
            "sobrenome_usuario": sobrenome_usuario,
        }
    )

    # Renderiza o assunto e o corpo do e-mail
    assunto_renderizado = Template(template.assunto).render(contexto)
    corpo_renderizado = Template(template.corpo_texto).render(contexto)

    # Disparo para Redis/UpStash
    enviar_email.delay(
        assunto=assunto_renderizado,
        mensagem_texto=corpo_renderizado,
        destinatarios=[email_usuario],
    )
