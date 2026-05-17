from emails.tasks import enviar_email


def enviar_comunicado_geral(assunto, mensagem_texto):
    """
    Serviço temporário para processar os comunicados da interface.
    Envia a mensagem para um destinatário fixo de testes (mock) até que
    as tabelas de relacionamentos entre inscritos e atrações sejam implementadas.
    """
    # Substitua pelo endereço de e-mail que receberá os testes da interface
    email_mock = ["2024010490@aluno.restinga.ifrs.edu.br"]

    enviar_email.delay(
        assunto=assunto, mensagem_texto=mensagem_texto, destinatarios=email_mock
    )
