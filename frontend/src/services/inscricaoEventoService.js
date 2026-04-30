import { API_URL } from '../config';
import axios from 'axios';

export const listarInscricoesEventos = async (eventoId) => {
    const response = await axios.get(`${API_URL}/api/inscricoes_eventos/`, {
        withCredentials: true,
    });

    if (!eventoId) {
        return response.data;
    }

    return response.data.filter(item => Number(item.evento_id) === Number(eventoId));
};