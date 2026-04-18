import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarUsers = async () => {
    const response = await axios.get(`${API_URL}/api/users/`, {
        withCredentials: true,
    });
    return response.data;
};

export const pegarUser = async (id) => {
    if (!id) return null;
    const response = await axios.get(`${API_URL}/api/users/${id}/`, {
        withCredentials: true,
    });
    return response.data;
};

export const atualizarGrupos = async (id, idGroups) => {
    if (!id) return null;
    // obter token CSRF e enviar no cabeçalho da requisição
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.patch(
        `${API_URL}/api/users/${id}/`,
        {
            group_id: idGroups,
        },
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );
    return response.data;
};

export const atualizarPermissoesUsers = async (id, idPerms) => {
    if (!id) return null;
    // obter token CSRF e enviar no cabeçalho da requisição
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.patch(
        `${API_URL}/api/users/${id}/`,
        {
            permission_id: idPerms,
        },
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );
    return response.data;
};
