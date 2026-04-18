import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarLocais = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/locais/`, {
            withCredentials: true,
        });
        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};


export const pegarLocal = async (id) => {
    if (!id) return null;

    try {
        const response = await axios.get(`${API_URL}/api/locais/${id}/`, {
            withCredentials: true,
        });
        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};


export const criarLocal = async (dados) => {
    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';

        const response = await axios.post(`${API_URL}/api/locais/`, dados, {
            headers: { 'X-CSRFToken': csrfToken },
        });

        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};



export const atualizarLocal = async (id, dados) => {
    if (!id) return null;

    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';

        const response = await axios.put(`${API_URL}/api/locais/${id}/`, dados, {
            headers: { 'X-CSRFToken': csrfToken },
        });

        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};

