import axios from 'axios';
import { API_URL } from '../config';

export const listarSubmissoes = async (params = {}) => {
    const response = await axios.get(`${API_URL}/api/submissoes/`, {
        params,
        withCredentials: true,
    });
    return response.data;
};

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
