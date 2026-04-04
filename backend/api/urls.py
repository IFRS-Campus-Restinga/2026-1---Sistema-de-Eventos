from django.urls import path
from .views.local_views import LocalListView, LocalDetailView
from .views.visao_geral_view import DashboardView

from .views.perms_view import PermissaoListView
from .views.groups_view import GrupoListView, GrupoPermissoesView
from .views.user_view import UserListView, UserPermissoesView
from .views import csrf_token_view as views

app_name = "api"

urlpatterns = [
    # paths relacionados a local
    path("locais/", LocalListView.as_view()),
    path("locais/<int:pk>/", LocalDetailView.as_view()),
    # paths para usuários (vai ter mudar td sobre usuários dps)
    path("users/", UserListView.as_view()),
    path("users/<int:pk>/", UserPermissoesView.as_view()),
    # paths relacionados a permissões e grupos de permissões
    path("permissoes/", PermissaoListView.as_view()),
    path("grupos/", GrupoListView.as_view()),
    path("grupos/<int:pk>/", GrupoPermissoesView.as_view()),
    # endpoint pra pegar o csrf token, que o frontend vai usar pra autenticação
    path("csrf/", views.get_csrf_token),
    path('dashboard/', DashboardView.as_view()),
]
    
