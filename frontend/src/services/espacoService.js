import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarEspacos = async (localId = null) => {
    try {
        let url = `${API_URL}/api/espacos/`;
        if (localId) {
            url += `?local=${localId}`;
        }
        const response = await axios.get(url, {
            withCredentials: true,
        });
        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};

export const pegarEspaco = async (id) => {
    if (!id) return null;

    try {
        const response = await axios.get(`${API_URL}/api/espacos/${id}/`, {
            withCredentials: true,
        });
        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};

export const criarEspaco = async (dados) => {
    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';

        const response = await axios.post(`${API_URL}/api/espacos/`, dados, {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        });

        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};

export const atualizarEspaco = async (id, dados) => {
    if (!id) return null;

    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';

        const response = await axios.put(
            `${API_URL}/api/espacos/${id}/`,
            dados,
            {
                headers: { 'X-CSRFToken': csrfToken },
                withCredentials: true,
            },
        );

        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};

export const excluirEspaco = async (id) => {
    if (!id) return null;
    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';
        const response = await axios.delete(`${API_URL}/api/espacos/${id}/`, {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        });
        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};
