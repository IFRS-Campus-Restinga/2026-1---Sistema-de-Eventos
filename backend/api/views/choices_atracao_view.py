from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from ..enumerations.status_atracao import StatusAtracao
from ..enumerations.area_conhecimento import AreaConhecimento
from ..enumerations.nivel_ensino import NivelEnsino
from ..models.coautor import FuncaoEquipe
from ..models.modalidade import Modalidade


class AtracaoOpcoesView(APIView):
    """Retorna as opções de status, modalidade, nível de ensino e área de conhecimento."""

    permission_classes = [AllowAny]

    def get(self, request):
        modalidades = [
            {"value": modalidade.id, "label": modalidade.nome}
            for modalidade in Modalidade.objects.filter(ativo=True).order_by("nome")
        ]

        niveis = [
            {"value": choice[0], "label": choice[1]}
            for choice in NivelEnsino.choices
        ]

        areas = [
            {"value": choice[0], "label": choice[1]}
            for choice in AreaConhecimento.choices
        ]

        funcoes = [
            {"value": choice[0], "label": choice[1]}
            for choice in FuncaoEquipe.choices
        ]

        status_opcoes = [
            {"value": choice[0], "label": choice[1]}
            for choice in StatusAtracao.choices
        ]

        return Response({
            "modalidades": modalidades,
            "niveis_ensino": niveis,
            "areas_conhecimento": areas,
            "funcoes_equipe": funcoes,
            "status": status_opcoes,
        })
