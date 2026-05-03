from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from ..enumerations.status_inscricao import StatusInscricao
from .atracao import Atracao
from .base import Base
from .perfil import Perfil


class InscricaoAtracao(Base):
    status = models.CharField(
        choices=StatusInscricao,
        verbose_name=_("Status"),
        help_text=_("Status da inscrição na atração"),
        default=StatusInscricao.FILA_DE_ESPERA,
    )

    data_hora = models.DateTimeField(
        verbose_name=_("Data e hora"),
        help_text=_("Data e hora da inscrição"),
        default=timezone.now,
    )

    perfil = models.ForeignKey(Perfil, on_delete=models.RESTRICT)

    atracao = models.ForeignKey(
        Atracao,
        on_delete=models.RESTRICT,
        related_name="inscricoes",
    )

    presente = models.BooleanField(
        verbose_name=_("Presente"),
        help_text=_("Informe se o perfil está presente na atração"),
        default=False,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["perfil", "atracao"],
                name="uniq_inscricao_atracao_perfil_atracao",
            )
        ]

    def clean(self):
        errors = {}

        if self.perfil_id and self.atracao_id:
            inscricao = self.__class__.objects.filter(
                perfil_id=self.perfil_id,
                atracao_id=self.atracao_id,
            )
            if self.pk:
                inscricao = inscricao.exclude(pk=self.pk)

            if inscricao.exists():
                errors["atracao"] = _(
                    "Já existe uma inscrição para este perfil nesta atração."
                )

        if errors:
            raise ValidationError(errors)
