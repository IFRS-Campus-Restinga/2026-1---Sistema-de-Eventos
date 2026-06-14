import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

export const listarAvaliadoresPorSubmissao = async (submissaoId) => {
    const response = await axios.get(
        `${API_URL}/api/submissoes/${submissaoId}/avaliador/`,
        { withCredentials: true },
    );
    return response.data;
};

export const associarAvaliadorSubmissao = async (submissaoId, perfilId) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.patch(
        `${API_URL}/api/submissoes/${submissaoId}/avaliador/`,
        { perfil_id: perfilId },
        {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );
    return response.data;
};

export const removerAvaliadorSubmissao = async (submissaoId, perfilId) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(
        `${API_URL}/api/submissoes/${submissaoId}/avaliador/`,
        {
            data: { perfil_id: perfilId },
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );
    return response.data;
};

export default {
    listarAvaliadoresPorSubmissao,
    associarAvaliadorSubmissao,
    removerAvaliadorSubmissao,
};
