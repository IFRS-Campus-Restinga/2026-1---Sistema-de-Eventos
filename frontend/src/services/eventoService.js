import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const listarEventos = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/`);
    return response.data;
};

export const criarEvento = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.post(`${API_URL}/api/eventos/`, dados, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
    });
    return response.data;
};

export const buscarOpcoesFormulario = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/opcoes/`);
    return response.data;
};

export const deletarEvento = async (eventoId) => {
    if (!eventoId) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(
        `${API_URL}/api/eventos/${eventoId}/delete/`,
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            
        },
    );

    return response.data;
};

export const buscarEventoPorId = async (id) => {
    if (!id) return null;
    const response = await axios.get(`${API_URL}/api/eventos/${id}/`, {
    });
    return response.data;
};

export const atualizarEvento = async (id, dados) => {
    if (!id) return null;

    try {
        const csrfData = await pegarTokenCsrf();
        const csrfToken = csrfData?.csrfToken || '';

        const response = await axios.put(`${API_URL}/api/eventos/${id}/update/`, dados, {
            headers: { 'X-CSRFToken': csrfToken },
        });

        return response.data;
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};

export const definirCoordenadorEvento = async (eventoId, userId) => {
    if (!eventoId || !userId) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.patch(
        `${API_URL}/api/eventos/${eventoId}/coordenador/`,
        { user_id: userId },
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};

export const removerCoordenadorEvento = async (eventoId, userId) => {
    if (!eventoId || !userId) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(
        `${API_URL}/api/eventos/${eventoId}/coordenador/`,
        {
            data: { user_id: userId },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};

export const listarCoordenadoresEvento = async (eventoId) => {
    if (!eventoId) return { coordenadores: [] };

    const response = await axios.get(
        `${API_URL}/api/eventos/${eventoId}/coordenador/`,
        {
            withCredentials: true,
        },
    );

    return response.data;
};

export const definirOrganizadorEvento = async (eventoId, userId) => {
    if (!eventoId || !userId) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.patch(
        `${API_URL}/api/eventos/${eventoId}/organizador/`,
        { user_id: userId },
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};

export const removerOrganizadorEvento = async (eventoId, userId) => {
    if (!eventoId || !userId) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(
        `${API_URL}/api/eventos/${eventoId}/organizador/`,
        {
            data: { user_id: userId },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};

export const listarOrganizadoresEvento = async (eventoId) => {
    if (!eventoId) return { organizadores: [] };

    const response = await axios.get(
        `${API_URL}/api/eventos/${eventoId}/organizador/`,
        {
            withCredentials: true,
        },
    );

    return response.data;
};