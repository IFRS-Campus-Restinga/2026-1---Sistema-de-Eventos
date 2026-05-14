import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

const CAMPOS_ATRACAO = [
    'titulo',
    'resumo',
    'palavras_chave',
    'modalidade',
    'nivel_ensino',
    'area_conhecimento',
    'orientador',
    'sou_orientador',
    'anexo_pdf',
    'acessibilidade',
    'evento',
    'status',
    'data_hora_inicio',
    'data_hora_fim',
    'local_atracao',
    'equipe',
];

const montarPayloadAtracao = (dados) => {
    const payload = new FormData();

    CAMPOS_ATRACAO.forEach((key) => {
        if (!(key in dados)) {
            return;
        }

        if (key === 'equipe') {
            payload.append('equipe_json', JSON.stringify(dados[key]));
            return;
        }

        if (key === 'anexo_pdf') {
            const arquivo = dados[key];
            if (arquivo instanceof File || arquivo instanceof Blob) {
                payload.append(key, arquivo);
            }
            return;
        }

        if (dados[key] !== null && dados[key] !== undefined) {
            payload.append(key, dados[key]);
        }
    });

    return payload;
};

export const listarAtracoes = async () => {
    const response = await axios.get(`${API_URL}/api/atracoes/`);
    return response.data;
};

export const criarAtracao = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.post(`${API_URL}/api/atracoes/`, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
    });
    return response.data;
};

export const salvarRascunho = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.post(`${API_URL}/api/atracoes/`, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
    });
    return response.data;
};

export const editarAtracao = async (id, dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.put(`${API_URL}/api/atracoes/${id}/`, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
    });

    return response.data;
};

export const excluirAtracao = async (id) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    await axios.delete(`${API_URL}/api/atracoes/${id}/`, {
        headers: {
            'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
    });
};

export const buscarOpcoesAtracao = async () => {
    const response = await axios.get(`${API_URL}/api/atracoes/opcoes/`, {
        withCredentials: true,
    });
    return response.data;
};

export const buscarEventos = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/`, {
        withCredentials: true,
    });
    return response.data;
};

export const buscarUsuarios = async () => {
    const response = await axios.get(`${API_URL}/api/users/`, {
        withCredentials: true,
    });
    return response.data;
};
