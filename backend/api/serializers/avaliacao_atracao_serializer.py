from rest_framework import serializers

from ..models.avaliacao_atracao import AvaliacaoAtracao


class AvaliacaoAtracaoSerializer(serializers.ModelSerializer):
    nota_final = serializers.SerializerMethodField()
    avaliador = serializers.PrimaryKeyRelatedField(read_only=True)

    def get_nota_final(self, obj):
        return obj.nota_final

    class Meta:
        model = AvaliacaoAtracao
        fields = [
            "id",
            "nota_final",
            "data_avaliacao",
            "destaque_do_dia",
            "compareceu",
            "parecer",
            "atracao",
            "avaliador",
        ]

    def create(self, validated_data):
        request = self.context.get("request") if hasattr(self, "context") else None
        if request and request.user and request.user.is_authenticated:
            validated_data["avaliador"] = request.user

        instance = AvaliacaoAtracao(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance
