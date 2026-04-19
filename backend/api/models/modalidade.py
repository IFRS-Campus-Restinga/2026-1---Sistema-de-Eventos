from django.core.exceptions import ValidationError
from django.core.validators import (
    MaxLengthValidator,
    MinLengthValidator,
    MinValueValidator,
)
from django.db import models
from django.utils.translation import gettext_lazy as _

from .base import Base


class Modalidade(Base):
    nome = models.CharField(
        verbose_name=_("Nome"),
        help_text=_("Informe o nome da Modalidade"),
        max_length=50,
        validators=[MaxLengthValidator(50), MinLengthValidator(3)],
    )

    requer_avaliacao = models.BooleanField(
        verbose_name=_("Requer Avaliação"),
        help_text=_("Informe se a Modalidade requer avaliação"),
    )

    requer_avaliacao_submissao = models.BooleanField(
        verbose_name=_("Requer Avaliação de Submissão"),
        help_text=_("Informe se a Modalidade requer avaliação de submissão"),
    )

    emite_certificado = models.BooleanField(
        verbose_name=_("Emite certificado"),
        help_text=_("Informe se a Modalidade emite certificado"),
    )

    limite_vagas = models.IntegerField(
        verbose_name=_("Número de vagas"),
        help_text=_("Informe se há um limite de vagas"),
        validators=[MinValueValidator(0)],
        default=0,
    )

    limite_avaliadores = models.IntegerField(
        verbose_name=_("Número de avaliadores"),
        help_text=_("Informe se há um limite de avaliadores"),
        validators=[MinValueValidator(0)],
        default=2,
    )

    ativo = models.BooleanField(
        verbose_name=_("Ativo"),
        help_text=_("Informe se a Modalidade está ativa"),
        default=True,
    )

    def clean(self):
        errors = {}

        if ((not self.requer_avaliacao) or (not self.requer_avaliacao_submissao)) and (
            self.limite_avaliadores and self.limite_avaliadores > 0
        ):
            errors["limite_avaliadores"] = _(
                "Não pode haver limite de avaliadores se não há avaliação."
            )

        if len(self.nome.strip()) < 3:
            errors["nome"] = _("O nome deve ter pelo menos 3 caracteres.")

        if (
            Modalidade.objects.filter(
                nome__iexact=self.nome,
            )
            .exclude(pk=self.pk)
            .exists()
        ):
            errors["__all__"] = _("Já existe uma Modalidade com esse nome.")

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.nome}"
