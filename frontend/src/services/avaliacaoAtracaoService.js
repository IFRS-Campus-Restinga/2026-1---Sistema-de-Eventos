import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

// Pega critérios e filtra por modalidade no client-side
export const pegarCriteriosPorModalidade = async (modalidadeId) => {
    const response = await axios.get(`${API_URL}/api/criterio_avaliacao/`, {
        withCredentials: true,
    });
    const criterios = response.data || [];
    if (!modalidadeId) return criterios;
    return criterios.filter((c) => c.modalidade === modalidadeId);
};

export const criarAvaliacaoAtracaoComItens = async (avaliacaoDados, itens) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    // criar avaliacao
    const respAvaliacao = await axios.post(
        `${API_URL}/api/avaliacao_atracao/`,
        avaliacaoDados,
        {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );

    const avaliacao = respAvaliacao.data;

    // criar itens associados
    const itensCriados = [];
    for (const it of itens) {
        const payload = {
            nota: it.nota,
            criterio_avaliacao: it.criterio_avaliacao,
            avaliacao_atracao: avaliacao.id,
        };
        const respItem = await axios.post(
            `${API_URL}/api/item_avaliacao_atracao/`,
            payload,
            {
                headers: { 'X-CSRFToken': csrfToken },
                withCredentials: true,
            },
        );
        itensCriados.push(respItem.data);
    }

    return { avaliacao, itens: itensCriados };
};

export const listarAvaliacoesAtracao = async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/avaliacao_atracao/`, {
        params,
        withCredentials: true,
    });
    return response.data;
};

export const listarItensAvaliacaoAtracao = async (avaliacaoId) => {
    const response = await axios.get(`${API_URL}/api/item_avaliacao_atracao/`, {
        params: { avaliacao_atracao: avaliacaoId },
        withCredentials: true,
    });
    return response.data;
};

export default {
    pegarCriteriosPorModalidade,
    criarAvaliacaoAtracaoComItens,
    listarAvaliacoesAtracao,
    listarItensAvaliacaoAtracao,
};
