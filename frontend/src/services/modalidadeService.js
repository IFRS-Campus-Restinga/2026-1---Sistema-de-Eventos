import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarModalidades = async () => {
    const response = await axios.get(`${API_URL}/api/modalidades/`);
    return response.data;
};

export const criarModalidade = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.post(`${API_URL}/api/modalidades/`, dados, {
        headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
};
