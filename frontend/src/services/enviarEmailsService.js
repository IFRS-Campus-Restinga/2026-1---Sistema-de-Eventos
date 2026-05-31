import axios from 'axios';
import { API_URL } from '../config';

export const enviarEmailsService = {
    buscarAtracoesPorEvento: async (eventoId) => {
        const resposta = await axios.get(
            `${API_URL}/api/atracoes/?evento=${eventoId}`,
            {
                withCredentials: true,
            },
        );
        return resposta.data;
    },

    buscarTemplatesSistema: async () => {
        const resposta = await axios.get(
            `${API_URL}/emails/templates_sistema/`,
            {
                withCredentials: true,
            },
        );
        return resposta.data;
    },

    buscarTemplatesPerfil: async () => {
        const resposta = await axios.get(
            `${API_URL}/emails/templates_perfil/`,
            {
                withCredentials: true,
            },
        );
        return resposta.data;
    },

    enviarComunicado: async (eventoId, payload, csrfToken) => {
        const resposta = await axios.post(
            `${API_URL}/api/eventos/${eventoId}/enviar_emails/`,
            payload,
            {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            },
        );
        return resposta.data;
    },
};
