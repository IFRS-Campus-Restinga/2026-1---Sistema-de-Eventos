from django.db import models
from django.utils.translation import gettext_lazy as _


class StatusSubmissao(models.TextChoices):
    SUBMETIDA = "SUBMETIDA", _("Submetida")
    EM_AVALIACAO = "EM_AVALIACAO", _("Em Avaliação")
    APROVADA = "APROVADA", _("Aprovada")
    REPROVADA = "REPROVADA", _("Reprovada")
    CANCELADA = "CANCELADA", _("Cancelada")
    CONVERTIDA_EM_ATRACAO = "CONVERTIDA_EM_ATRACAO", _("Convertida em Atração")
