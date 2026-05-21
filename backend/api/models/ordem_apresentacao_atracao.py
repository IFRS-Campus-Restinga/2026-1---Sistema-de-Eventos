from django.core.validators import MinValueValidator
from django.db import models

from .atracao import Atracao
from .base import Base
from .sessao import Sessao


class OrdemApresentacaoAtracao(Base):
    sessao = models.ForeignKey(
        Sessao, on_delete=models.RESTRICT, related_name="ordem_apresentacoes"
    )

    atracao = models.ForeignKey(
        Atracao, on_delete=models.CASCADE, related_name="ordem_apresentacoes"
    )

    ordem = models.IntegerField(
        validators=[MinValueValidator(1)], verbose_name="Ordem de Apresentação"
    )

    class Meta:
        ordering = ["ordem"]
        unique_together = ("sessao", "ordem")
