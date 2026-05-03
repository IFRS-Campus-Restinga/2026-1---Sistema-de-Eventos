from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _

from ..enumerations.tipo_etapa import TipoEtapa
from .base import Base
from .evento import Evento


class EtapaEvento(Base):
    tipo_etapa = models.CharField(
        max_length=50,
        choices=TipoEtapa.choices,
        verbose_name=_("Tipo de etapa"),
        help_text=_("Selecione o tipo de etapa do evento"),
    )

    data_inicio = models.DateTimeField(
        verbose_name=_("Data de início"), help_text=_("Informe a data de início")
    )

    data_fim = models.DateTimeField(
        verbose_name=_("Data de fim"), help_text=_("Informe a data de fim")
    )

    evento = models.ForeignKey(
        Evento,
        on_delete=models.RESTRICT,
        verbose_name=_("Evento"),
        related_name="etapas",
        null=True,
        blank=False,
    )

    class Meta:
        verbose_name = _("Etapa do evento")
        constraints = [
            models.UniqueConstraint(
                fields=["tipo_etapa", "evento"],
                name="uniq_etapa_evento_tipo_etapa_evento",
            )
        ]

    def clean(self):
        errors = {}

        if self.data_inicio and self.data_fim:
            if self.data_fim <= self.data_inicio:
                errors["data_fim"] = _(
                    "A data de fim deve ser posterior à data de início."
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.id} {self.tipo_etapa} {self.evento.nome} {self.data_inicio} {self.data_fim}"
