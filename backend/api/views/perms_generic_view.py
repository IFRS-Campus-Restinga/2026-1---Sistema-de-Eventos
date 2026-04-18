from rest_framework.permissions import BasePermission


class IsGroupAndObjectPerm(BasePermission):
    required_groups = []
    required_object_perms = []

    # Serve para dizer que "Se for administrador, pode".
    admin_group_name = "Administrador"

    def is_admin(self, user):
        return user.groups.filter(name=self.admin_group_name).exists()

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if self.is_admin(user):
            return True

        if not self.required_groups:
            return True

        return user.groups.filter(name__in=self.required_groups).exists()

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        if self.is_admin(user):
            return True

        if user.is_superuser:
            return True

        if not self.required_object_perms:
            return True

        return any(user.has_perm(perm, obj) for perm in self.required_object_perms)


# PERMS DE EVENTO
class PodeCoordenarEvento(IsGroupAndObjectPerm):
    required_groups = ["Coordenador"]
    required_object_perms = ["api.coordenar_evento"]


class PodeOrganizarEvento(IsGroupAndObjectPerm):
    required_groups = ["Organizador", "Coordenador"]
    required_object_perms = ["api.organiza_evento", "api.coordenar_evento"]


# PERM MÁXIMA DO ADMIN
class IsAdmin(IsGroupAndObjectPerm):
    required_groups = ["Administrador"]
    required_object_perms = []


# PERMS DE LOCAL
class PodeVerLocal(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.ver_local"]


class PodeAtribuirLocal(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.atribuir_local"]


# PERMS DE ESPAÇO
class PodeVerEspaco(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador", "Organizador"]
    required_object_perms = ["api.ver_espaco"]


class PodeAtribuirEspaco(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador", "Organizador"]
    required_object_perms = ["api.atribuir_espaco"]


class PodeCriarEspaco(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.criar_espaco"]
