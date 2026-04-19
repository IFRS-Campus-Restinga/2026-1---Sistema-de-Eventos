from django import forms
from django.db import models
from django.contrib import admin

from api.enumerations.area_conhecimento_escolha import (
    AreaConhecimentoEscolha as AreaConhecimentoChoices,
)


class AreaConhecimento(models.Model):
    area_conhecimento = models.CharField(
        max_length=50,
        choices=AreaConhecimentoChoices.choices,
        verbose_name="Área de Conhecimento",
    )
    descricao = models.TextField(
        verbose_name="Descrição",
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.get_area_conhecimento_display()

    class Meta:
        verbose_name = "Área de Conhecimento"
        verbose_name_plural = "Áreas de Conhecimento"


class AreaConhecimentoForm(forms.ModelForm):
    """Formulário customizado para exibir as enumerations de forma clara"""

    area_conhecimento = forms.ChoiceField(
        choices=AreaConhecimentoChoices.choices,
        widget=forms.RadioSelect(),
        help_text="Selecione uma das áreas de conhecimento disponíveis",
        label="Área de Conhecimento",
    )

    class Meta:
        model = AreaConhecimento
        fields = ("area_conhecimento", "descricao")


class AreaConhecimentoAdmin(admin.ModelAdmin):
    form = AreaConhecimentoForm
    list_display = ("id", "get_area_conhecimento_display", "descricao")
    search_fields = ("area_conhecimento",)
    fieldsets = (
        (
            "Área de Conhecimento",
            {
                "fields": ("area_conhecimento",),
                "description": "Selecione uma das seguintes áreas de conhecimento:",
            },
        ),
        (
            "Descrição",
            {
                "fields": ("descricao",),
                "classes": ("collapse",),
            },
        ),
    )

    def get_area_conhecimento_display(self, obj):
        """Exibe o nome legível da enum AreaConhecimentoEscolha"""
        if obj.area_conhecimento:
            for value, label in AreaConhecimentoChoices.choices:
                if value == obj.area_conhecimento:
                    return label
        return obj.area_conhecimento

    get_area_conhecimento_display.short_description = "Área de Conhecimento"
