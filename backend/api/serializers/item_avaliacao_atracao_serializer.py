from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers

from ..models.item_avaliacao_atracao import ItemAvaliaçãoAtracao


class ItemAvaliaçãoAtracaoSerializer(serializers.ModelSerializer):
    nota = serializers.FloatField(required=True, min_value=0, max_value=10)

    class Meta:
        model = ItemAvaliaçãoAtracao
        fields = ["id", "nota", "criterio_avaliacao", "avaliacao_atracao"]

    def _normalize_nota(self, value):
        if value is None:
            return None
        try:
            # Convert via string to avoid binary float artifacts, then quantize to 1 decimal
            d = Decimal(str(value))
            return d.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        except Exception:
            return value

    def create(self, validated_data):
        if "nota" in validated_data:
            validated_data["nota"] = self._normalize_nota(validated_data["nota"])
        instance = ItemAvaliaçãoAtracao(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        if "nota" in validated_data:
            validated_data["nota"] = self._normalize_nota(validated_data["nota"])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance
