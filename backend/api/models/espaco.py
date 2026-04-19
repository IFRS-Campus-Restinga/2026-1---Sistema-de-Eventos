from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from .base import Base
from .local import Local


class Espaco(Base):
    nome = models.CharField(
        max_length=250, validators=[MinLengthValidator(3)], verbose_name=_("Nome")
    )
    capacidade = models.IntegerField(
        validators=[MinValueValidator(1)], verbose_name=_("Capacidade")
    )
    predio_bloco = models.CharField(
        max_length=250,
        validators=[MinLengthValidator(3)],
        verbose_name=_("Prédio/Bloco"),
        help_text=_("Digite o bloco/prédio que este espaço está localizado. "),
    )
    recursos_disponiveis = models.TextField(
        verbose_name=_("Recursos disponíveis"),
        help_text=_("Recursos disponíveis no espaço. Ex.: projetor, computador."),
    )
    ativo = models.BooleanField(verbose_name=_("Ativo"))
    local = models.ForeignKey(Local, on_delete=models.CASCADE, related_name="espacos")

    class Meta:
        permissions = [
            ("ver_espaco", "Pode visualizar os espacos"),
            ("criar_espaco", "Pode criar espacos"),
            ("excluir_espaco", "Pode excluir espacos"),
            ("atribuir_espaco", "Pode atribuir espacos"),
        ]

    def clean(self):
        errors = {}

        # capacidade não pode ser 0
        if self.capacidade <= 0:
            raise ValidationError("A capacidade deve ser maior que zero.")

        # nome não pode ser só número
        if self.nome.isdigit():
            errors["nome"] = _("O nome não pode conter apenas números.")

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.nome}"
