from django.urls import path

from .views import csrf_token_view as views
from .views.cadastro_complementar_view import CadastroComplementarView
from .views.campo_formulario_view import (
    CampoFormularioDetailView,
    CampoFormularioListView,
)
from .views.choices_evento_view import OpcoesFormularioView
from .views.criterio_avaliacao_view import (
    CriterioAvaliacaoDetailView,
    CriterioAvaliacaoListView,
)
from .views.espaco_view import EspacoDetailView, EspacoListView
from .views.evento_view import (
    EventoCoordenadorView,
    EventoDeleteView,
    EventoDetailView,
    EventoListView,
    EventoUpdateView,
)
from .views.groups_view import GrupoListView, GrupoPermissoesView
from .views.local_views import LocalDetailView, LocalListView
from .views.modalidade_view import ModalidadeDetailView, ModalidadeListView
from .views.perms_view import PermissaoListView
from .views.tipo_campo_view import TipoCampoListView
from .views.user_view import UserListView, UserPermissoesView
from .views.visao_geral_view import DashboardView

app_name = "api"

# fmt: off
urlpatterns = [
    # paths relacionados a local
    path("locais/", LocalListView.as_view()),
    path("eventos/", EventoListView.as_view()),
    path("eventos/opcoes/",OpcoesFormularioView.as_view()),
    path("locais/<int:pk>/", LocalDetailView.as_view()),
    path("espacos/", EspacoListView.as_view()),
    path("espacos/<int:pk>/", EspacoDetailView.as_view()),
    # paths para usuários (vai ter mudar td sobre usuários dps)
    path("users/", UserListView.as_view()),
    path("users/<int:pk>/", UserPermissoesView.as_view()),
    # path para cadastro complementar
    path("usuarios/cadastro-complementar/", CadastroComplementarView.as_view(), name="cadastro_complementar"),
    # paths relacionados a permissões e grupos de permissões
    path("permissoes/", PermissaoListView.as_view()),
    path("grupos/", GrupoListView.as_view()),
    path("grupos/<int:pk>/", GrupoPermissoesView.as_view()),
    # endpoint pra pegar o csrf token, que o frontend vai usar pra autenticação
    path("csrf/", views.get_csrf_token),
    path("dashboard/", DashboardView.as_view()),
    path('eventos/<int:pk>/update/', EventoUpdateView.as_view()),
    path('eventos/<int:pk>/', EventoDetailView.as_view()),
    path('eventos/<int:pk>/delete/', EventoDeleteView.as_view()),
    path('eventos/<int:pk>/coordenador/', EventoCoordenadorView.as_view()),
    path('modalidades/', ModalidadeListView.as_view()),
    path("modalidades/<int:pk>/",ModalidadeDetailView.as_view()),
    path('tipo_campo/', TipoCampoListView.as_view()),
    path('campo_formulario/', CampoFormularioListView.as_view()),
    path('campo_formulario/<int:pk>/', CampoFormularioDetailView.as_view()),
    path('criterio_avaliacao/', CriterioAvaliacaoListView.as_view()),
    path('criterio_avaliacao/<int:pk>/', CriterioAvaliacaoDetailView.as_view()),
]
# fmt: on
