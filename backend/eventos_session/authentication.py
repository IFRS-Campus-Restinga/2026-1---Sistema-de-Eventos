from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from eventos_session.services.token_service import (
    TokenService,
    TokenValidationError,
    TokenValidationService,
)


class CookieJWTAuthentication(BaseAuthentication):
    """Authenticate DRF requests from custom access token stored in HttpOnly cookie."""

    cookie_name = "access_token"

    def authenticate(self, request):
        token = request.COOKIES.get(self.cookie_name)
        if not token:
            return None

        try:
            payload = TokenService.decode_token(token)
            user = TokenValidationService.validate(payload)
            return user, payload
        except (ValueError, KeyError, TypeError, TokenValidationError) as exc:
            raise AuthenticationFailed("Token de acesso inválido ou ausente") from exc
