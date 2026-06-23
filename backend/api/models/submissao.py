from django.conf import settings
from django.core.validators import (
    MaxLengthValidator,
    MinLengthValidator,
    MinValueValidator,
)
from django.db import models
from django.utils.text import slugify

from ..enumerations.area_conhecimento_escolha import AreaConhecimentoEscolha
from ..enumerations.nivel_ensino import NivelEnsino
from ..enumerations.status_submissao import StatusSubmissao
from .base import Base
from .evento import Evento
from .modalidade import Modalidade


class Submissao(Base):
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
        related_name="submissoes",
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
        related_name="submissoes_orientadas",
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
        related_name="submissoes",
        verbose_name="Evento",
    )
    sugestao_vagas = models.IntegerField(
        verbose_name="Sugestão para Número de Vagas",
        help_text="Sugestão opcional de vagas para esta submissão",
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
    )
    vagas_disponiveis = models.IntegerField(
        verbose_name="Vagas Disponíveis",
        help_text="Quantidade de vagas disponíveis para esta submissão",
        null=True,
        blank=True,
        default=0,
    )

    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
    )
    status_submissao = models.CharField(
        choices=StatusSubmissao.choices,
        max_length=30,
        default=StatusSubmissao.SUBMETIDA,
        verbose_name="Status da Submissão",
    )

    class Meta(Base.Meta):
        verbose_name = "Submissão"
        verbose_name_plural = "Submissões"
        ordering = ["-id"]
        permissions = [
            ("avaliar_submissao", "Pode realizar a avaliação de uma submissão"),
        ]

    def __str__(self):
        return f"Submissão #{self.id} - {self.titulo}"

    def clean(self):
        from django.core.exceptions import ValidationError

        errors = {}

        if errors:
            raise ValidationError(errors)

    def _gerar_slug_unico(self):
        base_slug = slugify(self.titulo or "")[:100]
        if not base_slug:
            base_slug = "submissao"

        slug = base_slug
        contador = 1

        while Submissao.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            sufixo = f"-{contador}"
            slug = f"{base_slug[: 100 - len(sufixo)]}{sufixo}"
            contador += 1

        return slug

    def save(self, *args, **kwargs):
        if self.slug is None or self.slug == "":
            self.slug = self._gerar_slug_unico()

        if not self.pk:
            self.vagas_disponiveis = self.sugestao_vagas

        super().save(*args, **kwargs)
