from django.db import models

from ..enumerations.status_atracao import StatusAtracao
from .base import Base
from .evento import Evento
from .espaco import Espaco
from .modalidade import Modalidade
from .submissao import Submissao


class Atracao(Base):
    submissao = models.OneToOneField(
        Submissao,
        on_delete=models.CASCADE,
        related_name="atracao",
        verbose_name="Submissão",
        null=True,
        blank=True,
    )

    modalidade = models.ForeignKey(
        Modalidade,
        on_delete=models.PROTECT,
        related_name="atracoes",
        verbose_name="Modalidade",
        null=True,
        blank=True,
    )
    evento = models.ForeignKey(
        Evento,
        on_delete=models.PROTECT,
        related_name="atracoes",
        verbose_name="Evento",
    )
    status = models.CharField(
        choices=StatusAtracao.choices,
        max_length=30,
        verbose_name="Status",
        default=StatusAtracao.PREVISTA,
    )
    data_hora_inicio = models.DateTimeField(null=True, blank=True)
    data_hora_fim = models.DateTimeField(null=True, blank=True)
    espaco = models.ForeignKey(
        Espaco,
        on_delete=models.SET_NULL,
        related_name="atracoes",
        verbose_name="Espaço",
        null=True,
        blank=True,
    )
    local_atracao = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name="Local",
        help_text="Descrição legada do local da atração",
    )

    def clean(self):
        from django.core.exceptions import ValidationError

        errors = {}

        if self.espaco_id and self.evento_id:
            espaco_local_id = getattr(self.espaco, "local_id", None)
            evento_local_id = getattr(self.evento, "local_id", None)

            if (
                espaco_local_id
                and evento_local_id
                and espaco_local_id != evento_local_id
            ):
                errors["espaco"] = (
                    "O espaço selecionado precisa pertencer ao mesmo local do evento."
                )

        if errors:
            raise ValidationError(errors)

    class Meta(Base.Meta):
        verbose_name = "Atração"
        verbose_name_plural = "Atrações"
        ordering = ["-id"]
        permissions = [("avaliar_atracao", "Pode avaliar esta atração")]

    def __str__(self):
        titulo = getattr(self.submissao, "titulo", "") if self.submissao_id else ""
        return f"{titulo} — {self.evento}"
