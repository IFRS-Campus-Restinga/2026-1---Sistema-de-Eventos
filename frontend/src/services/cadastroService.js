import axios from 'axios';

// URL para Cadastro servidor Django
const API_URL = 'http://localhost:8001/api';

// Busca as listas de Níveis de Ensino e Áreas de Conhecimento do Django para Popular os Selects
export const buscarOpcoesCadastro = async () => {
    try {
        // GET para a rota que devolve os Enums/Choices
        const response = await axios.get(
            `${API_URL}/usuarios/cadastro-complementar/`,
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
            `${API_URL}/usuarios/cadastro-complementar/`,
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
        console.error('Erro ao salvar informações complementares:', erro);
        throw erro;
    }
};
