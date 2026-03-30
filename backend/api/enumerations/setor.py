from django.db import models
from django.utils.translation import gettext_lazy as _


class Setor(models.TextChoices):
    ENSINO = "ENSINO", _("Ensino")
    PESQUISA = "PESQUISA", _("Pesquisa")
    EXTENSAO = "EXTENSAO", _("Extensão")
