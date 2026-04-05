import { useState, useEffect } from 'react';
import {
    salvarInformacoesComplementares,
    buscarOpcoesCadastro,
} from '../services/cadastroService';

export function useCadastro() {
    const [carregando, setCarregando] = useState(false);
    const [opcoes, setOpcoes] = useState({ niveis: [], areas: [] }); // Onde guardaremos os Enums

    // Busca os dados do Django ao carregar
    useEffect(() => {
        async function carregarEnums() {
            try {
                const dados = await buscarOpcoesCadastro();
                console.log('Dados que chegaram do Django:', dados);
                setOpcoes(dados);
            } catch (e) {
                console.error('Erro ao carregar opções do Django', e);
            }
        }
        carregarEnums();
    }, []);

    // Função para executar o salvamento dos dados complementares
    const executarSalvamento = async (dados, token) => {
        setCarregando(true);
        try {
            await salvarInformacoesComplementares(dados, token);
            alert('Salvo com sucesso!');
        } catch (e) {
            alert('Erro ao salvar.');
        } finally {
            setCarregando(false);
        }
    };

    return { executarSalvamento, carregando, opcoes };
}
