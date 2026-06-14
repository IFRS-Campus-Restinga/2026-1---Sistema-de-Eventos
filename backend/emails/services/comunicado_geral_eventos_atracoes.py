from emails.tasks import enviar_email
from api.models import InscricaoAtracao


def enviar_comunicado_geral(evento_id, atracoes_ids, assunto, mensagem_texto):
    """
    Serviço para processar os comunicados da interface.
    Busca os dados reais dos perfis, substitui as tags dinâmicas
    e enfileira envios individuais.
    """

    usuarios_query = (
        InscricaoAtracao.objects.filter(
            evento_id=evento_id,
            atracao_id__in=atracoes_ids,
            perfil__usuario__email__isnull=False,  # Ignora quem não tem a coluna de e-mail preenchida
        )
        .exclude(
            perfil__usuario__email__exact=""  # Ignora strings vazias
        )
        .values(
            "perfil__usuario__email",
            "perfil__usuario__first_name",
            "perfil__usuario__last_name",
        )
        .distinct()
    )  # Garante que não haverá e-mails duplicados na lista final

    destinatarios_dados = list(usuarios_query)

    if not destinatarios_dados:
        raise ValueError("Nenhum e-mail válido encontrado nas atrações selecionadas.")

    try:
        # Iteramos para montar mensagem com tags
        for usuario in destinatarios_dados:
            email = usuario["perfil__usuario__email"]
            primeiro_nome = usuario["perfil__usuario__first_name"] or ""
            sobrenome = usuario["perfil__usuario__last_name"] or ""
            nome_usuario = f"{primeiro_nome} {sobrenome}".strip()

            mensagem_personalizada = mensagem_texto.replace(
                "%nome_usuario%", nome_usuario
            )

            # Envia Task para o Celery
            enviar_email.delay(
                assunto=assunto,
                mensagem_texto=mensagem_personalizada,
                destinatarios=[email],
            )

        return {
            "sucesso": True,
            "mensagem": f"{len(destinatarios_dados)} e-mails enviados para a fila com sucesso.",
        }

    except Exception as erro:
        raise Exception(f"Falha ao enviar tarefas para o Celery: {str(erro)}")
