import axios from 'axios';
import { API_URL } from '../config';

export const pegarAreasConhecimento = async () => {
    const response = await axios.get(`${API_URL}/api/areas_conhecimento/`);
    return response.data;
};
