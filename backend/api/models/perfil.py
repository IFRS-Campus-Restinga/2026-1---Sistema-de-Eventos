from django.conf import settings
from django.db import models

from api.enumerations import AreaConhecimento, NivelEnsino

from .base import Base


class Perfil(Base):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="perfil"
    )

    nivel_ensino = models.CharField(
        max_length=50, choices=NivelEnsino.choices, blank=True, null=True
    )

    area_conhecimento = models.CharField(
        max_length=50, choices=AreaConhecimento.choices, blank=True, null=True
    )

    class Meta:
        verbose_name = "perfil"
        verbose_name_plural = "perfis"

    def __str__(self):
        return f"Perfil de: {self.usuario.nome}"
