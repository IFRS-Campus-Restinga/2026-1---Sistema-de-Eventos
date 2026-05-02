import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const criarEtapa = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.post(`${API_URL}/api/etapas_evento/`, dados, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
    });
    return response.data;
};

export const listarEtapas = async () => {
    const response = await axios.get(`${API_URL}/api/etapas_evento/`);
    return response.data;
};

export const obterEtapa = async (id) => {
    if (!id) return null;
    const response = await axios.get(`${API_URL}/api/etapas_evento/${id}/`);
    return response.data;
};

export const atualizarEtapa = async (id, dados) => {
    if (!id) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.put(
        `${API_URL}/api/etapas_evento/${id}/`,
        dados,
        {
            headers: { 'X-CSRFToken': csrfToken },
        },
    );
    return response.data;
};

export const deletarEtapa = async (id) => {
    if (!id) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(`${API_URL}/api/etapas_evento/${id}/`, {
        headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
};
