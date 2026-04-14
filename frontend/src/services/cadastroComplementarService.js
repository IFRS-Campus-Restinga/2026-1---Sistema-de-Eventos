import { API_URL } from '../config';
import axios from 'axios';

// Busca as listas de Níveis de Ensino e Áreas de Conhecimento do Django para Entregar ao Hook
export const buscarOpcoesCadastro = async () => {
    try {
        // GET para a rota que devolve os Enums/Choices
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

// Envia os dados complementares do aluno para o Django
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
        // O ponto de interrogação (?) evita que o React quebre caso o response seja undefined (ex: servidor fora do ar)
        console.error('Status do Erro:', erro.response?.status);
        console.error('Mensagem do Django:', erro.response?.data);
        throw erro;
    }
};
