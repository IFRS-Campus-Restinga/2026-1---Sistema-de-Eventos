from django.db import models
from django.contrib import admin


class Arquivo(models.Model):
    nome_arquivo = models.CharField(max_length=255)
    arquivo = models.FileField(upload_to="arquivos/")

    def __str__(self):
        return self.nome_arquivo


class ArquivoAdmin(admin.ModelAdmin):
    list_display = ("id", "nome_arquivo", "arquivo")
    search_fields = ("nome_arquivo",)
    readonly_fields = ("arquivo",)
