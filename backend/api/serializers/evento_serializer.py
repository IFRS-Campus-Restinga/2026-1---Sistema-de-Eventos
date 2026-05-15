from rest_framework import serializers
from django.db import transaction
from ..models.evento import Evento
from ..models.local import Local
from ..models.modalidade import Modalidade
from ..models.etapa_evento import EtapaEvento
from ..models.area_conhecimento import AreaConhecimento
from .local_serializer import LocalSerializer
from .etapa_evento_serializer import EtapaEventoSerializer
from .area_conhecimento_serializer import AreaConhecimentoSerializer
from .modalidade_serializer import ModalidadeSerializer

class EventoSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)
    local = LocalSerializer(read_only=True)
    etapas = EtapaEventoSerializer(many=True, required=False)
    
    # Campo para exibir IDs das modalidades no GET
    modalidades = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Modalidade.objects.all(),
        required=False
    )


    # Campos de Escrita (Recebem IDs do Frontend)
    local_id = serializers.PrimaryKeyRelatedField(
        queryset=Local.objects.all(),
        source="local",
        write_only=True,
    )
    
    # Para o GET: Mostra o objeto completo (id, nome, etc)
    # Para o POST: Como é read_only, ele será ignorado no salvamento automático
    area_conhecimento_detalhes = AreaConhecimentoSerializer(many=True, read_only=True)

    # Adicione este novo campo para o POST/PUT:
    # Ele permite que você envie uma lista de IDs [1, 2] do React
    area_conhecimento = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=AreaConhecimento.objects.all(),
        required=False
    )
    
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
            "id",
            "nome",
            "descricao",
            "status_evento",
            "carga_horaria",
            "link_edital",
            "setor",
            "tema",
            "slug",
            "local",
            "local_id",
            "etapas",
            "modalidades",
            "area_conhecimento",
            "area_conhecimento_detalhes",
            "modalidade_ids",
        ]

    def get_modalidades(self, obj):
        return list(obj.modalidades.values_list("id", flat=True))

    def create(self, validated_data):
        # 1. Extração segura dos dados
        # O DRF coloca os dados de M2M com 'source' na chave do source
        etapas_data = validated_data.pop("etapas", [])
        areas_data = validated_data.pop("area_conhecimento", [])
        print(f"Conteúdo de etapas_data: {areas_data}")
        modalidades_data = validated_data.pop(
            "modalidades", []
        )  # Devido ao source="modalidades"

        try:
            with transaction.atomic():
                # 2. Cria o evento base
                evento = Evento.objects.create(**validated_data)

                # 3. Define as relações ManyToMany (O .set() garante que salve apenas o enviado)
                if areas_data:
                    evento.area_conhecimento.set(areas_data)

                if modalidades_data:
                    evento.modalidades.set(modalidades_data)

                # 4. Criação das Etapas (Relacionamento 1:N)
                for etapa_data in etapas_data:
                    # Removemos o evento_id se o front enviou, pois o vínculo é manual aqui
                    etapa_data.pop("evento", None)
                    EtapaEvento.objects.create(evento=evento, **etapa_data)

                return evento
        except Exception as e:
            print(f"Erro no Create: {str(e)}")
            raise serializers.ValidationError({"detail": f"Erro ao criar evento: {str(e)}"})

    def update(self, instance, validated_data):
        # 1. Extração dos dados (None permite saber se o campo foi enviado ou não)
        etapas_data = validated_data.pop('etapas', None)
        areas_data = validated_data.pop('area_conhecimento', None)
        modalidades_data = validated_data.pop('modalidades', None)

        try:
            with transaction.atomic():
                # 2. Atualiza campos simples (nome, tema, setor, etc.)
                instance = super().update(instance, validated_data)

                # 3. Atualiza Áreas de Conhecimento
                if areas_data is not None:
                    instance.area_conhecimento.set(areas_data)

                # 4. Atualiza Modalidades
                if modalidades_data is not None:
                    instance.modalidades.set(modalidades_data)

                # 5. Atualiza Etapas (Independente das modalidades)
                if etapas_data is not None:
                    # Remove as antigas e recria as novas para sincronizar o estado do formulário
                    instance.etapas.all().delete()
                    for etapa_item in etapas_data:
                        etapa_item.pop('evento', None)
                        EtapaEvento.objects.create(evento=instance, **etapa_item)

                return instance
        except Exception as e:
            print(f"Erro no Update: {str(e)}")
    
            raise serializers.ValidationError({"detail": f"Erro ao atualizar evento: {str(e)}"})
    
    def validate(self, data):
        # 1. Validação de Áreas de Conhecimento
        # Verificamos tanto o campo de escrita quanto o de leitura por segurança
        areas = data.get('area_conhecimento')
        if not areas or len(areas) == 0:
            raise serializers.ValidationError({
                "area_conhecimento": "O evento deve ter pelo menos uma área de conhecimento vinculada."
            })

        # 2. Validação de Modalidades
        modalidades = data.get('modalidades')
        if not modalidades or len(modalidades) == 0:
            raise serializers.ValidationError({
                "modalidades": "Selecione ao menos uma modalidade para o evento."
            })

        # 3. Validação de Etapas (Fases)
        # Como etapas costumam vir aninhadas, verificamos se a lista existe
        etapas = data.get('etapas')
        if not etapas or len(etapas) == 0:
            raise serializers.ValidationError({
                "etapas": "É obrigatório configurar ao menos uma fase (ex: Inscrições) para o evento."
            })

        # 4. Validação Lógica de Datas dentro das Etapas
        for etapa in etapas:
            inicio = etapa.get('data_inicio')
            fim = etapa.get('data_fim')
            if inicio and fim and inicio > fim:
                raise serializers.ValidationError({
                    "etapas": f"Na etapa '{etapa.get('tipo_etapa')}', a data de início não pode ser posterior à data de fim."
                })

        return data