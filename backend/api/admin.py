from django.contrib import admin

from .models import (
    AreaConhecimento,
    Arquivo,
    Atracao,
    AvaliacaoAtracao,
    AvaliacaoSubmissao,
    CampoFormulario,
    CriterioAvaliacaoAtracao,
    CriterioAvaliacaoSubmissao,
    Espaco,
    EtapaEvento,
    Evento,
    InscricaoEvento,
    Local,
    Modalidade,
    OrdemApresentacaoAtracao,
    Perfil,
    Resposta,
    Sessao,
    InscricaoAtracao,
)
from .models.area_conhecimento import AreaConhecimentoAdmin
from .models.arquivo import ArquivoAdmin
from .models.autoria import Autoria
from .models.coautor import Coautor
from .models.evento import EventoAdmin
from .models.local import LocalAdmin


@admin.register(Autoria)
class AutoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "submissao", "tipo", "ordem")
    search_fields = (
        "usuario__username",
        "usuario__first_name",
        "usuario__last_name",
        "submissao__titulo",
    )
    list_filter = ("tipo",)


@admin.register(Coautor)
class CoautorAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "atracao", "funcao")
    search_fields = ("nome", "atracao__titulo")
    list_filter = ("funcao",)

# simples: registros sem ModelAdmin customizado
admin.site.register(Modalidade)
admin.site.register(CampoFormulario)
admin.site.register(CriterioAvaliacaoAtracao)
admin.site.register(CriterioAvaliacaoSubmissao)
admin.site.register(Resposta)
admin.site.register(Espaco)
admin.site.register(Sessao)
admin.site.register(Perfil)
admin.site.register(Atracao)
admin.site.register(InscricaoEvento)
admin.site.register(EtapaEvento)
admin.site.register(AvaliacaoSubmissao)
admin.site.register(AvaliacaoAtracao)
admin.site.register(OrdemApresentacaoAtracao)
admin.site.register(InscricaoAtracao)

# registros com ModelAdmin customizado
admin.site.register(Arquivo, ArquivoAdmin)
admin.site.register(AreaConhecimento, AreaConhecimentoAdmin)
admin.site.register(Evento, EventoAdmin)
admin.site.register(Local, LocalAdmin)
