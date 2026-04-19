import { API_URL } from '../config';
import axios from 'axios';

export const pegarTipoCampo = async () => {
    const response = await axios.get(`${API_URL}/api/tipo_campo/`);
    return response.data;
};
