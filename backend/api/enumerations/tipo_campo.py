from django.db import models
from django.utils.translation import gettext_lazy as _


class TipoCampo(models.TextChoices):
    TEXTO = "TEXTO", _("Texto")
    NUMERO = "NUMERO", _("Número")
    BOOLEANO = "BOOLEANO", _("Booleano")
    ARQUIVO = "ARQUIVO", _("Arquivo")
    