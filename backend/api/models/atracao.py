from django.db import models
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.conf import settings
from ..enumerations.status_atracao import StatusAtracao
from ..enumerations.area_conhecimento_escolha import AreaConhecimentoEscolha
from ..enumerations.nivel_ensino import NivelEnsino
from .base import Base
from .evento import Evento
from .modalidade import Modalidade


class Atracao(Base):
    titulo = models.CharField(
        max_length=250,
        verbose_name="Título do Trabalho",
        help_text="Informe o título do trabalho submetido",
        validators=[MinLengthValidator(3), MaxLengthValidator(250)],
    )
    resumo = models.TextField(
        max_length=5000,
        verbose_name="Resumo",
        help_text="Forneça um resumo detalhado (250 a 500 palavras)",
        validators=[MaxLengthValidator(5000)],
        null=True,
        blank=True,
    )
    palavras_chave = models.CharField(
        max_length=250,
        verbose_name="Palavras-chave",
        help_text="Separe as palavras-chave por vírgula",
        validators=[MaxLengthValidator(250)],
        null=True,
        blank=True,
    )
    modalidade = models.ForeignKey(
        Modalidade,
        on_delete=models.PROTECT,
        related_name="atracoes",
        verbose_name="Modalidade",
        null=True,
        blank=True,
    )
    nivel_ensino = models.CharField(
        choices=NivelEnsino.choices,
        max_length=50,
        verbose_name="Nível de Ensino",
        null=True,
        blank=True,
    )
    area_conhecimento = models.CharField(
        choices=AreaConhecimentoEscolha.choices,
        max_length=50,
        verbose_name="Área de Conhecimento",
        null=True,
        blank=True,
    )
    orientador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="orientacoes",
        verbose_name="Orientador(a)",
        null=True,
        blank=True,
    )
    sou_orientador = models.BooleanField(default=False, verbose_name="Sou o Orientador")
    anexo_pdf = models.FileField(
        upload_to="submissoes/pdfs/",
        verbose_name="Anexo I (PDF)",
        null=True,
        blank=True,
    )
    acessibilidade = models.BooleanField(
        default=False, verbose_name="Possui recursos de acessibilidade?"
    )
    evento = models.ForeignKey(
        Evento,
        on_delete=models.PROTECT,
        related_name="atracoes",
        verbose_name="Evento",
    )
    status = models.CharField(
        choices=StatusAtracao.choices,
        max_length=20,
        verbose_name="Status",
        default=StatusAtracao.PREVISTA,
    )

    data_hora_inicio = models.DateTimeField(null=True, blank=True)
    data_hora_fim = models.DateTimeField(null=True, blank=True)
    local_atracao = models.CharField(
        max_length=200, null=True, blank=True
    )  # vira relação com local/espaço

    class Meta(Base.Meta):
        verbose_name = "Atração / Submissão"
        verbose_name_plural = "Atrações / Submissões"
        ordering = ["-id"]

    def __str__(self):
        return f"{self.titulo} — {self.evento}"
