from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _

from .base import Base
from .campo_formulario import CampoFormulario
from .submissao import Submissao


class Resposta(Base):
    ativo = models.BooleanField(
        verbose_name=_("Ativo"),
        help_text=_("Informe se está ativo"),
        default=True,
    )

    campo_formulario = models.ForeignKey(CampoFormulario, on_delete=models.RESTRICT)
    atracao = models.ForeignKey(
        Submissao,
        on_delete=models.CASCADE,
        related_name="respostas",
        null=True,
        blank=True,
    )
    valor = models.TextField(verbose_name=_("Valor"))

    def clean(self):
        errors = {}
        if errors:
            raise ValidationError(errors)
