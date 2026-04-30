import { API_URL } from '../config';
import axios from 'axios';

export const listarInscricoesEventos = async () => {
    const response = await axios.get(`${API_URL}/api/inscricoes_eventos/`, {
        withCredentials: true,
    });

    return response.data;
};