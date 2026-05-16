from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.db import models
from django.db.models import Avg
from django.utils.translation import gettext_lazy as _

from .atracao import Atracao
from .base import Base


class AvaliacaoAtracao(Base):
    avaliador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="avaliacoes_atracao",
        null=True,
        blank=True,
    )

    class Meta(Base.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=["atracao", "avaliador"], name="unique_avaliador_por_atracao"
            )
        ]

    @property
    def nota_final(self):
        avg = self.itens.aggregate(avg=Avg("nota"))["avg"]
        if avg is None:
            return None
        return Decimal(avg).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    atracao = models.ForeignKey(Atracao, on_delete=models.RESTRICT)

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
