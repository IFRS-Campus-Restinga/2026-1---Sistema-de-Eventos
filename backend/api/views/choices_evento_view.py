from rest_framework.views import APIView
from rest_framework.response import Response
from ..enumerations.status_evento import StatusEvento
from ..enumerations.setor import Setor
from ..enumerations.tipo_etapa import TipoEtapa
from ..enumerations.area_conhecimento_escolha import AreaConhecimentoEscolha
from rest_framework.permissions import AllowAny


class OpcoesFormularioView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        data = {
            "status": [{"value": value, "label": label} for value, label in StatusEvento.choices],
            "setores": [{"value": value, "label": label} for value, label in Setor.choices],
            "tipo_etapa": [{"value": value, "label": label} for value, label in TipoEtapa.choices],
            "areas_conhecimento": [{"value": value, "label": label} for value, label in AreaConhecimentoEscolha.choices],

        }
        return Response(data)