import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { validarComOptions } from './optionValidadorService';

export const pegarModalidades = async () => {
    const response = await axios.get(`${API_URL}/api/modalidades/`);
    return response.data;
};

export const criarModalidade = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';
    const response = await axios.post(`${API_URL}/api/modalidades/`, dados, {
        headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
};

export const pegarOptionsModalidades = async () => {
    const response = await axios.options(`${API_URL}/api/modalidades/`);
    return response.data;
};

export const validarModalidade = async (payload, method = 'POST') =>
    validarComOptions('/api/modalidades/', payload, method);

export const validarCampoFormulario = async (payload, method = 'POST') =>
    validarComOptions('/api/campo_formulario/', payload, method);

export const validarCriterioAvaliacao = async (payload, method = 'POST') =>
    validarComOptions('/api/criterio_avaliacao/', payload, method);
