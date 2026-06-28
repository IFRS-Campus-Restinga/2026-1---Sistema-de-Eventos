from rest_framework.generics import (
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
    ListCreateAPIView,
)
from emails.models import TemplateSistema, TemplatePerfil
from emails.serializers import TemplateSistemaSerializer, TemplatePerfilSerializer
from eventos_session.permissions import HasValidSessionToken
from api.models.perfil import Perfil
from eventos_session.models import Usuario
from ..models.template_sistema import CategoriaTemplateSistema


class TemplateSistemaListView(ListAPIView):  # Envios de Templates do Sistema
    authentication_classes = []  # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.
    permission_classes = [HasValidSessionToken]
    serializer_class = TemplateSistemaSerializer

    def get_queryset(self):
        # Entrega penas templates de seleção manual
        return TemplateSistema.objects.filter(categoria=CategoriaTemplateSistema.MANUAL)


class TemplatePerfilDetailView(
    RetrieveUpdateDestroyAPIView
):  # Permite deletar e editar os templates relacionados com o Perfil logado.
    serializer_class = TemplatePerfilSerializer
    authentication_classes = []
    permission_classes = [HasValidSessionToken]

    def get_queryset(self):
        external_id = self.request.session_payload.get("external_user_id")
        usuario = Usuario.objects.get(hub_id=external_id)
        return TemplatePerfil.objects.filter(perfil__usuario_id=usuario.id)


class TemplatePerfilListCreateView(ListCreateAPIView):  #
    serializer_class = TemplatePerfilSerializer
    authentication_classes = []  # Desliga o SimpleJWT global padrão, HasValidSessionToken fará a autenticação.
    permission_classes = [HasValidSessionToken]

    def get_queryset(self):
        # Retorna todos os templates de perfil cadastrados no banco
        external_id = self.request.session_payload.get("external_user_id")
        usuario = Usuario.objects.get(hub_id=external_id)

        return TemplatePerfil.objects.filter(perfil__usuario_id=usuario.id)

    def perform_create(self, serializer):
        # Captura o ID do usuário através da sessão do Token
        external_id = self.request.session_payload.get("external_user_id")
        usuario = Usuario.objects.get(hub_id=external_id)

        # Busca o perfil do usuário logado
        perfil = Perfil.objects.get(usuario_id=usuario.id)

        return serializer.save(perfil=perfil)
