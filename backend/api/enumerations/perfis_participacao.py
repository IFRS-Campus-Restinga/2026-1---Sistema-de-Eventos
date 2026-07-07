from django.db import models
from django.utils.translation import gettext_lazy as _


class PerfisParticipacao(models.TextChoices):
    AUTOR = "AUTOR", _("Autor")
    APRESENTADOR = "APRESENTADOR", _("Apresentador")
    PALESTRANTE = "PALESTRANTE", _("Palestrante")
    MINISTRANTE = "MINISTRANTE", _("Ministrante")
    ORGANIZADOR = "ORGANIZADOR", _("Organizador")
    COORDENADOR = "COORDENADOR", _("Coordenador")
    PARTICIPANTE = "PARTICIPANTE", _("Participante")
    AUTORIDADE = "AUTORIDADE", _("Autoridade")

