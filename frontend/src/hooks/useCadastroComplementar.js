import { useState, useEffect } from 'react';
import {
    salvarInformacoesComplementares,
    buscarOpcoesCadastro,
} from '../services/cadastroComplementarService';

export function useCadastroComplementar() {
    const [carregando, setCarregando] = useState(false);
    const [opcoes, setOpcoes] = useState({ niveis: [], areas: [] }); // Onde guardaremos os Enums
    const [notificacao, setNotificacao] = useState({
        mensagem: '',
        variacao: '',
    });

    // Busca os enums para preencher as opções do Select
    useEffect(() => {
        async function carregarEnums() {
            try {
                const dados = await buscarOpcoesCadastro();
                console.log('Enuns vindo do Django:', dados);

                // Verifica se o objeto retornou e se as propriedades existem.
                // Se sim, salva o objeto. Se não, salva o formato inicial vazio.
                if (dados && dados.areas && dados.niveis) {
                    setOpcoes(dados);
                } else {
                    setOpcoes({ niveis: [], areas: [] });
                }
            } catch (e) {
                console.error('Erro ao carregar opções do Django', e);
                setOpcoes({ niveis: [], areas: [] });
            }
        }
        carregarEnums();
    }, []);

    const executarSalvamento = async (dados, token) => {
        setCarregando(true);
        // Limpa notificação anterior antes de começar
        setNotificacao({ mensagem: '', variacao: '' });

        try {
            await salvarInformacoesComplementares(dados, token);
            // Substituímos o alert por:
            setNotificacao({
                mensagem: 'Salvo com sucesso!',
                variacao: 'success',
            });
        } catch (e) {
            // Substituímos o alert por:
            setNotificacao({ mensagem: 'Erro ao salvar.', variacao: 'danger' });
        } finally {
            setCarregando(false);
        }
    };

    return { executarSalvamento, carregando, opcoes, notificacao };
}
