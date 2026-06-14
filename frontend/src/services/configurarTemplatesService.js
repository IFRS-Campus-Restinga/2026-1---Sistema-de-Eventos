import axios from 'axios';
import { API_URL } from '../config';

export const configurarTemplatesService = {
    buscarTemplatesSistema: async () => {
        console.log('Mock service: buscarTemplatesSistema chamado.');
        return [];
    },

    // --- FOCO: FUNÇÃO DE LISTAR (GET) ---
    buscarTemplatesPerfil: async () => {
        console.log('Service: buscarTemplatesPerfil disparando GET...');

        const resposta = await axios.get(
            `${API_URL}/emails/templates_perfil/`,
            {
                // Garante que os cookies de sessão (onde está sua autenticação) sejam enviados
                withCredentials: true,
            },
        );

        // DRF com paginação retorna os dados dentro de 'results'.
        // DRF sem paginação retorna a lista (array) direto na data.
        // Essa linha cobre ambos os cenários para não quebrar seu front:
        return resposta.data.results || resposta.data;
    },

    // --- FOCO: FUNÇÃO DE CRIAR (POST) ---
    criarTemplatePerfil: async (payload, csrfToken) => {
        const resposta = await axios.post(
            `${API_URL}/emails/templates_perfil/`,
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

    atualizarTemplatePerfil: async (templateId, payload, csrfToken) => {
        console.log(
            'Service: atualizarTemplatePerfil disparando PATCH...',
            templateId,
        );

        const resposta = await axios.patch(
            `${API_URL}/emails/templates_perfil/${templateId}/`,
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

    deletarTemplatePerfil: async (templateId, csrfToken) => {
        console.log(
            'Service: deletarTemplatePerfil disparando DELETE...',
            templateId,
        );

        const resposta = await axios.delete(
            `${API_URL}/emails/templates_perfil/${templateId}/`,
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
