from django.db import models
from .base import BaseModel
from api.models.perfil import Perfil


class TemplatePerfil(BaseModel):
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE, related_name="templates_email"
    )

    def __str__(self):
        return f"{self.nome_exibicao}"
