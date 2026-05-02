import { API_URL } from '../config';
import axios from 'axios';

export const pegarTipoEtapa = async () => {
    const response = await axios.get(`${API_URL}/api/tipo_etapa/`);
    return response.data;
};
