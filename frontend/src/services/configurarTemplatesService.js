import axios from 'axios';
import { API_URL } from '../config';

export const configurarTemplatesService = {
    buscarTemplatesSistema: async () => {
        console.log('Mock service: buscarTemplatesSistema chamado.');
        return { results: [] };
    },

    buscarTemplatesPerfil: async () => {
        console.log('Mock service: buscarTemplatesPerfil chamado.');
        return { results: [] };
    },

    // --- FOCO: FUNÇÃO DE CRIAR ---
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
        console.log('Mock service: atualizarTemplatePerfil chamado.', {
            templateId,
            payload,
        });
        return { detail: 'Mock de atualização executado.' };
    },

    deletarTemplatePerfil: async (templateId, csrfToken) => {
        console.log('Mock service: deletarTemplatePerfil chamado.', templateId);
        return { detail: 'Mock de exclusão executado.' };
    },
};
