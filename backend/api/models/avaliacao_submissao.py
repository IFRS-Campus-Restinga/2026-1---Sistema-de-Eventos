from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from ..enumerations.status_aprovacao import StatusAprovacao
from .atracao import Atracao
from .base import Base
from .criterio_avaliacao import CriterioAvaliacao


class AvaliacaoSubmissao(Base):
    atracao = models.ForeignKey(
        Atracao,
        on_delete=models.CASCADE,
        related_name="avaliacoes",
        verbose_name=_("Submissão"),
    )
    avaliador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="avaliacoes_realizadas",
        verbose_name=_("Avaliador"),
    )
    parecer = models.TextField(
        verbose_name=_("Parecer"),
        help_text=_("Informe o parecer geral sobre a submissão"),
        blank=True,
        default="",
    )
    status = models.CharField(
        choices=StatusAprovacao.choices,
        max_length=30,
        verbose_name=_("Status"),
        default=StatusAprovacao.EM_AVALIACAO,
    )

    class Meta(Base.Meta):
        verbose_name = _("Avaliação de Submissão")
        verbose_name_plural = _("Avaliações de Submissão")
        unique_together = [("atracao", "avaliador")]

    def __str__(self):
        return f"Avaliação de '{self.atracao}' por {self.avaliador}"


class NotaCriterio(Base):
    avaliacao = models.ForeignKey(
        AvaliacaoSubmissao,
        on_delete=models.CASCADE,
        related_name="notas",
        verbose_name=_("Avaliação"),
    )
    criterio = models.ForeignKey(
        CriterioAvaliacao,
        on_delete=models.CASCADE,
        related_name="notas",
        verbose_name=_("Critério"),
    )
    nota = models.IntegerField(
        verbose_name=_("Nota"),
        help_text=_("Nota de 0 a 10"),
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )

    class Meta(Base.Meta):
        verbose_name = _("Nota por Critério")
        verbose_name_plural = _("Notas por Critério")
        unique_together = [("avaliacao", "criterio")]

    def __str__(self):
        return f"{self.criterio.nome}: {self.nota}"
