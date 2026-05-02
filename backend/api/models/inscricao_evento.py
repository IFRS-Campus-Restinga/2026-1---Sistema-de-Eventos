from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from ..enumerations.status_inscricao import StatusInscricao
from ..enumerations.tipo_etapa import TipoEtapa
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

    presente = models.BooleanField(
        verbose_name=_("Presente"),
        help_text=_("Informe se o perfil está presente no evento"),
        default=False,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["perfil", "evento"],
                name="uniq_inscricao_evento_perfil_evento",
            )
        ]

    def clean(self):
        errors = {}
        now = timezone.now()

        if self.perfil_id and self.evento_id:
            inscricao = self.__class__.objects.filter(
                perfil_id=self.perfil_id, evento_id=self.evento_id
            )
            if self.pk:
                inscricao = inscricao.exclude(pk=self.pk)
            if inscricao.exists():
                errors["evento"] = _(
                    "Já existe uma inscrição para este perfil neste evento."
                )

        if self.evento_id:
            evento = getattr(self, "evento", None)
            etapa = getattr(evento, "etapa_evento", None)

            if etapa is None:
                errors["evento"] = _(
                    "Evento sem etapa configurada para inscrições. Contate o organizador."
                )
            else:
                tipo = getattr(etapa, "tipo_etapa", None)
                inicio = getattr(etapa, "data_inicio", None)
                fim = getattr(etapa, "data_fim", None)

                if tipo != TipoEtapa.SUBMISSAO_TRABALHOS:
                    if not (inicio and fim):
                        errors["evento"] = _(
                            "Período de inscrições não está configurado para este evento."
                        )
                    else:
                        if not (inicio <= now <= fim):
                            errors["evento"] = _(
                                "Inscrição não concluída, o evento não está com as inscrições abertas."
                            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.id} {self.perfil.usuario.nome} {self.status} {self.data_hora}"
