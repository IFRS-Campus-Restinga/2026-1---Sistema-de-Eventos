import axios from 'axios';
import { API_URL } from '../config';

export const listarMeusEventosAvaliador = async () => {
    const response = await axios.get(
        `${API_URL}/api/eventos/minhas_avaliacoes/`,
        {
            withCredentials: true,
        },
    );
    return response.data;
};

export const listarMinhasAtracoesParaEvento = async (eventoId) => {
    const response = await axios.get(
        `${API_URL}/api/eventos/${eventoId}/minhas_avaliacoes/atracoes/`,
        {
            withCredentials: true,
        },
    );
    return response.data;
};

export default { listarMeusEventosAvaliador, listarMinhasAtracoesParaEvento };
