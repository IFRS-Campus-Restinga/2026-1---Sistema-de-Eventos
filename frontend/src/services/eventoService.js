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
