from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from ..enumerations.status_inscricao import StatusInscricao
from .base import Base
from .evento import Evento
from .perfil import Perfil


class InscricaoEvento(Base):
    status = models.CharField(
        choices=StatusInscricao,
        verbose_name=_("Status"),
        help_text=_("Status da Inscrição no Evento"),
        default=StatusInscricao.FILA_DE_ESPERA,
    )

    data_hora = models.DateField(
        verbose_name=_("Data e hora"),
        help_text=_("Data e hora das inscrição"),
        default=timezone.now,
    )

    perfil = models.ForeignKey(Perfil, on_delete=models.RESTRICT)

    evento = models.ForeignKey(Evento, on_delete=models.RESTRICT)

    def clean(self):
        errors = {}
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.id} {self.perfil.usuario.nome} {self.status} {self.data_hora}"
