from django.contrib import admin

from .models import (
    CampoFormulario,
    CriterioAvaliacao,
    Espaco,
    Evento,
    Local,
    Modalidade,
    Resposta,
    Sessao,
)

admin.site.register(Evento)
admin.site.register(Local)
admin.site.register(Modalidade)
admin.site.register(CampoFormulario)
admin.site.register(CriterioAvaliacao)
admin.site.register(Resposta)
admin.site.register(Espaco)
admin.site.register(Sessao)

# Register your models here.
