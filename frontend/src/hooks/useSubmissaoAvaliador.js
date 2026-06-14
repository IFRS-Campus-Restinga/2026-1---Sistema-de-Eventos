import { useCallback, useState } from 'react';
import {
    associarAvaliadorSubmissao,
    removerAvaliadorSubmissao,
    listarAvaliadoresPorSubmissao,
} from '../services/submissaoAvaliadorService';

export function useSubmissaoAvaliador() {
    const [loading, setLoading] = useState(false);
    const [avaliadores, setAvaliadores] = useState([]);

    const carregarAvaliadores = useCallback(async (submissaoId) => {
        setLoading(true);
        try {
            const data = await listarAvaliadoresPorSubmissao(submissaoId);
            const lista = data?.avaliadores || [];
            setAvaliadores(lista);
            return lista;
        } catch (e) {
            console.error('Erro ao carregar avaliadores da submissão:', e);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const adicionarAvaliador = useCallback(async (submissaoId, perfilId) => {
        setLoading(true);
        try {
            const data = await associarAvaliadorSubmissao(
                submissaoId,
                perfilId,
            );
            return data;
        } catch (e) {
            console.error('Erro ao adicionar avaliador à submissão:', e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const retirarAvaliador = useCallback(async (submissaoId, perfilId) => {
        setLoading(true);
        try {
            const data = await removerAvaliadorSubmissao(submissaoId, perfilId);
            return data;
        } catch (e) {
            console.error('Erro ao remover avaliador da submissão:', e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        avaliadores,
        carregarAvaliadores,
        adicionarAvaliador,
        retirarAvaliador,
    };
}

export default useSubmissaoAvaliador;
