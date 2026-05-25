from django.db import models


class TemplateSistema(models.Model):
    nome_exibicao = models.CharField(max_length=100)  # Nome de exibição na interface
    assunto = models.CharField(max_length=200)  # Assunto do Email
    corpo_texto = models.TextField()  # Texto do Email

    # Identificar interno para o backend ecnontrar
    identificador = models.SlugField(
        max_length=50, unique=True, editable=False
    )  # Exemplo: "welcome_email
