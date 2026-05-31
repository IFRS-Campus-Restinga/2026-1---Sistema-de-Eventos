from django.db import models


class BaseModel(models.Model):
    nome_exibicao = models.CharField(max_length=100)
    assunto = models.CharField(max_length=200)
    corpo_texto = models.TextField()

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nome_exibicao}  —  slug:{self.identificador}"

    class Meta:
        abstract = True
