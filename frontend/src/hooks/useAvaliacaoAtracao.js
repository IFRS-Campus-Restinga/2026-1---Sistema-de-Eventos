import { useCallback, useState } from 'react';
import {
    pegarCriteriosPorModalidade,
    criarAvaliacaoAtracaoComItens,
} from '../services/avaliacaoAtracaoService';

export function useAvaliacaoAtracao() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [criterios, setCriterios] = useState([]);

    const carregarCriterios = useCallback(async (modalidadeId) => {
        setLoading(true);
        try {
            const data = await pegarCriteriosPorModalidade(modalidadeId);
            setCriterios(Array.isArray(data) ? data : []);
            return data;
        } catch (e) {
            console.error('erro ao carregar criterios:', e);
            setCriterios([]);
            setMessage('Erro ao carregar critérios');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const criarAvaliacaoComItens = useCallback(
        async (avaliacaoDados, itens) => {
            setLoading(true);
            setMessage('');
            try {
                const resp = await criarAvaliacaoAtracaoComItens(
                    avaliacaoDados,
                    itens,
                );
                setMessage('Avaliação criada com sucesso');
                return resp;
            } catch (e) {
                console.error(
                    'erro ao criar avaliacao atracao:',
                    e.response || e.message,
                );
                const errMsg =
                    e.response?.data?.detail ||
                    e.response?.data ||
                    e.message ||
                    'Erro ao criar avaliação';
                setMessage(errMsg);
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        loading,
        message,
        criterios,
        carregarCriterios,
        criarAvaliacaoComItens,
        setMessage,
    };
}

export default useAvaliacaoAtracao;
