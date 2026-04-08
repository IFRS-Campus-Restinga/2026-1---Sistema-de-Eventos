import { API_URL } from '../config';
import axios from 'axios';

export const pegarPermissoes = async () => {
    const response = await axios.get(`${API_URL}/api/permissoes/`);
    const data = response.data;
    return data;
};
