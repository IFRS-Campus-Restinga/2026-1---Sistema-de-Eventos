import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const registrarPresencaEvento = async (slugOuId) => {
    if (!slugOuId) {
        throw new Error('slugOuId obrigatório');
    }

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const url = `${API_URL}/api/inscricoes_eventos/${slugOuId}/marcar_presenca/`;

    const payload = {};

    const response = await axios.post(url, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
    });

    return response.data;
};
