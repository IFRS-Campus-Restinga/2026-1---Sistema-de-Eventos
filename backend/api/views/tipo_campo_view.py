from rest_framework.permissions import AllowAny

from ..enumerations.tipo_campo import TipoCampo
from .enum_view import EnumChoicesAPIView


class TipoCampoListView(EnumChoicesAPIView):
    enum_class = TipoCampo
    permission_classes = [AllowAny]
