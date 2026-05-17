import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

export const listarAvaliacoes = async () => {
    const response = await axios.get(`${API_URL}/api/avaliacao-submissao/`, {
        withCredentials: true,
    });
    return response.data;
};

export const listarAvaliacoesPorSubmissao = async (submissaoId) => {
    const response = await axios.get(
        `${API_URL}/api/avaliacao-submissao/?submissao_id=${submissaoId}`,
        {
            withCredentials: true,
        }
    );
    return response.data;
};

export const listarAvaliacoesPorAvaliador = async (avaliadorId) => {
    const response = await axios.get(
        `${API_URL}/api/avaliacao-submissao/?avaliador_id=${avaliadorId}`,
        {
            withCredentials: true,
        }
    );
    return response.data;
};

export const listarAvaliacoesPorStatus = async (status) => {
    const response = await axios.get(
        `${API_URL}/api/avaliacao-submissao/?status=${status}`,
        {
            withCredentials: true,
        }
    );
    return response.data;
};

export const buscarDetalhesAvaliacao = async (avaliacaoId) => {
    const response = await axios.get(
        `${API_URL}/api/avaliacao-submissao/${avaliacaoId}/`,
        {
            withCredentials: true,
        }
    );
    return response.data;
};

export const criarAvaliacao = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    try {
        const response = await axios.post(
            `${API_URL}/api/avaliacao-submissao/`,
            dados,
            {
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Erro ao criar avaliação:', error.response?.data || error.message);
        throw error;
    }
};

export const atualizarAvaliacao = async (avaliacaoId, dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.put(
        `${API_URL}/api/avaliacao-submissao/${avaliacaoId}/`,
        dados,
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        }
    );
    return response.data;
};

export const deletarAvaliacao = async (avaliacaoId) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(
        `${API_URL}/api/avaliacao-submissao/${avaliacaoId}/`,
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        }
    );
    return response.data;
};
