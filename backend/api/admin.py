from django.contrib import admin

from .models import (
    AreaConhecimento,
    Arquivo,
    Cronograma,
    Evento,
    Local,
    CampoFormulario,
    CriterioAvaliacao,
    Espaco,
    Modalidade,
    Resposta,
    Sessao,
)

from .models.arquivo import ArquivoAdmin
from .models.cronograma import CronogramaAdmin
from .models.evento import EventoAdmin
from .models.area_conhecimento import AreaConhecimentoAdmin
from .models.local import LocalAdmin

# simples: registros sem ModelAdmin customizado
admin.site.register(Modalidade)
admin.site.register(CampoFormulario)
admin.site.register(CriterioAvaliacao)
admin.site.register(Resposta)
admin.site.register(Espaco)
admin.site.register(Sessao)

# registros com ModelAdmin customizado
admin.site.register(Arquivo, ArquivoAdmin)
admin.site.register(AreaConhecimento, AreaConhecimentoAdmin)
admin.site.register(Cronograma, CronogramaAdmin)
admin.site.register(Evento, EventoAdmin)
admin.site.register(Local, LocalAdmin)
