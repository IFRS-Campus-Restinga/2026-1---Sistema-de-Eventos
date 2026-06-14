from decimal import Decimal

from rest_framework import serializers

from ..models.avaliacao_submissao import AvaliacaoSubmissao


class AvaliacaoSubmissaoSerializer(serializers.ModelSerializer):
    nota_final = serializers.SerializerMethodField()
    avaliador = serializers.PrimaryKeyRelatedField(read_only=True)
    parecer = serializers.CharField(required=True, allow_blank=False)

    def get_nota_final(self, obj) -> Decimal | None:
        return obj.nota_final

    class Meta:
        model = AvaliacaoSubmissao
        fields = [
            "id",
            "nota_final",
            "data_avaliacao",
            "status_aprovacao",
            "parecer",
            "submissao",
            "avaliador",
        ]

    def create(self, validated_data):
        request = self.context.get("request") if hasattr(self, "context") else None
        if request and request.user and request.user.is_authenticated:
            validated_data["avaliador"] = request.user

        instance = AvaliacaoSubmissao(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance
