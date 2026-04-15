from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from ..enumerations.tipo_campo import TipoCampo
from .base import Base
from .modalidade import Modalidade


class CampoFormulario(Base):
    nome = models.CharField(
        verbose_name=_("Nome"),
        help_text=_("Informe o nome do Campo"),
        max_length=50,
        validators=[MaxLengthValidator(50), MinLengthValidator(3)],
    )

    tipo_dado = models.CharField(
        verbose_name=_("Tipo de dado"),
        help_text=_("Selecione o tipo de dado"),
        choices=TipoCampo,
        max_length=50,
    )

    obrigatorio = models.BooleanField(
        verbose_name=_("Obrigatório"),
        help_text=_("Informe se o campo é obrigatório"),
        default=True,
    )

    ativo = models.BooleanField(
        verbose_name=_("Ativo"),
        help_text=_("Informe se o campo está ativo"),
        default=True,
    )

    modalidade = models.ForeignKey(Modalidade, on_delete=models.RESTRICT)

    def clean(self):
        errors = {}

        if len(self.nome.strip()) < 3:
            errors["nome"] = _("O nome deve ter pelo menos 3 caracteres.")

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.nome}"
