import { API_URL } from '../config';
import axios from 'axios';

export const buscarOpcoesCadastro = async () => {
    const response = await axios.get(
        `${API_URL}/api/usuarios/cadastro-complementar/`,
        {
            withCredentials: true,
        },
    );

    return response.data;
};

export const salvarInformacoesComplementares = async (dados, tokenCsrf) => {
    const response = await axios.post(
        `${API_URL}/api/usuarios/cadastro-complementar/`,
        dados,
        {
            withCredentials: true,
            headers: {
                'X-CSRFToken': tokenCsrf,
            },
        },
    );

    return response.data;
};
