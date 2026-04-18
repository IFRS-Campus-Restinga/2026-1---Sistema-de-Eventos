import { API_URL } from '../config';
import axios from 'axios';

// GET para popoular Selects do fomulário, Enuns(Nível de Ensino e Área do Conhecimento)
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

// POST com Token
export const salvarInformacoesComplementares = async (dados, tokenCsrf) => {
    try {
        // Acessamos o token de acesso do localStorage para autenticar a requisição
        const accessToken = localStorage.getItem('access_token');

        const response = await axios.post(
            `${API_URL}/api/usuarios/cadastro-complementar/`,
            dados,
            {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': tokenCsrf,
                    // Autorização do token no request
                    Authorization: `Bearer ${accessToken}`,
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
