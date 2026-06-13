# from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.serializers.users_serializer import (
    UserGrupoSerializer,
    UserGrupoUpdateSerializer,
    UserPermissoesSerializer,
    UserPermissoesUpdateSerializer,
    UserSerializer,
)

from .perms_generic_view import IsAdmin, PodeCoordenarEvento

User = get_user_model()


def _serializar_usuarios_com_perfil(usuarios):
    resultados = []
    from ..models.perfil import Perfil

    for u in usuarios:
        perfil = Perfil.objects.filter(usuario=u).first()
        perfil_id = perfil.id if perfil else None
        nome = None
        if perfil and getattr(perfil, "nome", None):
            nome = perfil.nome
        else:
            nome = getattr(u, "get_full_name", lambda: "")() or u.username

        resultados.append(
            {
                "id": u.id,
                "username": u.username,
                "perfil_id": perfil_id,
                "nome": nome,
                "email": u.email,
                "nivel_ensino": getattr(perfil, "nivel_ensino", None)
                if perfil
                else None,
                "nivel_ensino_display": perfil.get_nivel_ensino_display()
                if perfil and getattr(perfil, "nivel_ensino", None)
                else None,
                "area_conhecimento": getattr(perfil, "area_conhecimento", None)
                if perfil
                else None,
                "areas": [getattr(perfil, "area_conhecimento", None)]
                if perfil and getattr(perfil, "area_conhecimento", None)
                else [],
            }
        )

    return resultados


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Coordenadores também precisam dessa lista para atribuir os organizadores
    permission_classes = [PodeCoordenarEvento]


class ServidorListView(generics.ListAPIView):
    """Lista usuários pertencentes ao grupo 'Servidor' com informações de perfil."""

    permission_classes = [PodeCoordenarEvento]

    def list(self, request, *args, **kwargs):
        grupo_nome = request.query_params.get("grupo", "Servidor")
        q = request.query_params.get("q", None)
        usuarios = User.objects.filter(groups__name=grupo_nome).distinct()

        if q:
            from django.db.models import Q

            # buscar por username, email ou perfil.area_conhecimento
            usuarios = usuarios.filter(
                Q(username__icontains=q)
                | Q(email__icontains=q)
                | Q(perfil__area_conhecimento__icontains=q)
            ).distinct()
        return Response(_serializar_usuarios_com_perfil(usuarios))


class UsuarioElegivelListView(generics.ListAPIView):
    """Lista usuários elegíveis para equipe/autoria, sem restringir ao grupo Servidor."""

    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        q = (request.query_params.get("q") or "").strip()
        grupos = (request.query_params.get("grupos") or "").strip()

        try:
            limite = int(request.query_params.get("limit", 20))
        except (TypeError, ValueError):
            limite = 20

        limite = max(1, min(limite, 50))

        usuarios = (
            User.objects.filter(is_active=True)
            .exclude(is_superuser=True)
            .exclude(username__iexact="AnonymousUser")
            .distinct()
        )

        if grupos:
            grupos_lista = [g.strip() for g in grupos.split(",") if g.strip()]
            if grupos_lista:
                usuarios = usuarios.filter(groups__name__in=grupos_lista).distinct()

        if q:
            from django.db.models import Q

            if len(q) < 5:
                return Response([])

            usuarios = usuarios.filter(
                Q(username__icontains=q)
                | Q(email__icontains=q)
                | Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(perfil__nome__icontains=q)
                | Q(perfil__area_conhecimento__icontains=q)
            ).distinct()

        usuarios = usuarios.order_by("username")[:limite]
        return Response(_serializar_usuarios_com_perfil(usuarios))


class UserGruposView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.prefetch_related("groups")
    serializer_class = UserGrupoUpdateSerializer
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserGrupoUpdateSerializer
        return UserGrupoSerializer


class UserPermissoesView(generics.RetrieveUpdateAPIView):
    # tem q por na cabeça q as permissões de usuário são "user_permissions", n "permissions" só
    queryset = User.objects.prefetch_related("user_permissions")
    serializer_class = UserPermissoesUpdateSerializer
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserPermissoesUpdateSerializer
        return UserPermissoesSerializer
