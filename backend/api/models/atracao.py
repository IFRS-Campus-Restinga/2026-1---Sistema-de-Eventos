from django.conf import settings
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import models

from ..enumerations.area_conhecimento_escolha import AreaConhecimentoEscolha
from ..enumerations.nivel_ensino import NivelEnsino
from ..enumerations.status_atracao import StatusAtracao
from .base import Base
from .evento import Evento
from .espaco import Espaco
from .modalidade import Modalidade
from django.utils.text import slugify


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
    espaco = models.ForeignKey(
        Espaco,
        on_delete=models.SET_NULL,
        related_name="atracoes",
        verbose_name="Espaço",
        null=True,
        blank=True,
    )
    local_atracao = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name="Local",
        help_text="Descrição legada do local da atração",
    )

    slug = models.SlugField(
        max_length=100,
        unique=True,
        default="",
        null=True,
    )

    def clean(self):
        from django.core.exceptions import ValidationError

        errors = {}

        if self.espaco_id and self.evento_id:
            espaco_local_id = getattr(self.espaco, "local_id", None)
            evento_local_id = getattr(self.evento, "local_id", None)

            if (
                espaco_local_id
                and evento_local_id
                and espaco_local_id != evento_local_id
            ):
                errors["espaco"] = (
                    "O espaço selecionado precisa pertencer ao mesmo local do evento."
                )

        if errors:
            raise ValidationError(errors)

    class Meta(Base.Meta):
        verbose_name = "Atração / Submissão"
        verbose_name_plural = "Atrações / Submissões"
        ordering = ["-id"]
        permissions = [("avaliar_atracao", "Pode avaliar esta atração")]

    def save(self, *args, **kwargs):
        if self.slug is None or self.slug == "":
            self.slug = slugify(self.nome)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titulo} — {self.evento}"
