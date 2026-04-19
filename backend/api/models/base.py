from django.db import models


class Base(models.Model):
    ativo = models.BooleanField(default=True)
    #criado_em = models.DateTimeField(auto_now_add=True)
    #atualizado_em = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
        app_label = 'api'