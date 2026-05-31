import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarSessoes = async (eventoId = null) => {
    try {
        let url = `${API_URL}/api/sessoes/`;

        if (eventoId) {
            url += `?evento=${eventoId}`;
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

export const pegarSessao = async (id) => {
    if (!id) return null;

    try {
        const response = await axios.get(`${API_URL}/api/sessoes/${id}/`, {
            withCredentials: true,
        });
        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};

export const criarSessao = async (dados) => {
    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';

        const response = await axios.post(`${API_URL}/api/sessoes/`, dados, {
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

export const atualizarSessao = async (id, dados) => {
    if (!id) return null;

    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';

        const response = await axios.put(
            `${API_URL}/api/sessoes/${id}/`,
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

export const salvarOrdensSessao = async (apresentacoes) => {
    const csrfData = await pegarTokenCsrf();

    const response = await axios.post(
        `${API_URL}/api/ordem_apresentacao_atracao/`,
        apresentacoes,
        {
            headers: {
                'X-CSRFToken': csrfData?.csrfToken || '',
            },
            withCredentials: true,
        },
    );

    return response.data;
};
