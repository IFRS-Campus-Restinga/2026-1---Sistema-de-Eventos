from rest_framework.permissions import BasePermission

from eventos_session.services.token_service import TokenService, TokenValidationError


class HasValidSessionToken(BasePermission):
    """Permite acesso apenas quando houver token válido via cookie HttpOnly da sessão customizada."""

    message = "Token de acesso inválido ou ausente"

    def has_permission(self, request, view):
        # Fluxo atual: somente cookie HttpOnly.
        token = request.COOKIES.get("access_token")

        if not token:
            return False

        try:
            request.session_payload = TokenService.decode_token(token)
            return True
        except (ValueError, KeyError, TypeError, TokenValidationError):
            return False
