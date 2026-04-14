import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const listarEventos = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/`);
    return response.data;
};

export const criarEvento = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.post(API_URL, dados, {
        headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
};

export const buscarOpcoesFormulario = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/opcoes/`);
    return response.data;
};

export const definirCoordenadorEvento = async (eventoId, userId) => {
    if (!eventoId || !userId) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const accessToken = localStorage.getItem('access_token');

    const response = await axios.patch(
        `${API_URL}/api/eventos/${eventoId}/coordenador/`,
        { user_id: userId },
        {
            headers: {
                'X-CSRFToken': csrfToken,
                ...(accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {}),
            },
            withCredentials: true,
        },
    );

    return response.data;
};