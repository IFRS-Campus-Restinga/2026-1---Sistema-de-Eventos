from django.core.validators import (
    DecimalValidator,
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models
from django.utils.translation import gettext_lazy as _

from .avaliacao_submissao import AvaliacaoSubmissao
from .base import Base
from .criterio_avaliacao_submissao import CriterioAvaliacaoSubmissao


class ItemAvaliacaoSubmissao(Base):
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
        CriterioAvaliacaoSubmissao,
        on_delete=models.CASCADE,
    )

    avaliacao_submissao = models.ForeignKey(
        AvaliacaoSubmissao, on_delete=models.CASCADE, related_name="itens"
    )

    class Meta(Base.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=["avaliacao_submissao", "criterio_avaliacao"],
                name="unique_criterio_por_avaliacao_submissao",
            )
        ]

    def __str__(self):
        return f"{self.avaliacao_submissao.id} - {self.criterio_avaliacao.id} - {self.nota}"
