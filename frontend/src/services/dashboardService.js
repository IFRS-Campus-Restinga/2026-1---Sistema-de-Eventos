import { API_URL } from '../config';

export async function getDashboardEvento(eventoId) {
    const response = await fetch(`${API_URL}/api/dashboard/${eventoId}/`, {
        credentials: 'include',
    });
    return response.json();
}

///alterar para env do Bruno///
