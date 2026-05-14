from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from .avaliacao_atracao import AvaliacaoAtracao
from .base import Base
from .criterio_avaliacao_atracao import CriterioAvaliacaoAtracao


class ItemAvaliaçãoAtracao(Base):
    nota = models.DecimalField(
        verbose_name=_("Nota"),
        help_text=_("Nota do critério"),
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )

    criterio_avaliacao = models.ForeignKey(
        CriterioAvaliacaoAtracao,
        on_delete=models.RESTRICT,
    )

    avaliacao_atracao = models.ForeignKey(AvaliacaoAtracao, on_delete=models.RESTRICT)

    def __str__(self):
        return (
            f"{self.avaliacao_atracao.id} - {self.criterio_avaliacao.id} - {self.nota}"
        )
