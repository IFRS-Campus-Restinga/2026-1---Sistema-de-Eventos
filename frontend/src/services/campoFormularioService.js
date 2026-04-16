import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarCampoFormulario = async () => {
    const response = await axios.get(`${API_URL}/api/campo_formulario/`);
    return response.data;
};

export const criarCampoFormulario = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.post(
        `${API_URL}/api/campo_formulario/`,
        dados,
        {
            headers: { 'X-CSRFToken': csrfToken },
        },
    );
    return response.data;
};

export const atualizarCampoFormulario = async (id, dados) => {
    if (!id) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.put(
        `${API_URL}/api/campo_formulario/${id}/`,
        dados,
        {
            headers: { 'X-CSRFToken': csrfToken },
        },
    );

    return response.data;
};

export const deletarCampoFormulario = async (id) => {
    if (!id) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.delete(
        `${API_URL}/api/campo_formulario/${id}/`,
        {
            headers: { 'X-CSRFToken': csrfToken },
        },
    );

    return response.data;
};

export const pegarOptionsCampoFormulario = async () => {
    const response = await axios.options(`${API_URL}/api/campo_formulario/`);
    return response.data;
};
