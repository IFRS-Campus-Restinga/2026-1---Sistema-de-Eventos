import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';


export const pegarLocais = async () => {
    const response = await axios.get('http://localhost:8000/api/locais/')
    const data = response.data
    return data
}


export const pegarLocal = async (id) => {
    if (!id) return null;
    const response = await axios.get(`http://localhost:8000/api/locais/${id}/`);
    return response.data;
};


export const criarLocal = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.post(
        'http://localhost:8000/api/locais/',
        dados,
        {
            headers: { 'X-CSRFToken': csrfToken }
        });
    return response.data;
};


export const atualizarLocal = async (id, dados) => {
    if (!id) return null;
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.put(
        `http://localhost:8000/api/locais/${id}/`,
        dados,
        {
            headers: { 'X-CSRFToken': csrfToken }
        });
    return response.data;
};