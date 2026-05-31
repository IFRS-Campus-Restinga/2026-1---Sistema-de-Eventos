from django.urls import path
from .views import (
    TemplateSistemaListView,
    TemplatePerfilListCreateView,
    TemplatePerfilDetailView,
)

urlpatterns = [
    path(
        "templates_sistema/",
        TemplateSistemaListView.as_view(),
        name="templates_sistema_list",
    ),
    path(
        "templates_perfil/",
        TemplatePerfilListCreateView.as_view(),
        name="templates_perfil_list_create",
    ),  # Criar Template para perfil
    path(
        "templates_perfil/<int:pk>/",
        TemplatePerfilDetailView.as_view(),
        name="templates_perfil_detail",
    ),
]
