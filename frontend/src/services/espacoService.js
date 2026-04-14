import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarEspacos = async () => {
    const response = await axios.get(`${API_URL}/api/espacos/`);
    const data = response.data;
    return data;
};

export const pegarEspaco = async (id) => {
    if (!id) return null;
    const response = await axios.get(`${API_URL}/api/espacos/${id}/`);
    return response.data;
};

export const criarEspaco = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.post(`${API_URL}/api/espacos/`, dados, {
        headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
};

export const atualizarEspaco = async (id, dados) => {
    if (!id) return null;
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.put(`${API_URL}/api/espacos/${id}/`, dados, {
        headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
};
