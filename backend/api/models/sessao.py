from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .base import Base


class Sessao(Base):
    evento = models.ForeignKey(
        "Evento", on_delete=models.CASCADE, related_name="sessoes"
    )
    espaco = models.ForeignKey(
        "Espaco",
        on_delete=models.CASCADE,
        related_name="sessoes",
        verbose_name=_("Espaço"),
    )
    atracoes = models.ManyToManyField(
        "Atracao",
        through="OrdemApresentacaoAtracao",
        related_name="sessoes",
    )
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(3)],
        verbose_name=_("Nome da sessão"),
        null=True,
        blank=True,
    )
    data_horario_inicio = models.DateTimeField(
        auto_now=False,
        auto_now_add=False,
        verbose_name=_("Data e hora de início da sessão"),
    )
    data_horario_fim = models.DateTimeField(
        auto_now=False,
        auto_now_add=False,
        verbose_name=_("Data e hora de término da sessão"),
    )
    publicado_em = models.DateTimeField(
        auto_now=False,
        auto_now_add=False,
        blank=True,
        null=True,
        verbose_name=_("Data de publicação da programação"),
    )
    ativo = models.BooleanField(verbose_name=_("Ativo"), default=True)

    """Não sei se é assim que funciona

    sim, é assim a primeira parte das permissões, vou deixar assim pra mais tarde. -Breno

    class Meta:
        permissions = [
            ("ver_sessao", "Pode visualizar as sessões"),
            ("criar_sessao", "Pode criar sessões"),
            ("excluir_sessao", "Pode excluir sessões"),
            ("atribuir_sessao", "Pode atribuir sessões"),
        ]
    """

    def clean(self):
        errors = {}

        #  Validação de cronologia
        if self.data_horario_inicio and self.data_horario_fim:
            if self.data_horario_inicio >= self.data_horario_fim:
                errors["data_horario_fim"] = _(
                    "A data de fim deve ser posterior à data de início."
                )

        # Validação de data retroativa
        if self.data_horario_inicio < timezone.now():
            errors["data_horario_inicio"] = _(
                "A data de início não pode ser no passado."
            )

        if self.publicado_em and self.publicado_em < timezone.now():
            errors["publicado_em"] = _("A data de publicação não pode ser no passado.")

        # o mesmo espaço seja usado em sessões diferentes ao mesmo tempo
        conflitos = Sessao.objects.filter(
            espaco=self.espaco,
            data_horario_inicio__lt=self.data_horario_fim,
            data_horario_fim__gt=self.data_horario_inicio,
        ).exclude(pk=self.pk)  # Exclui a própria sessão em caso de edição

        if conflitos.exists():
            errors["__all__"] = _(
                "Este espaço já possui uma sessão agendada neste horário."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.evento.nome} / {self.nome}: {self.data_horario_inicio}"
