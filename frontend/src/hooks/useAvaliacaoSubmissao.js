import { useCallback, useState } from 'react';
import {
    pegarCriteriosSubmissaoPorModalidade,
    criarAvaliacaoSubmissaoComItens,
} from '../services/avaliacaoSubmissaoService';

export function useAvaliacaoSubmissao() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [criterios, setCriterios] = useState([]);

    const carregarCriterios = useCallback(async (modalidadeId) => {
        setLoading(true);
        try {
            const data =
                await pegarCriteriosSubmissaoPorModalidade(modalidadeId);
            setCriterios(Array.isArray(data) ? data : []);
            return data;
        } catch (e) {
            console.error('Erro ao carregar critérios de submissão:', e);
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
                const resp = await criarAvaliacaoSubmissaoComItens(
                    avaliacaoDados,
                    itens,
                );
                setMessage('Avaliação de submissão salva com sucesso');
                return resp;
            } catch (e) {
                console.error(
                    'Erro ao salvar avaliação de submissão:',
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

export default useAvaliacaoSubmissao;
