import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const listarInscricoesEventos = async (eventoId) => {
    const response = await axios.get(`${API_URL}/api/inscricoes_eventos/`, {
        withCredentials: true,
    });

    if (!eventoId) {
        return response.data;
    }

    return response.data.filter(
        (item) => Number(item.evento_id) === Number(eventoId),
    );
};

export const listarMinhasInscricoesEventos = async () => {
    const response = await axios.get(
        `${API_URL}/api/inscricoes_eventos/minhas/`,
        {
            withCredentials: true,
        },
    );

    return response.data;
};

export const criarInscricaoEvento = async (dados) => {
    if (!dados?.perfil_id || !dados?.evento_id) {
        throw new Error('perfil_id e evento_id são obrigatórios');
    }

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.post(
        `${API_URL}/api/inscricoes_eventos/`,
        dados,
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};

export const cancelarInscricaoEvento = async (inscricaoId) => {
    if (!inscricaoId) throw new Error('inscricaoId é obrigatório');

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.post(
        `${API_URL}/api/inscricoes_eventos/${inscricaoId}/cancelar/`,
        {},
        {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );

    return response.data;
};

export const marcarPresencaInscricaoEvento = async (inscricao) => {
    if (!inscricao?.id) throw new Error('id da inscrição é obrigatório');

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = {
        status: inscricao.status,
        perfil_id: inscricao.perfil_id,
        evento_id: inscricao.evento_id,
        presente: true,
    };

    const response = await axios.put(
        `${API_URL}/api/inscricoes_eventos/${inscricao.id}/`,
        payload,
        {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );

    return response.data;
};

export const retirarPresencaInscricaoEvento = async (inscricao) => {
    if (!inscricao?.id) throw new Error('id da inscrição é obrigatório');

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = {
        status: inscricao.status,
        perfil_id: inscricao.perfil_id,
        evento_id: inscricao.evento_id,
        presente: false,
    };

    const response = await axios.put(
        `${API_URL}/api/inscricoes_eventos/${inscricao.id}/`,
        payload,
        {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );

    return response.data;
};
