import axios from 'axios';
import { API_URL } from '../config';

export const homologarSubmissao = async (submissaoId) => {
    const response = await axios.post(
        `${API_URL}/api/submissoes/${submissaoId}/homologar/`,
        {},
        { withCredentials: true },
    );
    return response.data;
};

export const reprovarSubmissao = async (submissaoId) => {
    const response = await axios.post(
        `${API_URL}/api/submissoes/${submissaoId}/reprovar/`,
        {},
        { withCredentials: true },
    );
    return response.data;
};
