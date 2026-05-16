import { useCallback, useState } from 'react';
import {
    listarAvaliadoresPorAtracao,
    associarAvaliadorAtracao,
    removerAvaliadorAtracao,
} from '../services/atracaoAvaliadorService';

export function useAtracaoAvaliador() {
    const [avaliadores, setAvaliadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    const carregarAvaliadores = useCallback(async (atracaoId) => {
        if (!atracaoId) return setAvaliadores([]);
        setLoading(true);
        try {
            const data = await listarAvaliadoresPorAtracao(atracaoId);
            setAvaliadores(data?.avaliadores || []);
        } catch (e) {
            console.error('erro ao listar avaliadores:', e);
            setErro('Erro ao carregar avaliadores');
            setAvaliadores([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const adicionarAvaliador = useCallback(async (atracaoId, perfilId) => {
        setLoading(true);
        setErro(null);
        try {
            const resp = await associarAvaliadorAtracao(atracaoId, perfilId);
            setAvaliadores(resp.avaliadores || []);
            return resp;
        } catch (e) {
            console.error(
                'erro ao associar avaliador:',
                e.response || e.message,
            );
            setErro(e.response?.data || 'Erro ao associar avaliador');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const retirarAvaliador = useCallback(async (atracaoId, perfilId) => {
        setLoading(true);
        setErro(null);
        try {
            const resp = await removerAvaliadorAtracao(atracaoId, perfilId);
            setAvaliadores(resp.avaliadores || []);
            return resp;
        } catch (e) {
            console.error(
                'erro ao remover avaliador:',
                e.response || e.message,
            );
            setErro(e.response?.data || 'Erro ao remover avaliador');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        avaliadores,
        loading,
        erro,
        carregarAvaliadores,
        adicionarAvaliador,
        retirarAvaliador,
    };
}

export default useAtracaoAvaliador;
