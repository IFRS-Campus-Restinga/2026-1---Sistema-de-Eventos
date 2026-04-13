from django.urls import path

from eventos_session.views.auth_views import logout
from eventos_session.views.token_views import obter_sessao, obter_tokens, renovar_token

urlpatterns = [
    path("tokens/", obter_tokens),
    path("tokens/refresh/", renovar_token),
    path("me/", obter_sessao),
    path("logout/", logout),
]
