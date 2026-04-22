from rest_framework import serializers

from ..models.avaliacao_submissao import AvaliacaoSubmissao, NotaCriterio


class NotaCriterioSerializer(serializers.ModelSerializer):
    criterio_nome = serializers.ReadOnlyField(source="criterio.nome")

    class Meta:
        model = NotaCriterio
        fields = ["id", "criterio", "criterio_nome", "nota"]


class AvaliacaoSubmissaoSerializer(serializers.ModelSerializer):
    notas = NotaCriterioSerializer(many=True, required=False)
    avaliador_nome = serializers.ReadOnlyField(source="avaliador.get_full_name")

    class Meta:
        model = AvaliacaoSubmissao
        fields = [
            "id",
            "atracao",
            "avaliador",
            "avaliador_nome",
            "parecer",
            "status",
            "notas",
        ]

    def create(self, validated_data):
        notas_data = validated_data.pop("notas", [])
        avaliacao = AvaliacaoSubmissao.objects.create(**validated_data)
        for nota_data in notas_data:
            NotaCriterio.objects.create(avaliacao=avaliacao, **nota_data)
        return avaliacao

    def update(self, instance, validated_data):
        notas_data = validated_data.pop("notas", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if notas_data is not None:
            instance.notas.all().delete()
            for nota_data in notas_data:
                NotaCriterio.objects.create(avaliacao=instance, **nota_data)

        return instance
