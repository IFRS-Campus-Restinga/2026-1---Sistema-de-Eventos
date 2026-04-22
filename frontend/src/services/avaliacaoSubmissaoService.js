import axios from 'axios';
import { API_URL } from '../config';
import { pegarTokenCsrf } from './csrfService';

const BASE = `${API_URL}/api/avaliacoes_submissao/`;

export const listarAvaliacoesSubmissao = async (atracaoId) => {
    const url = atracaoId ? `${BASE}?atracao=${atracaoId}` : BASE;
    const response = await axios.get(url, { withCredentials: true });
    return response.data;
};

export const buscarAvaliacaoSubmissao = async (id) => {
    const response = await axios.get(`${BASE}${id}/`, { withCredentials: true });
    return response.data;
};

export const criarAvaliacaoSubmissao = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.post(BASE, dados, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
    });
    return response.data;
};

export const atualizarAvaliacaoSubmissao = async (id, dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.put(`${BASE}${id}/`, dados, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
    });
    return response.data;
};

export const buscarAtracaoDetalhe = async (id) => {
    const response = await axios.get(`${API_URL}/api/atracoes/${id}/`, {
        withCredentials: true,
    });
    return response.data;
};

export const buscarCriteriosPorModalidade = async (modalidadeId) => {
    const response = await axios.get(
        `${API_URL}/api/criterio_avaliacao/?modalidade=${modalidadeId}`,
        { withCredentials: true },
    );
    return response.data;
};
