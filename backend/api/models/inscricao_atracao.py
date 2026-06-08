from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from ..enumerations.status_inscricao import StatusInscricao
from ..enumerations.tipo_etapa import TipoEtapa
from .atracao import Atracao
from .base import Base
from .evento import Evento
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

    evento = models.ForeignKey(
        Evento,
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
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
        now = timezone.now()

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

        if self.atracao_id:
            atracao = getattr(self, "atracao", None)
            submissao = getattr(atracao, "submissao", None) if atracao is not None else None
            evento_obj = getattr(self, "evento", None) or (
                getattr(submissao, "evento", None) if submissao is not None else None
            )

            etapa = None
            if evento_obj is not None:
                etapas_relacionadas = getattr(evento_obj, "etapas", None)
                if etapas_relacionadas is not None:
                    etapa = etapas_relacionadas.filter(
                        tipo_etapa=TipoEtapa.INSCRICAO_PUBLICO
                    ).first()

            if etapa is None:
                errors["atracao"] = _(
                    "Evento sem período de inscrição (INSCRICAO_PUBLICO) configurado. Contate o organizador."
                )
            else:
                inicio = getattr(etapa, "data_inicio", None)
                fim = getattr(etapa, "data_fim", None)

                if not (inicio and fim):
                    errors["atracao"] = _(
                        "Período de inscrições não está configurado para este evento."
                    )
                else:
                    if not (inicio <= now <= fim):
                        errors["atracao"] = _(
                            "Inscrição não concluída, o evento não está com as inscrições abertas."
                        )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.id} {self.perfil.usuario.nome} {self.status} {self.data_hora}"
