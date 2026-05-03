from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

from ..enumerations.status_aprovacao import StatusAprovacao
from .atracao import Atracao
from .base import Base


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

    submissao = models.ForeignKey(
        Atracao,
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
        default=timezone.now,
    )

    nota = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        verbose_name=_("Nota"),
        help_text=_("Nota da avaliação (0.0 a 10.0)"),
        validators=[MinValueValidator(Decimal("0.0")), MaxValueValidator(Decimal("10.0"))],
    )

    comentarios = models.TextField(
        verbose_name=_("Comentários"),
        help_text=_("Observações e justificativas da avaliação"),
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("Avaliação de Submissão")
        verbose_name_plural = _("Avaliações de Submissões")
        constraints = [
            models.UniqueConstraint(
                fields=["avaliador", "submissao"],
                name="uniq_avaliacao_submissao_avaliador_submissao",
            )
        ]

    def clean(self):
        errors = {}

        # Validar se a nota está dentro do intervalo permitido
        if self.nota is not None:
            if self.nota < Decimal("0") or self.nota > Decimal("10"):
                errors["nota"] = _("A nota deve estar entre 0.0 e 10.0")

        # Validar se o avaliador não é o mesmo que fez a submissão
        if self.avaliador and self.submissao and self.submissao.orientador:
            if self.avaliador == self.submissao.orientador:
                errors["avaliador"] = _(
                    "O avaliador não pode ser o mesmo que fez a submissão"
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        avaliador_nome = self.avaliador.username if self.avaliador else "Sem avaliador"
        return f"Avaliação: {self.submissao.titulo} - {avaliador_nome} - {self.status_aprovacao}"
