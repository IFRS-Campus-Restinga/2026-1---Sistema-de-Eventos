from guardian.shortcuts import get_objects_for_user

from ..models.evento import Evento

STATUS_EDICAO_COORDENADOR = {
    "PREVISTA",
    "SUBMETIDA",
    "RASCUNHO",
    "CONFIRMADA",
}

STATUS_EDICAO_USUARIO = {
    "RASCUNHO",
}

STATUS_EXCLUSAO_COORDENADOR = {
    "PREVISTA",
    "SUBMETIDA",
    "RASCUNHO",
    "CONFIRMADA",
}

STATUS_EXCLUSAO_USUARIO = {
    "SUBMETIDA",
    "RASCUNHO",
}


def is_admin(user):
    return bool(user and (user.is_superuser or user.groups.filter(name="Administrador").exists()))


def is_coordenador(user):
    return bool(user and user.groups.filter(name="Coordenador").exists())


def status_efetivos(atracao):
    status = []

    status_atracao = getattr(atracao, "status", None)
    if status_atracao:
        status.append(status_atracao)

    submissao = getattr(atracao, "submissao", None)
    status_submissao = getattr(submissao, "status_submissao", None)
    if status_submissao:
        status.append(status_submissao)

    return status


def usuario_eh_autor(user, atracao):
    submissao = getattr(atracao, "submissao", None)
    autorias = getattr(submissao, "autorias", None) if submissao else None
    if autorias is None:
        return False
    return autorias.filter(usuario=user).exists()


def evento_da_atracao(atracao):
    submissao = getattr(atracao, "submissao", None)
    if submissao and getattr(submissao, "evento", None):
        return submissao.evento
    return getattr(atracao, "evento", None)


def coordenador_gerencia_evento(user, atracao):
    evento = evento_da_atracao(atracao)
    if evento is None:
        return False

    return get_objects_for_user(
        user,
        "api.coordenar_evento",
        klass=Evento,
    ).filter(pk=evento.pk).exists()


def possui_status_permitido(atracao, status_permitidos):
    return any(status in status_permitidos for status in status_efetivos(atracao))
