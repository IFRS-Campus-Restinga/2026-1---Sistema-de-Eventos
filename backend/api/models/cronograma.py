from django import forms
from django.db import models
from django.contrib import admin

from ..enumerations.area_conhecimento_escolha import (
    AreaConhecimentoEscolha as AreaConhecimentoChoices,
)


class Cronograma(models.Model):
    evento = models.ForeignKey(
        "Evento",
        on_delete=models.CASCADE,
        related_name="cronogramas",
        help_text="Evento ao qual este cronograma pertence",
    )
    tipo_programacao = models.CharField(
        max_length=50, choices=AreaConhecimentoChoices.choices
    )
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.evento.nome} - {self.get_tipo_programacao_display()} - {self.data_inicio} até {self.data_fim}"


class CronogramaForm(forms.ModelForm):
    """Formulário customizado para exibir as enumerations de forma clara"""

    tipo_programacao = forms.ChoiceField(
        choices=AreaConhecimentoChoices.choices,
        widget=forms.RadioSelect(),
        help_text="Selecione uma das áreas de conhecimento disponíveis",
    )

    class Meta:
        model = Cronograma
        fields = ("evento", "tipo_programacao", "data_inicio", "data_fim", "ativo")


class CronogramaAdmin(admin.ModelAdmin):
    form = CronogramaForm
    list_display = (
        "id",
        "evento",
        "get_tipo_programacao_display",
        "data_inicio",
        "data_fim",
        "ativo",
    )
    list_filter = ("ativo", "tipo_programacao")
    search_fields = ("evento__nome", "tipo_programacao")
    fieldsets = (
        ("Informações Básicas", {"fields": ("evento", "ativo")}),
        (
            "Tipo de Programação",
            {
                "fields": ("tipo_programacao",),
                "description": "Selecione uma das seguintes áreas de conhecimento:",
            },
        ),
        ("Datas e Horários", {"fields": ("data_inicio", "data_fim")}),
    )
    readonly_fields = ()

    def get_tipo_programacao_display(self, obj):
        """Exibe o nome legível da enum AreaConhecimentoEscolha"""
        if obj.tipo_programacao:
            for value, label in AreaConhecimentoChoices.choices:
                if value == obj.tipo_programacao:
                    return label
        return obj.tipo_programacao

    get_tipo_programacao_display.short_description = "Tipo de Programação"
