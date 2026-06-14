import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

export const pegarCriteriosSubmissaoPorModalidade = async (modalidadeId) => {
    const response = await axios.get(
        `${API_URL}/api/criterio_avaliacao_submissao/`,
        {
            withCredentials: true,
        },
    );
    const criterios = response.data || [];
    if (!modalidadeId) return criterios;
    return criterios.filter((c) => c.modalidade === modalidadeId);
};

export const criarAvaliacaoSubmissaoComItens = async (
    avaliacaoDados,
    itens,
) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    // 1. Criar cabeçalho da avaliação da submissão
    const respAvaliacao = await axios.post(
        `${API_URL}/api/avaliacao_submissao/`,
        avaliacaoDados,
        {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );
    const avaliacao = respAvaliacao.data;

    // 2. Criar itens de avaliação associados (notas por critério)
    const itensCriados = [];
    for (const it of itens) {
        const payload = {
            nota: it.nota,
            criterio_avaliacao: it.criterio_avaliacao,
            avaliacao_submissao: avaliacao.id,
        };
        const respItem = await axios.post(
            `${API_URL}/api/item_avaliacao_submissao/`,
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

export const listarAvaliacoesSubmissao = async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/avaliacao_submissao/`, {
        params,
        withCredentials: true,
    });
    return response.data;
};

export const listarItensAvaliacaoSubmissao = async (avaliacaoId) => {
    const response = await axios.get(
        `${API_URL}/api/item_avaliacao_submissao/`,
        {
            params: { avaliacao_submissao: avaliacaoId },
            withCredentials: true,
        },
    );
    return response.data;
};

export default {
    pegarCriteriosSubmissaoPorModalidade,
    criarAvaliacaoSubmissaoComItens,
    listarAvaliacoesSubmissao,
    listarItensAvaliacaoSubmissao,
};
