from django.db import models
from django.utils.translation import gettext_lazy as _


class StatusEvento(models.TextChoices):
    EM_ANDAMENTO = "EM_ANDAMENTO", _("Em andamento")
    ENCERRADO = "ENCERRADO", _("Encerrado")
    EM_PLANEJAMENTO = "EM_PLANEJAMENTO", _("Em Planejamento")
