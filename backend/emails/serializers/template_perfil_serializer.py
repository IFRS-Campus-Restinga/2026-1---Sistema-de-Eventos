from rest_framework import serializers
from emails.models import TemplatePerfil


class TemplatePerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplatePerfil
        fields = ["id", "nome_exibicao", "assunto", "corpo_texto"]
