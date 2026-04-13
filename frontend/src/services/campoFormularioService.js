import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const pegarCampoFormulario = async () => {
    const response = await axios.get(`${API_URL}/api/campo_formulario/`);
    return response.data;
};
