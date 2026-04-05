import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

const API_URL = 'http://localhost:8000/api/eventos/';

export const listarEventos = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const criarEvento = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    
    const response = await axios.post(API_URL, dados, {
        headers: { 'X-CSRFToken': csrfToken }
    });
    return response.data;
};