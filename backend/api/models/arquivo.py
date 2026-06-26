from django.contrib import admin
from django.db import models

from .evento import Evento


class Arquivo(models.Model):
    nome_arquivo = models.CharField(max_length=255)
    arquivo = models.FileField(upload_to="arquivos/")
    evento = models.ForeignKey(
        Evento, on_delete=models.CASCADE, related_name="arquivos", null=True, blank=True
    )

    class Meta:
        permissions = [
            ("ver_arquivo", "Pode visualizar os arquivos"),
            ("criar_arquivo", "Pode criar arquivos"),
            ("excluir_arquivo", "Pode excluir arquivos"),
        ]

    def __str__(self):
        return self.nome_arquivo


class ArquivoAdmin(admin.ModelAdmin):
    list_display = ("id", "nome_arquivo", "arquivo")
    search_fields = ("nome_arquivo",)
    readonly_fields = ("arquivo",)
