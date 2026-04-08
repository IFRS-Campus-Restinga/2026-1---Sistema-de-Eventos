import { API_URL } from '../config';
import axios from 'axios';

export const pegarTokenCsrf = async () => {
    const response = await axios.get(`${API_URL}/api/csrf/`, {
        withCredentials: true,
    });
    const data = response.data;
    return data;
};
