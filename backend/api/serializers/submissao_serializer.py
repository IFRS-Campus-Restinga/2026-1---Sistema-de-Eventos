from rest_framework import serializers

from ..enumerations.nivel_ensino import NivelEnsino
from ..models.submissao import Submissao
from .autoria_serializer import AutoriaSerializer
from .coautor_serializer import CoautorSerializer
from .espaco_serializer import EspacoSerializer


class SubmissaoSerializer(serializers.ModelSerializer):
    equipe = CoautorSerializer(many=True, required=False, read_only=True)
    autorias = AutoriaSerializer(many=True, required=False, read_only=True)
    autor_nome = serializers.SerializerMethodField()
    orientador_nome = serializers.SerializerMethodField()
    equipe_nomes = serializers.SerializerMethodField()
    tipo = serializers.ReadOnlyField(source="modalidade.nome")
    espaco_detalhe = EspacoSerializer(source="espaco", read_only=True)
    nivel_ensino_display = serializers.SerializerMethodField()
    respostas_campos = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Submissao
        fields = [
            "id",
            "titulo",
            "resumo",
            "palavras_chave",
            "modalidade",
            "tipo",
            "nivel_ensino",
            "nivel_ensino_display",
            "area_conhecimento",
            "autor_nome",
            "orientador",
            "sou_orientador",
            "orientador_nome",
            "anexo_pdf",
            "acessibilidade",
            "evento",
            "sugestao_vagas",
            "equipe",
            "autorias",
            "equipe_nomes",
            "data_hora_inicio",
            "data_hora_fim",
            "espaco",
            "espaco_detalhe",
            "local_atracao",
            "respostas_campos",
            "slug",
            "status_submissao",
        ]

    def _resolver_nome_usuario(self, usuario):
        if not usuario:
            return ""

        candidatos = [
            getattr(usuario, "nome", None),
            getattr(usuario, "get_full_name", lambda: "")(),
            f"{getattr(usuario, 'first_name', '')} {getattr(usuario, 'last_name', '')}".strip(),
            getattr(usuario, "username", None),
            str(getattr(usuario, "id", "")),
        ]
        for candidato in candidatos:
            if candidato:
                return str(candidato).strip()
        return ""

    def get_autor_nome(self, obj):
        autoria_autor = (
            obj.autorias.select_related("usuario")
            .filter(tipo="AUTOR")
            .order_by("ordem", "id")
            .first()
        )
        if autoria_autor:
            return self._resolver_nome_usuario(autoria_autor.usuario)
        return ""

    def get_orientador_nome(self, obj):
        if getattr(obj, "orientador", None):
            nome_orientador = self._resolver_nome_usuario(obj.orientador)
            if nome_orientador:
                return nome_orientador

        autoria_orientador = (
            obj.autorias.select_related("usuario")
            .filter(tipo="ORIENTADOR")
            .order_by("ordem", "id")
            .first()
        )
        if autoria_orientador:
            return self._resolver_nome_usuario(autoria_orientador.usuario)
        return ""

    def get_equipe_nomes(self, obj):
        membros = obj.equipe.all().order_by("id")
        return [membro.nome for membro in membros if getattr(membro, "nome", "")]

    def get_nivel_ensino_display(self, obj):
        valor = getattr(obj, "nivel_ensino", None)
        if not valor:
            return ""

        mapa = {choice[0]: str(choice[1]) for choice in NivelEnsino.choices}
        itens = [item.strip() for item in str(valor).split(",") if item.strip()]
        if not itens:
            return ""

        labels = [mapa.get(item, item) for item in itens]
        return ", ".join(labels)

    def get_respostas_campos(self, obj):
        respostas = obj.respostas.select_related("campo_formulario").all()
        retorno = {}
        for resposta in respostas:
            chave = f"campo_{resposta.campo_formulario_id}"
            tipo = getattr(resposta.campo_formulario, "tipo_dado", None)

            if tipo == "BOOLEANO":
                retorno[chave] = str(resposta.valor).strip().lower() in (
                    "true",
                    "1",
                    "sim",
                )
                continue

            if tipo == "NUMERO":
                valor_texto = str(resposta.valor).strip()
                if valor_texto == "":
                    retorno[chave] = ""
                else:
                    try:
                        retorno[chave] = int(valor_texto)
                    except ValueError:
                        try:
                            retorno[chave] = float(valor_texto)
                        except ValueError:
                            retorno[chave] = resposta.valor
                continue

            retorno[chave] = resposta.valor

        return retorno

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["submissao_id"] = instance.id
        data["status_submissao"] = instance.status_submissao
        data["status"] = instance.status_submissao

        return data
