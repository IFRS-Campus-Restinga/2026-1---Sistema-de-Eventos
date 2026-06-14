from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Avg
from django.utils.translation import gettext_lazy as _

from ..enumerations.status_aprovacao import StatusAprovacao
from .base import Base
from .submissao import Submissao


class AvaliacaoSubmissao(Base):
    avaliador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="avaliacoes_submissoes",
        verbose_name=_("Avaliador"),
        help_text=_("Usuário que realizará a avaliação"),
        null=True,
        blank=True,
    )

    class Meta(Base.Meta):
        verbose_name = _("Avaliação de Submissão")
        verbose_name_plural = _("Avaliações de Submissões")
        constraints = [
            models.UniqueConstraint(
                fields=["submissao", "avaliador"],
                name="unique_avaliador_por_submissao",
            )
        ]

    @property
    def nota_final(self):
        avg = self.itens.aggregate(avg=Avg("nota"))["avg"]
        if avg is None:
            return None
        return Decimal(avg).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    submissao = models.ForeignKey(
        Submissao,
        on_delete=models.RESTRICT,
        related_name="avaliacoes",
        verbose_name=_("Submissão"),
        help_text=_("Submissão de trabalho a ser avaliada"),
    )

    status_aprovacao = models.CharField(
        choices=StatusAprovacao.choices,
        max_length=30,
        verbose_name=_("Status de Aprovação"),
        help_text=_("Resultado da avaliação"),
        default=StatusAprovacao.EM_AVALIACAO,
    )

    data_avaliacao = models.DateTimeField(
        verbose_name=_("Data da Avaliação"),
        help_text=_("Data e hora em que a avaliação foi realizada"),
    )

    parecer = models.TextField(
        verbose_name=_("Parecer"),
        help_text=_("Parecer da avaliação"),
    )

    def clean(self):
        errors = {}

        # Valida se o avaliador não é o mesmo que orientou/submeteu o trabalho
        if (
            self.avaliador
            and self.submissao
            and getattr(self.submissao, "orientador", None)
        ):
            if self.avaliador == self.submissao.orientador:
                errors["avaliador"] = _(
                    "O avaliador não pode ser o mesmo que fez a submissão"
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        avaliador_nome = self.avaliador.username if self.avaliador else "Sem avaliador"
        return f"Avaliação: {self.submissao.titulo} - {avaliador_nome} - {self.status_aprovacao}"
