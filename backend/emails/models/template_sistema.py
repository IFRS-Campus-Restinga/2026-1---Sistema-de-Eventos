from django.db import models
from .base import BaseModel
from django.utils.translation import gettext_lazy as _


class CategoriaTemplateSistema(models.TextChoices):
    TRANSACIONAL = "TRANSACIONAL", _("Transacional (Sistema)")
    MANUAL = "MANUAL", _("Manual (Interface)")


class TemplateSistema(BaseModel):
    # Identificar interno para o backend encontrar
    identificador = models.SlugField(
        max_length=50, unique=True, editable=False
    )  # Exemplo: "welcome_email
    categoria = models.CharField(
        max_length=20,
        choices=CategoriaTemplateSistema.choices,
        default=CategoriaTemplateSistema.MANUAL,
        verbose_name=_("Categoria"),
    )

    def __str__(self):
        return f"{self.nome_exibicao}  —  slug:{self.identificador}"
