from django.db import models
from django.utils.translation import gettext_lazy as _


class StatusAprovacao(models.TextChoices):
    EM_AVALIACAO = "EM_AVALIACAO", _("Em avaliação")
    APROVADO = "APROVADO", _("Aprovado")
    REPROVADO = "REPROVADO", _("Reprovado")
    APROVADO_COM_RESSALVAS = "APROVADO_COM_RESSALVAS", _("Aprovado com Ressalvas")
