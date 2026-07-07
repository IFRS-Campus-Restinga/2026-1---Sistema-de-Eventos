from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from django.conf import settings

from ..enumerations.tipo_campo import TipoCampo
from ..enumerations.perfis_participacao import PerfisParticipacao

from .base import Base
from .modalidade import Modalidade
from .atracao import Atracao
from .evento import Evento 
from .perfil import Perfil
from .inscricao_atracao import InscricaoAtracao
from .inscricao_evento import InscricaoEvento
from .submissao import Submissao



class Credenciamento(Base):

    perfis_participacao = models.CharField(
        verbose_name=_("Tipo de perfil"),
        choices=PerfisParticipacao,
        max_length=20,
    )

    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    submissao = models.ForeignKey(Submissao, on_delete=models.CASCADE)
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    inscricaoAtracao = models.ForeignKey(InscricaoAtracao, on_delete=models.CASCADE)
    inscricaoEvento = models.ForeignKey(InscricaoEvento, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.perfil}"
