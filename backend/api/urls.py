from django.urls import path

from .enumerations import Setor
from .views import EnumChoicesAPIView
from .views import csrf_token_view as views
from .views.area_conhecimento_view import AreaConhecimentoViewSet
from .views.arquivo_view import ArquivoListView
from .views.atracao_view import (
    AtracaoAvaliadorView,
    AtracaoDetailView,
    AtracaoListView,
    EnviarEmailsView,
)
from .views.avaliacao_atracao_view import (
    AvaliacaoAtracaoDetailView,
    AvaliacaoAtracaoListView,
)
from .views.avaliacao_submissao_view import (
    AvaliacaoSubmissaoDetailView,
    AvaliacaoSubmissaoListView,
)
from .views.cadastro_complementar_view import CadastroComplementarView
from .views.campo_formulario_view import (
    CampoFormularioDetailView,
    CampoFormularioListView,
)
from .views.choices_atracao_view import AtracaoOpcoesView
from .views.choices_evento_view import OpcoesFormularioView
from .views.criterio_avaliacao_atracao_view import (
    CriterioAvaliacaoAtracaoDetailView,
    CriterioAvaliacaoAtracaoListView,
)
from .views.criterio_avaliacao_submissao_view import (
    CriterioAvaliacaoSubmissaoDetailView,
    CriterioAvaliacaoSubmissaoListView,
)
from .views.espaco_view import EspacoDetailView, EspacoListView
from .views.etapa_evento_view import (
    EtapaEventoDetailView,
    EtapaEventoListView,
)
from .views.evento_view import (
    EventoAvaliadorView,
    EventoCoordenadorView,
    EventoDeleteView,
    EventoDetailView,
    EventoListView,
    EventoOrganizadorView,
    EventoUpdateView,
)
from .views.groups_view import GrupoListView, GrupoPermissoesView
from .views.inscricao_atracao_view import (
    InscricaoAtracaoDetailView,
    InscricaoAtracaoListView,
)
from .views.inscricao_evento_view import (
    CancelarInscricaoView,
    InscricaoEventoDetailView,
    InscricaoEventoListView,
    MinhasInscricoesEventoListView,
    RegistrarPresencaView,
)
from .views.item_avaliacao_atracao_view import (
    ItemAvaliaçãoAtracaoDetailView,
    ItemAvaliaçãoAtracaoListView,
)
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
    path("eventos/<int:pk>/avaliador/", EventoAvaliadorView.as_view()),
    path("eventos/<int:pk>/organizador/", EventoOrganizadorView.as_view()),
    path("eventos/<int:evento_id>/enviar_emails/", EnviarEmailsView.as_view()),
    path("dashboard/<int:pk>/", DashboardView.as_view()),

    # inscricoes
    path("inscricoes_eventos/", InscricaoEventoListView.as_view()),
    path("inscricoes_eventos/minhas/", MinhasInscricoesEventoListView.as_view()),
    path("inscricoes_eventos/<int:pk>/", InscricaoEventoDetailView.as_view()),
    path("inscricoes_eventos/<slug:slug>/marcar_presenca/", RegistrarPresencaView.as_view()),
    path("inscricoes_eventos/<int:pk>/cancelar/", CancelarInscricaoView.as_view()),
    path("inscricoes_atracoes/", InscricaoAtracaoListView.as_view()),
    path("inscricoes_atracoes/<int:pk>/", InscricaoAtracaoDetailView.as_view()),

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
    path("criterio_avaliacao/", CriterioAvaliacaoAtracaoListView.as_view()),
    path("criterio_avaliacao/<int:pk>/", CriterioAvaliacaoAtracaoDetailView.as_view()),
    path(
        "criterio_avaliacao_submissao/",
        CriterioAvaliacaoSubmissaoListView.as_view(),
    ),
    path(
        "criterio_avaliacao_submissao/<int:pk>/",
        CriterioAvaliacaoSubmissaoDetailView.as_view(),
    ),
    path("etapas_evento/", EtapaEventoListView.as_view()),
    path("etapas_evento/<int:pk>/", EtapaEventoDetailView.as_view()),
    path('areas_conhecimento/', AreaConhecimentoViewSet.as_view({'get': 'list'})),
    path('setores/', EnumChoicesAPIView.as_view(enum_class=Setor)),


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

    # atracoes
    path("atracoes/", AtracaoListView.as_view()),
    path("atracoes/opcoes/", AtracaoOpcoesView.as_view()),
    path("atracoes/<int:pk>/", AtracaoDetailView.as_view()),
    path("atracoes/<int:pk>/avaliador/", AtracaoAvaliadorView.as_view()),

    # avaliacao de submissoes
    path("avaliacao_submissao/", AvaliacaoSubmissaoListView.as_view()),
    path("avaliacao_submissao/<int:pk>/", AvaliacaoSubmissaoDetailView.as_view()),

    # avaliacao de atracoes
    path("avaliacao_atracao/", AvaliacaoAtracaoListView.as_view()),
    path("avaliacao_atracao/<int:pk>", AvaliacaoAtracaoDetailView.as_view()),
    path("item_avaliacao_atracao/", ItemAvaliaçãoAtracaoListView.as_view()),
    path("item_avaliacao_atracao/<int:pk>", ItemAvaliaçãoAtracaoDetailView.as_view()),
]
# fmt: on
