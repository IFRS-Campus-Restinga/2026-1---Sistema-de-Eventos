from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsGroupAndObjectPerm(BasePermission):
    required_groups = []
    required_object_perms = []

    # Serve para dizer que "Se for administrador, pode".
    admin_group_name = "Administrador"

    def is_admin(self, user):
        return (
            user.is_superuser or user.groups.filter(name=self.admin_group_name).exists()
        )

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if self.is_admin(user):
            return True

        if not self.required_groups:
            return True

        return user.groups.filter(name__in=self.required_groups).exists()

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        if self.is_admin(user):
            return True

        if user.is_superuser:
            return True

        if not self.required_object_perms:
            return True

        return any(user.has_perm(perm, obj) for perm in self.required_object_perms)


class PodeGerenciarConteudoAdministrativo(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = []

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return super().has_permission(request, view)


# PERMS DE EVENTO
class PodeCoordenarEvento(IsGroupAndObjectPerm):
    required_groups = ["Coordenador"]
    required_object_perms = ["api.coordenar_evento"]


# isso ta ajudando a fazer funcionar a inclusão de coordenadores/organizadores. -Breno
class PodeGerenciarEquipeEvento(IsGroupAndObjectPerm):
    required_groups = ["Coordenador"]
    required_object_perms = ["api.coordenar_evento"]


class PodeOrganizarEvento(IsGroupAndObjectPerm):
    required_groups = ["Organizador", "Coordenador"]
    required_object_perms = ["api.organiza_evento", "api.coordenar_evento"]


# PERM MÁXIMA DO ADMIN
class IsAdmin(IsGroupAndObjectPerm):
    required_groups = ["Administrador"]
    required_object_perms = []


# PERMS DE LOCAL
class PodeVerLocal(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.ver_local"]


class PodeAtribuirLocal(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.atribuir_local"]


# PERMS DE ESPAÇO
class PodeVerEspaco(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador", "Organizador"]
    required_object_perms = ["api.ver_espaco"]


class PodeAtribuirEspaco(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador", "Organizador"]
    required_object_perms = ["api.atribuir_espaco"]


class PodeCriarEspaco(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.criar_espaco"]


class PodeGerenciarModalidade(PodeGerenciarConteudoAdministrativo):
    pass


class PodeGerenciarCampoFormulario(PodeGerenciarConteudoAdministrativo):
    pass


class PodeGerenciarCriterioAvaliacaoAtracao(PodeGerenciarConteudoAdministrativo):
    pass


class PodeGerenciarCriterioAvaliacaoSubmissao(PodeGerenciarConteudoAdministrativo):
    pass


# PERMS PARA AVALIACAO
class PodeAvaliarAtracao(IsGroupAndObjectPerm):
    required_groups = ["Servidor"]
    required_object_perms = ["api.avaliar_atracao"]


# Permissão para visualizar avaliações de atração
class PodeVerAvaliacaoAtracao(BasePermission):
    def _is_admin_or_coordenador(self, user):
        return (
            user.is_superuser
            or user.groups.filter(name__in=["Administrador", "Coordenador"]).exists()
        )

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if self._is_admin_or_coordenador(user):
            return True

        # avaliador só pode ver sua própria avaliação
        return getattr(obj, "avaliador", None) == user


class PodeVerAvaliacaoSubmissao(BasePermission):
    """
    Regra de visibilidade para as avaliações de submissão.
    Administradores e Coordenadores possuem visão macro (visualizam tudo).
    Avaliadores comuns têm escopo restrito apenas às avaliações de sua autoria.
    """

    def _is_admin_or_coordenador(self, user):
        return (
            user.is_superuser
            or user.groups.filter(name__in=["Administrador", "Coordenador"]).exists()
        )

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if self._is_admin_or_coordenador(user):
            return True

        # Restringe o avaliador comum às suas próprias avaliações executadas
        return getattr(obj, "avaliador", None) == user


class PodeGerenciarAvaliadoresSubmissao(IsGroupAndObjectPerm):
    """
    Permissão para determinar quem pode vincular ou remover um avaliador de
    uma submissão específica. Segue o ecossistema do seu 'PodeGerenciarEquipeEvento'.
    """

    required_groups = ["Coordenador", "Administrador"]
    required_object_perms = ["api.coordenar_evento"]

    def has_object_permission(self, request, view, obj):
        # O objeto testado aqui será a Submissao. Precisamos validar a permissão
        # do usuário com base no Evento ao qual a submissão pertence.
        user = request.user
        if not user.is_authenticated:
            return False
        if user.is_superuser or self.is_admin(user):
            return True

        evento = getattr(obj, "evento", None)
        if not evento:
            return False

        return any(user.has_perm(perm, evento) for perm in self.required_object_perms)
