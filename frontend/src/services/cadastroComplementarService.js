import { API_URL } from '../config';
import axios from 'axios';

export const buscarOpcoesCadastro = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/api/usuarios/cadastro-complementar/`,
            {
                withCredentials: true,
            },
        );

        return response.data;
    } catch (erro) {
        console.error('Erro ao buscar opções de cadastro:', erro);
        throw erro;
    }
};

export const salvarInformacoesComplementares = async (dados, tokenCsrf) => {
    try {
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
    } catch (erro) {
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};
