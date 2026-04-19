from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import Base
from .atracao import Atracao


class FuncaoEquipe(models.TextChoices):
    AUTOR = "AUTOR", _("Autor")
    COAUTOR = "COAUTOR", _("Coautor")
    COLABORADOR = "COLABORADOR", _("Colaborador")


class Coautor(Base):
    atracao = models.ForeignKey(
        Atracao,
        on_delete=models.CASCADE,
        related_name="equipe",
        verbose_name=_("Atração"),
    )
    nome = models.CharField(max_length=200, verbose_name=_("Nome"))
    instituicao_curso = models.CharField(
        max_length=250,
        verbose_name=_("Instituição/Curso"),
        blank=True,
        null=True
    )
    funcao = models.CharField(
        max_length=20,
        choices=FuncaoEquipe.choices,
        default=FuncaoEquipe.COAUTOR,
        verbose_name=_("Função")
    )

    class Meta(Base.Meta):
        verbose_name = _("Membro da Equipe")
        verbose_name_plural = _("Membros da Equipe")

    def __str__(self):
        return f"{self.nome} ({self.get_funcao_display()})"
