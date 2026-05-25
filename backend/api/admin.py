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
)
from .models.area_conhecimento import AreaConhecimentoAdmin
from .models.arquivo import ArquivoAdmin
from .models.evento import EventoAdmin
from .models.local import LocalAdmin

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

# registros com ModelAdmin customizado
admin.site.register(Arquivo, ArquivoAdmin)
admin.site.register(AreaConhecimento, AreaConhecimentoAdmin)
admin.site.register(Evento, EventoAdmin)
admin.site.register(Local, LocalAdmin)
