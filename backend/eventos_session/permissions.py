from rest_framework.permissions import BasePermission

from eventos_session.services.token_service import TokenService, TokenValidationError


class HasValidSessionToken(BasePermission):
    """Permite acesso apenas quando houver Bearer token válido da sessão customizada."""

    message = "Token de acesso inválido ou ausente"

    def has_permission(self, request, view):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return False

        token = auth_header.split(" ", 1)[1]

        try:
            request.session_payload = TokenService.decode_token(token)
            return True
        except (ValueError, KeyError, TypeError, TokenValidationError):
            return False
