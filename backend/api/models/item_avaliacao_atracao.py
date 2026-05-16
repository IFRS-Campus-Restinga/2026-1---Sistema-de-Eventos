from django.core.validators import (
    DecimalValidator,
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models
from django.utils.translation import gettext_lazy as _

from .avaliacao_atracao import AvaliacaoAtracao
from .base import Base
from .criterio_avaliacao_atracao import CriterioAvaliacaoAtracao


class ItemAvaliaçãoAtracao(Base):
    nota = models.DecimalField(
        verbose_name=_("Nota"),
        help_text=_("Nota do critério"),
        max_digits=3,
        decimal_places=1,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(10),
            DecimalValidator(max_digits=3, decimal_places=1),
        ],
    )

    criterio_avaliacao = models.ForeignKey(
        CriterioAvaliacaoAtracao,
        on_delete=models.RESTRICT,
    )

    avaliacao_atracao = models.ForeignKey(
        AvaliacaoAtracao, on_delete=models.RESTRICT, related_name="itens"
    )

    def __str__(self):
        return (
            f"{self.avaliacao_atracao.id} - {self.criterio_avaliacao.id} - {self.nota}"
        )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["avaliacao_atracao", "criterio_avaliacao"],
                name="unique_criterio_por_avaliacao",
            )
        ]
