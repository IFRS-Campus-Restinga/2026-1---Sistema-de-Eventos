from django.db import models
from django.core.validators import MaxLengthValidator,MaxValueValidator,MinValueValidator
from ..enumerations.status_evento import StatusEvento
from..enumerations.setor import Setor
from .base import Base


class Evento(Base):
    nome = models.CharField(max_length=100,
                            help_text="informe o nome do evento", 
                            validators=[MaxLengthValidator(100)])
    descricao = models.TextField(max_length=500,
                                 verbose_name="descrição", 
                                 help_text="Forneça uma descrição detalhada do evento",
                                 validators=[MaxLengthValidator(500)])
    status_evento = models.CharField(choices=StatusEvento.choices,
                                     verbose_name="status do evento",
                                     help_text="informe o status do evento",
                                     max_length=20)
    carga_horaria = models.PositiveIntegerField(verbose_name="carga horária",
                                        help_text="informe a carga horária do evento",
                                        validators=[MinValueValidator(1),MaxValueValidator(200)]
                                        )
    setor = models.CharField(choices=Setor.choices,
                             help_text="infome o setor destinado ao evento",
                             max_length=(10),
                             validators=[MaxLengthValidator(10)]
                             )
    tema = models.CharField(help_text="informe o tema do evento",
                            max_length=100,
                            validators=[MaxLengthValidator(100)])
    
    # futuramente, fazer relacionamento com local 

    def __str__(self):
        return f'{self.nome}'