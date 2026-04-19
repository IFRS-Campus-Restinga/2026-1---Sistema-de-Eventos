import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarCriterioAvaliacao = async () => {
    const response = await axios.get(`${API_URL}/api/criterio_avaliacao/`);
    return response.data;
};

export const criarCriterioAvaliacao = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.post(
        `${API_URL}/api/criterio_avaliacao/`,
        dados,
        {
            headers: { 'X-CSRFToken': csrfToken },
        },
    );
    return response.data;
};

export const atualizarCriterioAvaliacao = async (id, dados) => {
    if (!id) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.put(
        `${API_URL}/api/criterio_avaliacao/${id}/`,
        dados,
        {
            headers: { 'X-CSRFToken': csrfToken },
        },
    );

    return response.data;
};

export const deletarCriterioAvaliacao = async (id) => {
    if (!id) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.delete(
        `${API_URL}/api/criterio_avaliacao/${id}/`,
        {
            headers: { 'X-CSRFToken': csrfToken },
        },
    );

    return response.data;
};

export const pegarOptionsCriteriovaliacao = async () => {
    const response = await axios.options(`${API_URL}/api/criterio_avaliacao/`);
    return response.data;
};
