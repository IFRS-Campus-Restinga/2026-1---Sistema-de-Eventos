import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

export const listarAvaliadoresPorAtracao = async (atracaoId) => {
    const response = await axios.get(
        `${API_URL}/api/atracoes/${atracaoId}/avaliador/`,
        {
            withCredentials: true,
        },
    );
    return response.data;
};

export const associarAvaliadorAtracao = async (atracaoId, perfilId) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.patch(
        `${API_URL}/api/atracoes/${atracaoId}/avaliador/`,
        { perfil_id: perfilId },
        {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );

    return response.data;
};

export const removerAvaliadorAtracao = async (atracaoId, perfilId) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(
        `${API_URL}/api/atracoes/${atracaoId}/avaliador/`,
        {
            data: { perfil_id: perfilId },
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
        },
    );

    return response.data;
};

export default {
    listarAvaliadoresPorAtracao,
    associarAvaliadorAtracao,
    removerAvaliadorAtracao,
};
