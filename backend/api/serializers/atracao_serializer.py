import json
import logging
from rest_framework import serializers
from django.core.exceptions import ValidationError
from ..models.atracao import Atracao
from ..models.coautor import Coautor
from .coautor_serializer import CoautorSerializer

logger = logging.getLogger(__name__)


class AtracaoSerializer(serializers.ModelSerializer):
    equipe = CoautorSerializer(many=True, required=False, read_only=True)
    orientador_nome = serializers.ReadOnlyField(source='orientador.get_full_name')
    tipo = serializers.ReadOnlyField(source='modalidade.nome')
    equipe_json = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Atracao
        fields = [
            'id', 'titulo', 'resumo', 'palavras_chave', 'modalidade', 'tipo',
            'nivel_ensino', 'area_conhecimento', 'orientador', 
            'orientador_nome', 'sou_orientador', 'anexo_pdf', 
            'acessibilidade', 'evento', 'status', 'equipe', 'equipe_json',
            'data_hora_inicio', 'data_hora_fim', 'local_atracao'
        ]

    def validate(self, data):
        """
        Executa a validação completa do modelo, incluindo o método clean().
        """
        # Removemos campos que não existem no modelo (campos exclusivos do Serializer)
        model_data = data.copy()
        model_data.pop('equipe_json', None)
        
        # Criamos uma instância temporária para rodar o full_clean
        instance = Atracao(**model_data)
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data

    def validate_equipe_json(self, value):
        if not value:
            return []
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, ValueError):
            return []

    def create(self, validated_data):
        logger.info(f"Creating Atracao with validated_data: {validated_data}")
        equipe_data = validated_data.pop('equipe_json', [])
        
        if not isinstance(equipe_data, list):
            equipe_data = []
            
        atracao = Atracao.objects.create(**validated_data)
        for membro in equipe_data:
            if membro.get('nome'):
                Coautor.objects.create(atracao=atracao, **membro)
        return atracao

    def update(self, instance, validated_data):
        equipe_data = validated_data.pop('equipe_json', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if equipe_data and isinstance(equipe_data, list):
            instance.equipe.all().delete()
            for membro in equipe_data:
                if membro.get('nome'):
                    Coautor.objects.create(atracao=instance, **membro)
        
        return instance
