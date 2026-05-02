import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

const montarPayloadAtracao = (dados) => {
    const payload = new FormData();

    Object.keys(dados).forEach((key) => {
        if (key === 'equipe') {
            payload.append('equipe_json', JSON.stringify(dados[key]));
        } else if (dados[key] !== null && dados[key] !== undefined) {
            payload.append(key, dados[key]);
        }
    });

    return payload;
};

export const listarAtracoes = async () => {
    const response = await axios.get(`${API_URL}/api/atracoes/`, {
        withCredentials: true,
    });
    return response.data;
};

export const criarAtracao = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.post(`${API_URL}/api/atracoes/`, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
    });
    return response.data;
};

export const salvarRascunho = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.post(`${API_URL}/api/atracoes/`, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
    });
    return response.data;
};

export const buscarOpcoesAtracao = async () => {
    const response = await axios.get(`${API_URL}/api/atracoes/opcoes/`, {
        withCredentials: true,
    });
    return response.data;
};

export const buscarEventos = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/`, {
        withCredentials: true,
    });
    return response.data;
};

export const buscarUsuarios = async () => {
    const response = await axios.get(`${API_URL}/api/users/`, {
        withCredentials: true,
    });
    return response.data;
};
