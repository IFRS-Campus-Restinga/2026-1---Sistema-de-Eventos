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
    required_groups = [
        "Coordenador",
    ]
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


# PERMS DE EtapaEvento
class PodeVerEtapaEvento(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador", "Organizador"]
    required_object_perms = ["api.ver_etapa_evento"]


class PodeAtribuirEtapaEvento(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.atribuir_etapa_evento"]


class PodeExcluirEtapaEvento(IsGroupAndObjectPerm):
    required_groups = ["Administrador", "Coordenador"]
    required_object_perms = ["api.excluir_etapa_evento"]


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
        # Permite também que os autores, orientador ou membros da equipe
        # relacionados à submissão vejam a avaliação.
        if getattr(obj, "avaliador", None) == user:
            return True

        submissao = getattr(obj, "submissao", None)
        if not submissao:
            return False

        # orientador
        if getattr(submissao, "orientador", None) == user:
            return True

        # autoria registrada (usuários do sistema)
        try:
            if (
                hasattr(submissao, "autorias")
                and submissao.autorias.filter(usuario=user).exists()
            ):
                return True
        except Exception:
            pass

        return False


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


class PodeGerenciarSubmissoes(BasePermission):
    """
    Regras:
    - Qualquer usuario autenticado pode criar
    - Ver: O próprio autor/orientador OR Admin/Coordenador/Organizador do Evento.
    - Editar/Eliminar (PUT, PATCH, DELETE): O próprio autor/orientador OR Admin/Coordenador do Evento.
    """

    def is_admin(self, user):
        return user.is_superuser or user.groups.filter(name="Administrador").exists()

    def has_permission(self, request, view):
        # Qualquer usuario precisa estar autenticado para interagir com submissões
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        # 1. Administradores globais têm passe livre total
        if self.is_admin(user):
            return True

        # 2. Verificar se o utilizador é o Dono (Orientador ou Autor)
        is_dono = False
        if getattr(obj, "orientador", None) == user:
            is_dono = True

        try:
            if hasattr(obj, "autorias") and obj.autorias.filter(usuario=user).exists():
                is_dono = True
        except Exception:
            pass

        # Se for o dono do trabalho, tem permissão para ler e modificar as suas próprias coisas
        if is_dono:
            return True

        # 3. Se NÃO for o dono, validamos via Django Guardian olhando para o Evento Pai
        evento = getattr(obj, "evento", None)
        if not evento:
            return False

        # Se for apenas leitura (GET / Detalhes)
        if request.method in SAFE_METHODS:
            # Coordenadores e Organizadores do evento podem VER todas as submissões
            return user.has_perm("api.coordenar_evento", evento) or user.has_perm(
                "api.organiza_evento", evento
            )

        # Se for modificação (PUT, PATCH, DELETE)
        # Apenas Coordenadores do evento podem EDITAR submissões alheias (Organizadores ficam de fora)
        return user.has_perm("api.coordenar_evento", evento)


class PodeGerenciarAtracoes(IsGroupAndObjectPerm):
    """
    Permissão que permite a qualquer usuário visualizar as atrações (SAFE_METHODS),
    mas exige que o usuário seja Administrador, Coordenador ou Organizador
    com permissão de objeto no Evento pai para criar ou modificar.
    """

    required_groups = ["Coordenador", "Organizador", "Administrador"]
    required_object_perms = ["api.coordenar_evento", "api.organiza_evento"]

    def has_permission(self, request, view):
        # Regra: Todos podem ver as informações de atração
        if request.method in SAFE_METHODS:
            return True

        # Para criar ou editar, o usuário precisa pelo menos estar autenticado e nos grupos
        return super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        # Regra: Todos podem visualizar os detalhes de uma atração específica
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if user.is_superuser or self.is_admin(user):
            return True

        # O objeto aqui é a instância de Atracao. Buscamos o Evento atrelado a ela.
        evento = getattr(obj, "evento", None)

        # Fallback: Se o evento não estiver direto na atração, tenta buscar via submissão
        if not evento and getattr(obj, "submissao", None):
            evento = getattr(obj.submissao, "evento", None)

        if not evento:
            return False

        # Valida se o usuário tem permissão de objeto (Guardian) no EVENTO desta atração
        return any(user.has_perm(perm, evento) for perm in self.required_object_perms)
