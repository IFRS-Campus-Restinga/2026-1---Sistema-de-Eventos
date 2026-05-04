import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const listarInscricoesAtracoes = async (atracaoId) => {
    const response = await axios.get(`${API_URL}/api/inscricoes_atracoes/`, {
        withCredentials: true,
    });

    if (!atracaoId) {
        return response.data;
    }

    return response.data.filter(
        (item) => Number(item.atracao_id) === Number(atracaoId),
    );
};

export const criarInscricaoAtracao = async (dados) => {
    if (!dados?.perfil_id || !dados?.atracao_id) {
        throw new Error('perfil_id e atracao_id são obrigatórios');
    }

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.post(
        `${API_URL}/api/inscricoes_atracoes/`,
        dados,
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};
