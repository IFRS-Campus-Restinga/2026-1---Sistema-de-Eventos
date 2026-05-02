import axios from 'axios';
import { API_URL } from '../config';

export const pegarSetores = async () => {
    const response = await axios.get(`${API_URL}/api/setores/`);
    return response.data;
};
