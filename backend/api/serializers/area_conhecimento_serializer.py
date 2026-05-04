from rest_framework import serializers
from ..models.area_conhecimento import AreaConhecimento

class AreaConhecimentoSerializer(serializers.ModelSerializer):
    # 'area_conhecimento' retorna a chave (ex: 'EXATAS_TERRA')
    # 'area_conhecimento_display' retorna o label legível (ex: 'Ciências Exatas e da Terra')
    area_conhecimento_display = serializers.CharField(
        source='get_area_conhecimento_display', 
        read_only=True
    )

    class Meta:
        model = AreaConhecimento
        fields = [
            'id', 
            'area_conhecimento', 
            'area_conhecimento_display', 
            'descricao'
        ]