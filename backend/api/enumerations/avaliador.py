from django.db import models
from django.utils.translation import gettext_lazy as _


class Avaliador(models.TextChoices):
    CIENCIAS_EXATAS_E_DA_TERRA = (
        "André Luiz Barbosa Penha",
        _("André Luiz Barbosa Penha"),
    )
    CIENCIAS_BIOLOGICAS = "ANDRÉ LUIZ PENHA", _("André Luiz Penha")
    ENGENHARIAS = "ANDRÉ PENHA", _("André Penha")
    CIENCIAS_DA_SAUDE = "ANDRÉ", _("André")
    CIENCIAS_AGRARIAS = "PENHA", _("Penha")
    CIENCIAS_SOCIAIS_APLICADAS = "ANDRÉ LUIZ", _("André Luiz")
    CIENCIAS_HUMANAS = "ANDRE BARBOSA PENHA", _("André Barbosa Penha")
    LINGUISTICA_LETRAS_E_ARTES = "ANDRÉ BARBOSA", _("André Barbosa")
