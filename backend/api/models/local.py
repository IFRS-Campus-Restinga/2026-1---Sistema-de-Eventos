from .base import Base
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator


class Local(Base):
    nome = models.CharField(max_length=250,
                            validators=[MinLengthValidator(3)])
    endereco = models.CharField(max_length=150,
                            validators=[MinLengthValidator(10)],
                            verbose_name=_('Endereço'))
    # fazer relação com espaço(no model espaço)


    def clean(self):
        errors = {}

        #nome não pode ser só número
        if self.nome.isdigit():
            errors['nome'] = _('O nome não pode conter apenas números.')

        #endereço deve conter número
        if not any(char.isdigit() for char in self.endereco):
            errors['endereco'] = _('O endereço deve conter um número.')

        #evitar duplicidade
        if Local.objects.filter(
            nome__iexact=self.nome,
            endereco__iexact=self.endereco
            ).exclude(pk=self.pk).exists():
                errors['__all__'] = _('Já existe um local com esse nome e endereço.')

        if errors:
            raise ValidationError(errors)
        
    
    def __str__(self):
        return f'{self.nome}: {self.endereco}'


