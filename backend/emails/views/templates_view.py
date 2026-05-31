from rest_framework.generics import (
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
    ListCreateAPIView,
)
from rest_framework.permissions import AllowAny
from emails.models import TemplateSistema, TemplatePerfil
from emails.serializers import TemplateSistemaSerializer, TemplatePerfilSerializer

# Importe o modelo de Perfil para usarmos o "mock"
from api.models.perfil import Perfil


class TemplateSistemaListView(ListAPIView):
    queryset = TemplateSistema.objects.all()
    serializer_class = TemplateSistemaSerializer
    authentication_classes = []
    permission_classes = [AllowAny]  # Rota 100% aberta para testes


class TemplatePerfilDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = TemplatePerfilSerializer
    authentication_classes = []
    permission_classes = [AllowAny]  # Rota 100% aberta para testes

    def get_queryset(self):
        # Permite acessar, editar ou deletar qualquer template no banco
        return TemplatePerfil.objects.all()


class TemplatePerfilListCreateView(ListCreateAPIView):
    serializer_class = TemplatePerfilSerializer
    authentication_classes = []
    permission_classes = [AllowAny]  # Rota 100% aberta para testes

    def get_queryset(self):
        # Retorna todos os templates de perfil cadastrados no banco
        return TemplatePerfil.objects.all()

    def perform_create(self, serializer):
        # MOCK: Pega o primeiro perfil existente no banco de dados
        perfil_mock = Perfil.objects.first()

        # Salva o novo template atrelando a esse perfil genérico
        serializer.save(perfil=perfil_mock)
