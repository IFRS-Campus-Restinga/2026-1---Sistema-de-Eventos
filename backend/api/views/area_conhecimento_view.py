# api/views/area_conhecimento_view.py
from rest_framework import viewsets
from ..models.area_conhecimento import AreaConhecimento
from ..serializers.area_conhecimento_serializer import AreaConhecimentoSerializer
from rest_framework import permissions


class AreaConhecimentoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AreaConhecimento.objects.all()
    serializer_class = AreaConhecimentoSerializer
    permission_classes = [permissions.AllowAny]