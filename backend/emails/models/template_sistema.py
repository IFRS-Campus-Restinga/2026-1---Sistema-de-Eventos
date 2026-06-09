from django.db import models
from .base import BaseModel


class TemplateSistema(BaseModel):
    # Identificar interno para o backend encontrar
    identificador = models.SlugField(
        max_length=50, unique=True, editable=False
    )  # Exemplo: "welcome_email

    def __str__(self):
        return f"{self.nome_exibicao}  —  slug:{self.identificador}"
