from django.core.exceptions import ValidationError
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
    data_horario_inicio = models.DateTimeField(
        verbose_name=_("Data e hora de início da sessão")
    )
    data_horario_fim = models.DateTimeField(
        verbose_name=_("Data e hora de término da sessão")
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
        return f"{self.evento.nome}: {self.data_horario_inicio}"
