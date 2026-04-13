from rest_framework.permissions import AllowAny

from ..enumerations.tipo_etapa import TipoEtapa
from .enum_view import EnumChoicesAPIView


class TipoEtapaListView(EnumChoicesAPIView):
    enum_class = TipoEtapa
    permission_classes = [AllowAny]
