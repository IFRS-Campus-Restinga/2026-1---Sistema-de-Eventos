from rest_framework import serializers

from ..models.ordem_apresentacao_atracao import OrdemApresentacaoAtracao


class AtracaoProgramacaoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    titulo = serializers.SerializerMethodField()
    resumo = serializers.SerializerMethodField()
    palavras_chave = serializers.SerializerMethodField()
    nivel_ensino = serializers.SerializerMethodField()
    nivel_ensino_display = serializers.SerializerMethodField()
    tipo = serializers.SerializerMethodField()
    area_conhecimento = serializers.SerializerMethodField()
    autor = serializers.SerializerMethodField()
    sugestao_vagas = serializers.SerializerMethodField()

    @staticmethod
    def _submissao(obj):
        return getattr(obj, "submissao", None)

    def get_titulo(self, obj):
        submissao = self._submissao(obj)
        return getattr(submissao, "titulo", "Atração sem submissão")

    def get_resumo(self, obj):
        submissao = self._submissao(obj)
        return getattr(submissao, "resumo", "")

    def get_palavras_chave(self, obj):
        submissao = self._submissao(obj)
        return getattr(submissao, "palavras_chave", "")

    def get_nivel_ensino(self, obj):
        submissao = self._submissao(obj)
        return getattr(submissao, "nivel_ensino", "")

    def get_nivel_ensino_display(self, obj):
        submissao = self._submissao(obj)
        return getattr(submissao, "nivel_ensino", "")

    def get_tipo(self, obj):
        submissao = self._submissao(obj)
        modalidade = getattr(submissao, "modalidade", None)
        return getattr(modalidade, "nome", "")

    def get_area_conhecimento(self, obj):
        submissao = self._submissao(obj)
        return getattr(submissao, "area_conhecimento", "")

    def get_sugestao_vagas(self, obj):
        submissao = self._submissao(obj)
        return getattr(submissao, "sugestao_vagas", None)

    def get_autor(self, obj):
        submissao = self._submissao(obj)
        autorias = getattr(submissao, "autorias", None)
        if autorias is None:
            return ""

        autoria_autor = (
            autorias.select_related("usuario")
            .filter(tipo="AUTOR")
            .order_by("ordem", "id")
            .first()
        )
        if autoria_autor and getattr(autoria_autor, "usuario", None):
            usuario = autoria_autor.usuario
            return getattr(usuario, "nome", None) or getattr(usuario, "username", "")

        return ""


class OrdemApresentacaoAtracaoSerializer(serializers.ModelSerializer):
    atracao_display = AtracaoProgramacaoSerializer(source="atracao", read_only=True)

    class Meta:
        model = OrdemApresentacaoAtracao
        fields = ["id", "sessao", "atracao", "atracao_display", "ordem"]
