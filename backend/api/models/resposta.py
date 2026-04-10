from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _

from .base import Base
from .campo_formulario import CampoFormulario


class Resposta(Base):
    ativo = models.BooleanField(
        verbose_name=_("Ativo"),
        help_text=_("Informe se está ativo"),
        default=True,
    )

    campo_formulario = models.ForeignKey(CampoFormulario, on_delete=models.RESTRICT)
    valor = models.TextField(verbose_name=_("Valor"))
    # atracao = models.ForeinKey(Atracao, on_delete=models.RESTRICT)

    def clean(self):
        errors = {}
        if errors:
            raise ValidationError(errors)
