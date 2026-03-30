from django.db import models
from django.utils.translation import gettext_lazy as _


class NivelEnsino(models.TextChoices):
    ENSINO_MEDIO_INTEGRADO = "ENSINO_MEDIO_INTEGRADO", _("Ensino Médio Integrado")
    SUBSEQUENTE = "SUBSEQUENTE", _("Subsequente")
    GRADUACAO = "GRADUACAO", _("Graduação")
    POS_GRADUACAO = "POS_GRADUACAO", _("Pós Graduação")
    MESTRADO = "MESTRADO", _("Mestrado")
    LIVRE = "LIVRE", _("Livre")
