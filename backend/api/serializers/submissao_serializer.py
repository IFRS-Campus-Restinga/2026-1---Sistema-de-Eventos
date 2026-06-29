from django.utils import timezone
from rest_framework import serializers

from ..enumerations.nivel_ensino import NivelEnsino
from ..enumerations.status_aprovacao import StatusAprovacao
from ..enumerations.tipo_etapa import TipoEtapa
from ..models.etapa_evento import EtapaEvento
from ..models.submissao import Submissao
from .autoria_serializer import AutoriaSerializer
from .coautor_serializer import CoautorSerializer


class SubmissaoSerializer(serializers.ModelSerializer):
    equipe = CoautorSerializer(many=True, required=False, read_only=True)
    autorias = AutoriaSerializer(many=True, required=False, read_only=True)
    autor_nome = serializers.SerializerMethodField()
    orientador_nome = serializers.SerializerMethodField()
    equipe_nomes = serializers.SerializerMethodField()
    tipo = serializers.ReadOnlyField(source="modalidade.nome")
    nivel_ensino_display = serializers.SerializerMethodField()
    respostas_campos = serializers.SerializerMethodField(read_only=True)
    pode_editar_com_ressalvas = serializers.SerializerMethodField()

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
            "vagas_disponiveis",
            "equipe",
            "autorias",
            "equipe_nomes",
            "respostas_campos",
            "slug",
            "status_submissao",
            "pode_editar_com_ressalvas",
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

    def validate(self, attrs):
        modalidade = attrs.get("modalidade", getattr(self.instance, "modalidade", None))
        sugestao_vagas = attrs.get(
            "sugestao_vagas",
            getattr(self.instance, "sugestao_vagas", None),
        )

        if modalidade and not getattr(modalidade, "requer_controle_vagas", False):
            if "sugestao_vagas" in attrs and sugestao_vagas not in (None, ""):
                raise serializers.ValidationError(
                    {"sugestao_vagas": "Esta modalidade não permite sugestão de vagas."}
                )
            attrs["sugestao_vagas"] = None
            return attrs

        limite_modalidade = None
        if modalidade:
            limite_modalidade = getattr(
                modalidade,
                "limite_maximo_vagas",
                getattr(modalidade, "limite_vagas", None),
            )

        if (
            sugestao_vagas is not None
            and limite_modalidade is not None
            and limite_modalidade > 0
            and sugestao_vagas > limite_modalidade
        ):
            raise serializers.ValidationError(
                {
                    "sugestao_vagas": (
                        f"A sugestão de vagas não pode ultrapassar o limite da modalidade "
                        f"({limite_modalidade})."
                    )
                }
            )

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["submissao_id"] = instance.id
        data["status_submissao"] = instance.status_submissao
        data["status"] = instance.status_submissao
        data["pode_editar_com_ressalvas"] = self.get_pode_editar_com_ressalvas(instance)

        return data

    def get_pode_editar_com_ressalvas(self, obj):
        if not getattr(obj, "evento", None):
            return False

        if not obj.avaliacoes.filter(
            status_aprovacao=StatusAprovacao.APROVADO_COM_RESSALVAS,
        ).exists():
            return False

        now = timezone.now()
        return EtapaEvento.objects.filter(
            evento=obj.evento,
            tipo_etapa=TipoEtapa.AVALIACAO_PREVIA,
            data_inicio__lte=now,
            data_fim__gte=now,
        ).exists()
