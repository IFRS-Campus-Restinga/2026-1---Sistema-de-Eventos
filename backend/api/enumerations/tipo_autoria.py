from django.db import models
from django.utils.translation import gettext_lazy as _


class TipoAutoria(models.TextChoices):
    AUTOR = "AUTOR", _("Autor")
    COAUTOR = "COAUTOR", _("Coautor")
    ORIENTADOR = "ORIENTADOR", _("Orientador")
