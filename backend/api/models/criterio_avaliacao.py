from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from .base import Base
from .modalidade import Modalidade


class CriterioAvaliacao(Base):
    nome = models.CharField(
        verbose_name=_("Nome"),
        help_text=_("Informe o nome do Critério"),
        max_length=50,
        validators=[MaxLengthValidator(50), MinLengthValidator(3)],
    )

    descricao = models.CharField(
        verbose_name=_("Descrição"),
        help_text=_("Informe uma descrição para o Critério"),
        max_length=255,
        validators=[MaxLengthValidator(255), MinLengthValidator(3)],
    )

    ativo = models.BooleanField(
        verbose_name=_("Ativo"),
        help_text=_("Informe se o Critério está ativo"),
        default=True,
    )

    modalidade = models.ForeignKey(Modalidade, on_delete=models.CASCADE)

    def clean(self):
        errors = {}

        if len(self.nome.strip()) <= 3:
            errors["nome"] = _("O nome deve ter pelo menos 3 caracteres.")

        if len(self.descricao.strip()) <= 3:
            errors["descricao"] = _("A descrição deve ter pelo menos 3 caracteres.")

        # Verifica se a modalidade vinculada requer avaliação
        modalidade = getattr(self, "modalidade", None)
        if modalidade is None and getattr(self, "modalidade_id", None):
            modalidade = Modalidade.objects.filter(pk=self.modalidade_id).first()

        if (
            modalidade
            and not modalidade.requer_avaliacao
            or not modalidade.requer_avaliacao_submissao
        ):
            errors["modalidade"] = _(
                "Não é possível vincular um critério a uma modalidade que não requer avaliação."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.nome}"
