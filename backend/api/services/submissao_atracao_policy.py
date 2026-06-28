from guardian.shortcuts import get_objects_for_user

from ..enumerations.status_aprovacao import StatusAprovacao
from ..enumerations.tipo_etapa import TipoEtapa
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
    return bool(
        user
        and (user.is_superuser or user.groups.filter(name="Administrador").exists())
    )


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

    return (
        get_objects_for_user(
            user,
            "api.coordenar_evento",
            klass=Evento,
        )
        .filter(pk=evento.pk)
        .exists()
    )


def possui_status_permitido(atracao, status_permitidos):
    return any(status in status_permitidos for status in status_efetivos(atracao))


def _etapa_aberta(evento, tipo_etapa):
    if not evento:
        return False

    from django.utils import timezone

    from ..models.etapa_evento import EtapaEvento

    now = timezone.now()
    return EtapaEvento.objects.filter(
        evento=evento,
        tipo_etapa=tipo_etapa,
        data_inicio__lte=now,
        data_fim__gte=now,
    ).exists()


def pode_criar_submissao(user, evento):
    if not user or not evento:
        return False

    if user.is_superuser or user.groups.filter(name="Administrador").exists():
        return True

    if user.groups.filter(name__in=["Coordenador", "Organizador"]).exists():
        return True

    return _etapa_aberta(evento, TipoEtapa.SUBMISSAO_TRABALHOS)


def pode_editar_submissao(user, submissao):
    if not user or not submissao:
        return False

    if user.is_superuser or user.groups.filter(name="Administrador").exists():
        return True

    if user.groups.filter(name__in=["Coordenador", "Organizador"]).exists():
        return True

    if not submissao.autorias.filter(usuario=user).exists():
        return False

    status_submissao = str(getattr(submissao, "status_submissao", "") or "").upper()
    if status_submissao in {"RASCUNHO", "SUBMETIDA", "PREVISTA"}:
        return _etapa_aberta(submissao.evento, TipoEtapa.SUBMISSAO_TRABALHOS)

    if submissao.avaliacoes.filter(
        status_aprovacao=StatusAprovacao.APROVADO_COM_RESSALVAS,
    ).exists():
        return _etapa_aberta(submissao.evento, TipoEtapa.AVALIACAO_PREVIA)

    return False
