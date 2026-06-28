const TIPOS_ADMIN = ['admin', 'administrador'];
const TIPOS_COORDENADOR = ['coordenador', 'organizador'];

function normalizarGrupos(usuario) {
    if (!usuario) return [];

    const grupos = Array.isArray(usuario.groups) ? usuario.groups : [];
    return grupos
        .map((grupo) => (typeof grupo === 'string' ? grupo : grupo?.name))
        .filter(Boolean)
        .map((grupo) => String(grupo).trim().toLowerCase());
}

function usuarioEhAdmin(usuario) {
    if (!usuario) return false;
    if (usuario.is_superuser || usuario.is_staff) return true;

    const grupos = normalizarGrupos(usuario);
    return grupos.some((grupo) => TIPOS_ADMIN.includes(grupo));
}

function usuarioEhCoordenadorOuOrganizador(usuario) {
    if (!usuario) return false;

    const grupos = normalizarGrupos(usuario);
    return grupos.some((grupo) => TIPOS_COORDENADOR.includes(grupo));
}

export function etapaEstaAberta(evento, tipoEtapa, agora = new Date()) {
    if (!evento?.etapas || !Array.isArray(evento.etapas)) return false;

    return evento.etapas.some((etapa) => {
        if (
            String(etapa?.tipo_etapa || '').toUpperCase() !==
            String(tipoEtapa).toUpperCase()
        ) {
            return false;
        }

        const inicio = etapa?.data_inicio ? new Date(etapa.data_inicio) : null;
        const fim = etapa?.data_fim ? new Date(etapa.data_fim) : null;

        if (!inicio || !fim) return false;
        return agora >= inicio && agora <= fim;
    });
}

export function podeAcessarSubmissao({ evento, usuario, agora = new Date() }) {
    if (usuarioEhAdmin(usuario) || usuarioEhCoordenadorOuOrganizador(usuario)) {
        return true;
    }

    return etapaEstaAberta(evento, 'SUBMISSAO_TRABALHOS', agora);
}
