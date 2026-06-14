import axios from 'axios';
import { API_URL } from '../config';

export const enviarEmailsService = {
    // Busca as atrações para preencher a tela
    buscarAtracoesPorEvento: async (eventoId) => {
        const resposta = await axios.get(
            `${API_URL}/api/atracoes/?evento=${eventoId}`,
            {
                withCredentials: true,
            },
        );
        return resposta.data;
    },

    // Envia o formulário com os e-mails e os IDs selecionados
    enviarComunicado: async (eventoId, payload, csrfToken) => {
        const resposta = await axios.post(
            `${API_URL}/api/eventos/${eventoId}/enviar_emails/`, // Ajuste a URL se o seu backend for diferente
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
};
