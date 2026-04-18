import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarGrupos = async () => {
    const response = await axios.get(`${API_URL}/api/grupos/`, {
        withCredentials: true,
    });
    return response.data;
};

export const pegarGrupo = async (id) => {
    if (!id) return null;
    const response = await axios.get(`${API_URL}/api/grupos/${id}/`, {
        withCredentials: true,
    });
    return response.data;
};

export const atualizarPermissoes = async (id, idPerms) => {
    if (!id) return null;
    // obter token CSRF e enviar no cabeçalho da requisição
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.patch(
        `${API_URL}/api/grupos/${id}/`,
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

export const atualizarUsuarios = async (id, idUsers) => {
    if (!id) return null;
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.patch(
        `${API_URL}/api/grupos/${id}/`,
        {
            user_id: idUsers,
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
