const STORAGE_KEY = 'selected_evento_id';

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

export function clearSelectedEventoId() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        //
    }
}
