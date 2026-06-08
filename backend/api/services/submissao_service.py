from ..enumerations.status_atracao import StatusAtracao
from ..enumerations.status_submissao import StatusSubmissao
from ..models.atracao import Atracao
from ..models.submissao import Submissao


_CAMPOS_SUBMISSAO = (
    "titulo",
    "resumo",
    "palavras_chave",
    "modalidade",
    "nivel_ensino",
    "area_conhecimento",
    "orientador",
    "sou_orientador",
    "anexo_pdf",
    "acessibilidade",
    "evento",
    "sugestao_vagas",
    "data_hora_inicio",
    "data_hora_fim",
    "espaco",
    "local_atracao",
    "slug",
)


def _mapear_status_legado_para_submissao(status_legado: str) -> str:
    status = (status_legado or "").upper().strip()

    if status == StatusAtracao.CANCELADA:
        return StatusSubmissao.CANCELADA

    if status in {
        StatusSubmissao.SUBMETIDA,
        StatusSubmissao.EM_AVALIACAO,
        StatusSubmissao.APROVADA,
        StatusSubmissao.REPROVADA,
        StatusSubmissao.CANCELADA,
    }:
        return status

    return StatusSubmissao.SUBMETIDA


def _extrair_dados_submissao(registro_legado: Atracao) -> dict:
    return {campo: getattr(registro_legado, campo) for campo in _CAMPOS_SUBMISSAO}


def sincronizar_submissao_por_registro_legado(registro_legado: Atracao) -> Submissao:
    status_submissao = _mapear_status_legado_para_submissao(registro_legado.status)
    dados_submissao = _extrair_dados_submissao(registro_legado)

    submissao, criada = Submissao.objects.get_or_create(
        registro_legado=registro_legado,
        defaults={
            "status_submissao": status_submissao,
            **dados_submissao,
        },
    )

    campos_para_atualizar = []

    if not criada and submissao.status_submissao != status_submissao:
        submissao.status_submissao = status_submissao
        campos_para_atualizar.append("status_submissao")

    for campo, valor in dados_submissao.items():
        if getattr(submissao, campo) != valor:
            setattr(submissao, campo, valor)
            campos_para_atualizar.append(campo)

    if campos_para_atualizar:
        submissao.save(update_fields=campos_para_atualizar)

    return submissao
