from rest_framework.permissions import BasePermission

class IsAdminOrCoordenador(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # ajuste conforme grupos/perfil
        return user.is_superuser or user.groups.filter(name__in=["Administrador", "Coordenador"]).exists()
    

class PodeGerenciarEvento(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        return (
            user.is_superuser or
            user.groups.filter(name="Coordenador").exists()
        )