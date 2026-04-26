from django.urls import path

from .enumerations import AreaConhecimentoEscolha, Setor
from .views import EnumChoicesAPIView
from .views import csrf_token_view as views
from .views.arquivo_view import ArquivoListView
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
from .views.cronograma_view import CronogramaDetailView, CronogramaListView
from .views.espaco_view import EspacoDetailView, EspacoListView
from .views.evento_view import (
    EventoCoordenadorView,
    EventoDeleteView,
    EventoDetailView,
    EventoListView,
    EventoOrganizadorView,
    EventoUpdateView,
)
from .views.groups_view import GrupoListView, GrupoPermissoesView
from .views.local_views import LocalDetailView, LocalListView
from .views.modalidade_view import ModalidadeDetailView, ModalidadeListView
from .views.perms_view import PermissaoListView
from .views.tipo_campo_view import TipoCampoListView
from .views.tipo_etapa_view import TipoEtapaListView
from .views.user_view import UserListView, UserPermissoesView
from .views.visao_geral_view import DashboardView

app_name = "api"

# fmt: off
urlpatterns = [
    # eventos
    path("eventos/", EventoListView.as_view()),
    path("eventos/opcoes/", OpcoesFormularioView.as_view()),
    path("eventos/<int:pk>/", EventoDetailView.as_view()),
    path("eventos/<int:pk>/update/", EventoUpdateView.as_view()),
    path("eventos/<int:pk>/delete/", EventoDeleteView.as_view()),
    path("eventos/<int:pk>/coordenador/", EventoCoordenadorView.as_view()),
    path("eventos/<int:pk>/organizador/", EventoOrganizadorView.as_view()),
    path("dashboard/", DashboardView.as_view()),

    # locais e espacos
    path("locais/", LocalListView.as_view()),
    path("locais/<int:pk>/", LocalDetailView.as_view()),
    path("espacos/", EspacoListView.as_view()),
    path("espacos/<int:pk>/", EspacoDetailView.as_view()),

    # configuracoes de evento
    path("modalidades/", ModalidadeListView.as_view()),
    path("modalidades/<int:pk>/", ModalidadeDetailView.as_view()),
    path("tipo_campo/", TipoCampoListView.as_view()),
    path("tipo_etapa/", TipoEtapaListView.as_view()),
    path("campo_formulario/", CampoFormularioListView.as_view()),
    path("campo_formulario/<int:pk>/", CampoFormularioDetailView.as_view()),
    path("criterio_avaliacao/", CriterioAvaliacaoListView.as_view()),
    path("criterio_avaliacao/<int:pk>/", CriterioAvaliacaoDetailView.as_view()),
    path('areas_conhecimento/', EnumChoicesAPIView.as_view(enum_class=AreaConhecimentoEscolha)),
    path('setores/', EnumChoicesAPIView.as_view(enum_class=Setor)),

    # cronogramas
    path("cronogramas/", CronogramaListView.as_view()),
    path("cronogramas/<int:pk>/", CronogramaDetailView.as_view()),

    # arquivos
    path("arquivos/", ArquivoListView.as_view()),

    # usuarios e permissoes
    path("users/", UserListView.as_view()),
    path("users/<int:pk>/", UserPermissoesView.as_view()),
    path("usuarios/cadastro-complementar/", CadastroComplementarView.as_view(), name="cadastro_complementar"),
    path("permissoes/", PermissaoListView.as_view()),
    path("grupos/", GrupoListView.as_view()),
    path("grupos/<int:pk>/", GrupoPermissoesView.as_view()),

    # utilitarios
    path("csrf/", views.get_csrf_token),
]
# fmt: on
