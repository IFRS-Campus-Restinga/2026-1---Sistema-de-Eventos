from rest_framework import serializers
from django.db import transaction
from ..models.evento import Evento
from ..models.local import Local
from ..models.modalidade import Modalidade
from ..models.etapa_evento import EtapaEvento
from ..models.area_conhecimento import AreaConhecimento
from .local_serializer import LocalSerializer
from .etapa_evento_serializer import EtapaEventoSerializer


class EventoSerializer(serializers.ModelSerializer):
    local = LocalSerializer(read_only=True)
    local_id = serializers.PrimaryKeyRelatedField(
        queryset=Local.objects.all(),
        source="local",
        write_only=True,
    )
    # Garanta que many=True esteja aqui para o M2M
    area_conhecimento = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=AreaConhecimento.objects.all(),
    )
    etapas = EtapaEventoSerializer(many=True, required=False)
    modalidades = serializers.SerializerMethodField()
    modalidade_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Modalidade.objects.all(),
        source="modalidades",
        write_only=True,
        required=False,
    )

    class Meta:
        model = Evento
        fields = [
            "id", "nome", "descricao", "status_evento", "carga_horaria",
            "setor", "tema", "local", "local_id", "etapas", 
            "modalidades", "area_conhecimento", "modalidade_ids",
        ]

    def create(self, validated_data):
        # 1. Extração segura dos dados
        # O DRF coloca os dados de M2M com 'source' na chave do source
        etapas_data = validated_data.pop('etapas', [])
        areas_data = validated_data.pop('area_conhecimento', [])
        print(f"Conteúdo de etapas_data: {areas_data}")
        modalidades_data = validated_data.pop('modalidades', []) # Devido ao source="modalidades"

        # 2. Uso de Transação Atômica
        # Se as etapas falharem, o evento não é criado (evita lixo no banco)
        try:
            with transaction.atomic():
                # Cria o evento base
                evento = Evento.objects.create(**validated_data)

                # 3. Salva relações ManyToMany
                # Importante: usar .set() para listas de objetos/IDs
                if areas_data:
                    evento.area_conhecimento.set(areas_data)
                
                if modalidades_data:
                    evento.modalidades.set(modalidades_data)

                # 4. Criação das Etapas (Relacionamento 1:N)
                for etapa_data in etapas_data:
                    # Removemos o evento_id se o front enviou, pois o vínculo é manual aqui
                    etapa_data.pop('evento', None) 
                    EtapaEvento.objects.create(evento=evento, **etapa_data)

                return evento
        except Exception as e:
            # Isso ajudará você a ver o erro real no terminal se algo falhar no banco
            print(f"Erro ao criar evento e dependências: {str(e)}")
            raise serializers.ValidationError({"detail": f"Erro interno: {str(e)}"})

    def get_modalidades(self, obj):
        return list(obj.modalidades.values_list("id", flat=True))
