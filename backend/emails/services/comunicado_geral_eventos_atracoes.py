from emails.tasks import enviar_email
from api.models import InscricaoAtracao, Evento  # Import do Evento adicionado


def enviar_comunicado_geral(evento_id, atracoes_ids, assunto, mensagem_texto):
    """
    Serviço para processar os comunicados da interface.
    Busca os dados reais dos perfis, substitui as tags dinâmicas
    e enfileira envios individuais.
    """

    # Busca o nome do evento no banco de dados
    nome_evento = ""
    evento_obj = Evento.objects.filter(id=evento_id).first()
    if evento_obj:
        nome_evento = evento_obj.nome

    mensagem_base = mensagem_texto.replace("%nome_evento%", nome_evento)
    assunto_base = assunto.replace("%nome_evento%", nome_evento)

    usuarios_query = (
        InscricaoAtracao.objects.filter(
            atracao__evento_id=evento_id,
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

    inscricoes = (
        InscricaoAtracao.objects.filter(
            atracao__evento_id=evento_id,
            atracao_id__in=atracoes_ids,
            perfil__usuario__email__isnull=False,
        )
        .exclude(perfil__usuario__email__exact="")
        .select_related("perfil__usuario", "atracao__submissao")
        .prefetch_related("atracao__submissao__autorias__usuario")
    )

    destinatarios_dados = {}
    for inscricao in inscricoes:
        email = inscricao.perfil.usuario.email

        if email not in destinatarios_dados:
            # Pega o título da submissão (Nome do Trabalho)
            nome_trabalho = ""
            autores_lista = []

            if inscricao.atracao.submissao:
                nome_trabalho = inscricao.atracao.submissao.titulo

                # Monta a string com os autores ordenados pela coluna 'ordem'
                autorias = inscricao.atracao.submissao.autorias.all().order_by("ordem")
                for autoria in autorias:
                    nome_autor = (
                        autoria.usuario.get_full_name() or autoria.usuario.username
                    )
                    autores_lista.append(nome_autor)

            autores_texto = (
                ", ".join(autores_lista) if autores_lista else "Autor não informado"
            )

            destinatarios_dados[email] = {
                "primeiro_nome": inscricao.perfil.usuario.first_name,
                "sobrenome": inscricao.perfil.usuario.last_name,
                "nome_trabalho": nome_trabalho,
                "autores": autores_texto,
            }
    if not destinatarios_dados:
        raise ValueError("Nenhum e-mail válido encontrado nas atrações selecionadas.")

    try:
        for email, dados in destinatarios_dados.items():
            primeiro_nome = dados["primeiro_nome"] or ""
            sobrenome = dados["sobrenome"] or ""
            nome_usuario = f"{primeiro_nome} {sobrenome}".strip()
            nome_trabalho = dados["nome_trabalho"]
            autores = dados["autores"]

            # Substitui as três tags
            mensagem_personalizada = mensagem_base.replace(
                "%nome_usuario%", nome_usuario
            )
            mensagem_personalizada = mensagem_personalizada.replace(
                "%nome_trabalho%", nome_trabalho
            )
            mensagem_personalizada = mensagem_personalizada.replace(
                "%autores%", autores
            )

            # Se a tag for usada no assunto também
            assunto_personalizado = assunto_base.replace(
                "%nome_trabalho%", nome_trabalho
            )

            # Envia Task para o Celery
            enviar_email.delay(
                assunto=assunto_personalizado,
                mensagem_texto=mensagem_personalizada,
                destinatarios=[email],
            )

        return {
            "sucesso": True,
            "mensagem": f"{len(destinatarios_dados)} e-mails enviados para a fila com sucesso.",
        }

    except Exception as erro:
        raise Exception(f"Falha ao enviar tarefas para o Celery: {str(erro)}")
