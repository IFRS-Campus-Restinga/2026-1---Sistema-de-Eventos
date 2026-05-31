from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from ..models.modalidade import Modalidade
from .campo_formulario_serializer import CampoFormularioSerializer
from .criterio_avaliacao_atracao_serializer import CriterioAvaliacaoAtracaoSerializer
from .criterio_avaliacao_submissao_serializer import (
    CriterioAvaliacaoSubmissaoSerializer,
)


class ModalidadeSerializer(serializers.ModelSerializer):
    campos = CampoFormularioSerializer(
        many=True,
        source="campoformulario_set",
        read_only=True,
        required=False,
    )
    evento = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
        source="evento_set",
    )
    criterios = CriterioAvaliacaoAtracaoSerializer(
        many=True,
        source="criterioavaliacaoatracao_set",
        read_only=True,
        required=False,
    )
    criterios_submissao = CriterioAvaliacaoSubmissaoSerializer(
        many=True,
        source="criterioavaliacaosubmissao_set",
        read_only=True,
        required=False,
    )

    limite_vagas = serializers.IntegerField(
        required=False, allow_null=True, min_value=0
    )

    def create(self, validated_data):
        instance = Modalidade(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def validate(self, attrs):
        # avaliação de submissão só é possível se submissão for permitida
        permite_submissao = attrs.get(
            "permite_submissao",
            getattr(self.instance, "permite_submissao", False),
        )
        requer_avaliacao_submissao = attrs.get(
            "requer_avaliacao_submissao",
            getattr(self.instance, "requer_avaliacao_submissao", False),
        )

        if requer_avaliacao_submissao and not permite_submissao:
            raise serializers.ValidationError(
                {
                    "requer_avaliacao_submissao": _(
                        "Não é possível requerer avaliação de submissão se a modalidade não permite submissão."
                    )
                }
            )

        # Se submissão não é permitida, forçar avaliação de submissão para False
        if not permite_submissao and "requer_avaliacao_submissao" not in attrs:
            attrs["requer_avaliacao_submissao"] = False

        # determina se controle de vagas está ativo considerando dados do payload
        requer_controle = attrs.get(
            "requer_controle_vagas",
            getattr(self.instance, "requer_controle_vagas", False),
        )

        if not requer_controle:
            # se tentou informar limite_vagas explicitamente quando controle desativado -> erro
            if "limite_vagas" in attrs and attrs.get("limite_vagas") is not None:
                raise serializers.ValidationError(
                    {
                        "limite_vagas": _(
                            "Só é possível definir limite de vagas se requer_controle_vagas for True."
                        )
                    }
                )

            # caso de atualização: garantimos que o valor existente seja removido
            if self.instance and getattr(self.instance, "limite_vagas", None):
                attrs["limite_vagas"] = None

        return attrs

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance

    class Meta:
        model = Modalidade
        fields = [
            "id",
            "evento",
            "campos",
            "nome",
            "requer_avaliacao",
            "requer_controle_vagas",
            "requer_avaliacao_submissao",
            "permite_submissao",
            "limite_avaliadores",
            "emite_certificado",
            "campos",
            "criterios",
            "criterios_submissao",
            "limite_vagas",
        ]
