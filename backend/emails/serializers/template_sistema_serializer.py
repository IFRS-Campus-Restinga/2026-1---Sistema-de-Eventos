from rest_framework import serializers
from emails.models import TemplateSistema


class TemplateSistemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateSistema
        fields = ["id", "nome_exibicao", "assunto", "corpo_texto", "identificador"]
