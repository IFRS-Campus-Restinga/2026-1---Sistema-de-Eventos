from django.core.validators import (
    DecimalValidator,
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models
from django.utils.translation import gettext_lazy as _

from .atracao import Atracao
from .base import Base


class AvaliacaoAtracao(Base):
    nota_final = models.DecimalField(
        verbose_name=_("Nota Final"),
        max_digits=3,
        decimal_places=1,
        help_text=_(
            "Nota Final da avaliação",
            validators=[
                MinValueValidator(0),
                MaxValueValidator(10),
                DecimalValidator(max_digits=3, decimal_places=1),
            ],
        ),
    )

    atracao = models.ForeignKey(Atracao)

    destaque_do_dia = models.BooleanField(
        verbose_name=_("Destaque do dia"),
        help_text=_("A atração deve ser indicado como destaque"),
    )

    data_avaliacao = models.DateTimeField(
        verbose_name=_("Data da avaliação"),
        help_text=_("Data da avaliação"),
    )

    compareceu = models.BooleanField(
        verbose_name=_("Compareceu"), help_text=_("Compareceu")
    )

    parecer = models.TextField(
        verbose_name=_("Parecer"), help_text=_("Parecer da avaliação")
    )
