from rest_framework import serializers

from ..models.item_avaliacao_atracao import ItemAvaliaçãoAtracao


class ItemAvaliaçãoAtracaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemAvaliaçãoAtracao
        fields = ["id", "nota", "criterio_avaliacao", "avaliacao_atracao"]

    def create(self, validated_data):
        instance = ItemAvaliaçãoAtracao(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance
