from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from ..enumerations.tipo_autoria import TipoAutoria
from .atracao import Atracao
from .base import Base


class Autoria(Base):
    ordem = models.IntegerField(verbose_name=_("Ordem"))
    tipo = models.CharField(
        max_length=20,
        choices=TipoAutoria.choices,
        verbose_name=_("Tipo"),
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="autorias",
        verbose_name=_("Usuário"),
    )
    submissao = models.ForeignKey(
        Atracao,
        on_delete=models.CASCADE,
        related_name="autorias",
        verbose_name=_("Submissão"),
    )

    class Meta(Base.Meta):
        verbose_name = _("Autoria")
        verbose_name_plural = _("Autorias")

    def __str__(self):
        return f"{self.usuario} - {self.get_tipo_display()} ({self.ordem})"
