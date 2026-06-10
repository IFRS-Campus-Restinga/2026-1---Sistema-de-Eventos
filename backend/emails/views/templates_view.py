from rest_framework.generics import (
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
    ListCreateAPIView,
)
from rest_framework.permissions import AllowAny
from emails.models import TemplateSistema, TemplatePerfil
from emails.serializers import TemplateSistemaSerializer, TemplatePerfilSerializer
from eventos_session.permissions import HasValidSessionToken

# Importe o modelo de Perfil para usarmos o "mock"
from api.models.perfil import Perfil
from eventos_session.models import Usuario


class TemplateSistemaListView(ListAPIView):
    authentication_classes = []  # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.
    permission_classes = [HasValidSessionToken]

    queryset = TemplateSistema.objects.all()
    serializer_class = TemplateSistemaSerializer


class TemplatePerfilDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = TemplatePerfilSerializer
    authentication_classes = []
    permission_classes = [AllowAny]  # Rota 100% aberta para testes

    def get_queryset(self):
        # Permite acessar, editar ou deletar qualquer template no banco
        return TemplatePerfil.objects.all()


class TemplatePerfilListCreateView(ListCreateAPIView):
    serializer_class = TemplatePerfilSerializer
    authentication_classes = []  # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.
    permission_classes = [HasValidSessionToken]

    def get_queryset(self):
        # Retorna todos os templates de perfil cadastrados no banco
        external_id = self.request.session_payload.get("external_user_id")
        usuario = Usuario.objects.get(hub_id=external_id)

        return TemplatePerfil.objects.filter(perfil__usuario_id=usuario.id)

    def perform_create(self, serializer):
        # MOCK: Pega o primeiro perfil existente no banco de dados
        perfil_mock = Perfil.objects.first()

        # Salva o novo template atrelando a esse perfil genérico
        serializer.save(perfil=perfil_mock)
