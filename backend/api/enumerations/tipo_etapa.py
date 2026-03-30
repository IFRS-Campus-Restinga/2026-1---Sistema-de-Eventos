from django.db import models
from django.utils.translation import gettext_lazy as _


class TipoEtapa(models.TextChoices):
    SUBMISSAO_TRABALHOS = "SUBMISSAO_TRABALHOS", _("Submissão de Trabalhos")
    AVALIACAO_PREVIA = "AVALIACAO_PREVIA", _("Avaliação Prévia")
    HOMOLOGACAO = "HOMOLOGACAO", _("Homologação")
    INSCRICAO_PUBLICO = "INSCRICAO_PUBLICO", _("Inscrição do Público")
    REALIZACAO_EVENTO = "REALIZACAO_EVENTO", _("Realização do Evento")
