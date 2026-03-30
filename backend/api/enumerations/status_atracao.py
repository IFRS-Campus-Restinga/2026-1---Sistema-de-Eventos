from django.db import models
from django.utils.translation import gettext_lazy as _


class StatusAtracao(models.TextChoices):
    PREVISTA = "PREVISTA", _("Prevista")
    CONFIRMADA = "CONFIRMADA", _("Confirmada")
    CANCELADA = "CANCELADA", _("Cancelada")
    EM_ANDAMENTO = "EM_ANDAMENTO", _("Em Andamento")
    ENCERRADA = "ENCERRADA", _("Encerrada")
