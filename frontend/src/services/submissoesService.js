import axios from 'axios';
import { API_URL } from '../config';
import { pegarTokenCsrf } from './csrfService';

const CAMPOS_EDICAO_SUBMISSAO = [
    'titulo',
    'resumo',
    'palavras_chave',
    'modalidade',
    'nivel_ensino',
    'area_conhecimento',
    'orientador',
    'sou_orientador',
    'acessibilidade',
    'sugestao_vagas',
    'status',
    'status_submissao',
];

const montarPayloadEdicaoSubmissao = (dados = {}) => {
    const valorNormalizado = (campo, valorBruto) => {
        if (valorBruto === undefined) return undefined;

        if (campo === 'sugestao_vagas') {
            if (valorBruto === '' || valorBruto === null) return null;
            const numero = Number(valorBruto);
            return Number.isNaN(numero) ? undefined : numero;
        }

        if (campo === 'modalidade' || campo === 'orientador') {
            if (valorBruto === '' || valorBruto === null) return null;
            return valorBruto;
        }

        if (campo === 'sou_orientador' || campo === 'acessibilidade') {
            return Boolean(valorBruto);
        }

        return valorBruto;
    };

    const payload = {};
    CAMPOS_EDICAO_SUBMISSAO.forEach((campo) => {
        const normalizado = valorNormalizado(campo, dados?.[campo]);
        if (normalizado !== undefined) {
            payload[campo] = normalizado;
        }
    });

    const statusNormalizado =
        payload.status_submissao ?? payload.status ?? dados?.status_submissao ?? dados?.status;
    if (statusNormalizado !== undefined && statusNormalizado !== null) {
        const statusFormatado = String(statusNormalizado).trim().toUpperCase();
        if (statusFormatado) {
            payload.status_submissao = statusFormatado;
        } else {
            delete payload.status_submissao;
        }
    }
    delete payload.status;

    return payload;
};

export const listarSubmissoes = async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/submissoes/`, {
        params,
        withCredentials: true,
    });
    return response.data;
};

export const homologarSubmissao = async (submissaoId, dados = {}) => {
    const payload = montarPayloadEdicaoSubmissao(dados);
    const response = await axios.post(
        `${API_URL}/api/submissoes/${submissaoId}/homologar/`,
        payload,
        { withCredentials: true },
    );
    return response.data;
};

export const editarSubmissao = async (submissaoId, dados = {}) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const payload = montarPayloadEdicaoSubmissao(dados);

    const response = await axios.put(
        `${API_URL}/api/submissoes/${submissaoId}/`,
        payload,
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );
    return response.data;
};

export const reprovarSubmissao = async (submissaoId, dados = {}) => {
    const payload = montarPayloadEdicaoSubmissao(dados);
    const response = await axios.post(
        `${API_URL}/api/submissoes/${submissaoId}/reprovar/`,
        payload,
        { withCredentials: true },
    );
    return response.data;
};

export const excluirSubmissao = async (submissaoId) => {
    await axios.delete(`${API_URL}/api/submissoes/${submissaoId}/`, {
        withCredentials: true,
    });
};
