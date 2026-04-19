from django.db import models
from django.utils.translation import gettext_lazy as _


class AreaConhecimentoEscolha(models.TextChoices):
    CIENCIAS_EXATAS_E_DA_TERRA = ("CIENCIAS_EXATAS_E_DA_TERRA", _("Ciências Exatas e da Terra"),)
    CIENCIAS_BIOLOGICAS = "CIENCIAS_BIOLOGICAS", _("Ciências Biológicas")
    ENGENHARIAS = "ENGENHARIAS", _("Engenharias")
    CIENCIAS_DA_SAUDE = "CIENCIAS_DA_SAUDE", _("Ciências da Saúde")
    CIENCIAS_AGRARIAS = "CIENCIAS_AGRARIAS", _("Ciências Agrárias")
    CIENCIAS_SOCIAIS_APLICADAS = ("CIENCIAS_SOCIAIS_APLICADAS", _("Ciências Sociais Aplicadas"),)
    CIENCIAS_HUMANAS = "CIENCIAS_HUMANAS", _("Ciências Humanas")
    LINGUISTICA_LETRAS_E_ARTES = ("LINGUISTICA_LETRAS_E_ARTES", _("Linguística Letras e Artes"),)
