import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const listarInscricoesEventos = async () => {
    const response = await axios.get(`${API_URL}/api/inscricoes_eventos/`, {
        withCredentials: true,
    });

    return response.data;
};

export const registrarPresencaEvento = async (eventoId) => {
    if (!eventoId) {
        throw new Error('eventoId obrigatório');
    }

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.post(
        `${API_URL}/api/inscricoes_eventos/${eventoId}/marcar_presenca/`,
        {},
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};