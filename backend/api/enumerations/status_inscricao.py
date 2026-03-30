from django.db import models
from django.utils.translation import gettext_lazy as _


class StatusInscricao(models.TextChoices):
    CONFIRMADA = "CONFIRMADA", _("Confirmada")
    CANCELADA = "CANCELADA", _("Cancelada")
    FILA_DE_ESPERA = "FILA_DE_ESPERA", _("Fila de Espera")
