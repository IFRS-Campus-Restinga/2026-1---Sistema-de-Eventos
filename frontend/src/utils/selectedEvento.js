const STORAGE_KEY = 'selected_evento_id';
const CHAVE_EVENTOS_RECENTES_ADMIN = 'recent_admin_eventos';

export function getSelectedEventoId() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        return null;
    }
}

export function setSelectedEventoId(eventoId) {
    if (!eventoId) return;

    try {
        localStorage.setItem(STORAGE_KEY, String(eventoId));
    } catch (error) {
        //
    }
}

export function obterEventosRecentesAdmin() {
    try {
        const raw = localStorage.getItem(CHAVE_EVENTOS_RECENTES_ADMIN);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (error) {
        return [];
    }
}

export function adicionarEventoRecenteAdminId(eventoId) {
    if (!eventoId) return;

    try {
        const atual = obterEventosRecentesAdmin();
        const idStr = String(eventoId);
        const filtrado = atual.filter((i) => String(i) !== idStr);
        filtrado.unshift(idStr);
        const limitado = filtrado.slice(0, 3);
        localStorage.setItem(
            CHAVE_EVENTOS_RECENTES_ADMIN,
            JSON.stringify(limitado),
        );
    } catch (error) {
        //
    }
}

export function clearSelectedEventoId() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        //
    }
}
