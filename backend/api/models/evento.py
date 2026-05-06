from django.contrib import admin
from django.core.exceptions import ValidationError
from django.core.validators import (
    MaxLengthValidator,
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models

from ..enumerations.setor import Setor
from ..enumerations.status_evento import StatusEvento
from .area_conhecimento import AreaConhecimento
from .base import Base
from .local import Local
from .modalidade import Modalidade


class Evento(Base):
    nome = models.CharField(
        max_length=100,
        help_text="informe o nome do evento",
        validators=[MaxLengthValidator(100)],
    )
    descricao = models.TextField(
        max_length=500,
        verbose_name="descrição",
        help_text="Forneça uma descrição detalhada do evento",
        validators=[MaxLengthValidator(500)],
    )
    status_evento = models.CharField(
        choices=StatusEvento.choices,
        verbose_name="status do evento",
        help_text="informe o status do evento",
        max_length=20,
        default=StatusEvento.EM_PLANEJAMENTO,
    )
    carga_horaria = models.PositiveIntegerField(
        verbose_name="carga horária",
        help_text="informe a carga horária do evento",
        validators=[MinValueValidator(1), MaxValueValidator(200)],
    )
    setor = models.CharField(
        choices=Setor.choices,
        help_text="infome o setor destinado ao evento",
        max_length=(10),
        validators=[MaxLengthValidator(10)],
    )
    tema = models.CharField(
        help_text="informe o tema do evento",
        max_length=100,
        validators=[MaxLengthValidator(100)],
    )
    local = models.ForeignKey(Local, on_delete=models.RESTRICT, null=False, blank=False)
    modalidades = models.ManyToManyField(
        Modalidade, related_name="eventos", null=False, blank=False
    )
    area_conhecimento = models.ManyToManyField(
        AreaConhecimento,
        related_name="eventos",
        verbose_name="áreas de conhecimento",
        null=False,
        blank=False,
    )

    # futuramente, fazer relacionamento com local
    class Meta:
        permissions = [
            ("coordenar_evento", "Pode coordenar este evento"),
            ("disabilitar_evento", "Pode desativar este evento"),
            ("organiza_evento", "Pode organizar este evento"),
        ]

    modalidades = models.ManyToManyField(
        Modalidade,
    )

    # futuramente, fazer relacionamento com local

    def __str__(self):
        return f"{self.nome}"

    def clean(self):
        errors = {}

        if self.nome == "" or not self.nome.strip():
            errors["nome"] = "O nome do evento não pode estar em branco."
        elif self.descricao == "" or not self.descricao.strip():
            errors["descricao"] = "O evento deve ter uma descrição."
        elif self.carga_horaria == 0 or self.carga_horaria < 0:
            errors["carga_horaria"] = "Carga horária inválida"
        elif self.tema == "" or not self.tema.strip():
            errors["tema"] = "O tema do evento não pode estar em branco"
        elif self.setor == "" or not self.setor.strip():
            errors["setor"] = "Este campo não pode estar em branco"
        elif self.status_evento == "" or not self.status_evento.strip():
            errors["status_evento"] = "Este campo não pode estar em branco"
        if not hasattr(self, "local") or self.local is None:
            errors["local"] = "Você deve selecionar um local para o evento."

        if errors:
            raise ValidationError(errors)


class EventoAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "status_evento", "setor", "carga_horaria")
    list_filter = ("status_evento", "setor")
    search_fields = ("nome", "tema")
