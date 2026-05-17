from emails.tasks import enviar_email


def enviar_email_boas_vindas(nome_usuario, sobrenome_usuario, email_usuario):
    """
    Monta o conteúdo do e-mail de boas-vindas e delega
    o envio assíncrono para a fila do Celery.
    """
    #
    # Titulo do email
    assunto = "Bem-vindo ao Sistema!"

    # Corpo do e-mail
    mensagem_texto = (
        f"Olá, {nome_usuario} {sobrenome_usuario}.\n\n"
        "Seu cadastro complementar no Sistema de Eventos foi realizado com Sucesso!.\n"
        "Seja muito bem-vindo!"
    )

    # Disparo para Redis/UpStash
    enviar_email.delay(
        assunto=assunto, mensagem_texto=mensagem_texto, destinatarios=[email_usuario]
    )
