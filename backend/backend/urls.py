"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path

from .views.perms_view import PermissaoListView
from .views.groups_view import GrupoListView, GrupoPermissoesView
from .views.user_view import UserGruposView, UserListView
from .views import csrf_token_view as views


urlpatterns = [
    path("admin/", admin.site.urls),
    # paths para usuários (vai ter mudar td sobre usuários dps)
    path("api/users/", UserListView.as_view()),
    path("api/users/<int:pk>/", UserGruposView.as_view()),
    # paths relacionados a permissões e grupos de permissões
    path("api/permissoes/", PermissaoListView.as_view()),
    path("api/grupos/", GrupoListView.as_view()),
    path("api/grupos/<int:pk>/", GrupoPermissoesView.as_view()),
    # endpoint pra pegar o csrf token, que o frontend vai usar pra autenticação
    path("api/csrf/", views.get_csrf_token),

    path("api/", include('api.urls')),
]
