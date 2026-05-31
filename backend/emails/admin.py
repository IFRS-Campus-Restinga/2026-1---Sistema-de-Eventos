from django.contrib import admin

from .models.template_sistema import TemplateSistema
from .models.template_perfil import TemplatePerfil

admin.site.register(TemplateSistema)
admin.site.register(TemplatePerfil)
