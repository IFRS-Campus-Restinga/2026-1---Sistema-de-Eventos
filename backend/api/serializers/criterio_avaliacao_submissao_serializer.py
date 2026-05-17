from rest_framework import serializers

from ..models.criterio_avaliacao_submissao import CriterioAvaliacaoSubmissao


class CriterioAvaliacaoSubmissaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriterioAvaliacaoSubmissao
        fields = ["id", "nome", "descricao", "modalidade"]

    def validate_modalidade(self, value):
        # aceitar vínculo de critério quando a modalidade requer avaliação de submissão
        if not value.requer_avaliacao_submissao:
            raise serializers.ValidationError(
                "Não é possível vincular um critério a uma modalidade que não requer avaliação de submissão."
            )
        return value

    def create(self, validated_data):
        instance = CriterioAvaliacaoSubmissao(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance
