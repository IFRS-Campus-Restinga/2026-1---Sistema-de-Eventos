from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
	def has_permission(self, request, view):
		user = request.user

		if not user.is_authenticated:
			return False

		return user.is_superuser or user.is_staff


class PodeGerenciarEvento(BasePermission):
	def has_object_permission(self, request, view, evento):
		user = request.user

		if not user.is_authenticated:
			return False

		return user.is_superuser or user.has_perm("api.coordenar_evento", evento)

