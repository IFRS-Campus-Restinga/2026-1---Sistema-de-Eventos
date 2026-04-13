from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from api.serializers.users_serializer import (
    UserSerializer,
    UserGrupoSerializer,
    UserGrupoUpdateSerializer,
    UserPermissoesSerializer,
    UserPermissoesUpdateSerializer,
)

User = get_user_model()


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserGruposView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.prefetch_related("groups")
    serializer_class = UserGrupoUpdateSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserGrupoUpdateSerializer
        return UserGrupoSerializer


class UserPermissoesView(generics.RetrieveUpdateAPIView):
    # tem q por na cabeça q as permissões de usuário são "user_permissions", n "permissions" só
    queryset = User.objects.prefetch_related("user_permissions")
    serializer_class = UserPermissoesUpdateSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserPermissoesUpdateSerializer
        return UserPermissoesSerializer
