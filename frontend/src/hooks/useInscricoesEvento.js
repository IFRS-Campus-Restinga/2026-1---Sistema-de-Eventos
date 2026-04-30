import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarInscricoesEventos } from '../services/inscricaoEventoService';

export default function useInscricoesEvento(eventoIdInicial = '') {
    const [eventoId, setEventoId] = useState(String(eventoIdInicial || ''));
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const carregarInscricoes = useCallback(async (idEvento = eventoId) => {
        if (!idEvento) {
            setInscricoes([]);
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const data = await listarInscricoesEventos(idEvento);
            setInscricoes(data);
            return data;
        } catch (erro) {
            setError(erro);
            setInscricoes([]);
            throw erro;
        } finally {
            setLoading(false);
        }
    }, [eventoId]);

    useEffect(() => {
        carregarInscricoes(eventoId);
    }, [eventoId, carregarInscricoes]);

    const presentes = useMemo(
        () => inscricoes.filter(i => Boolean(i.presente)),
        [inscricoes]
    );

    return {
        eventoId,
        setEventoId,
        inscricoes,
        presentes,
        loading,
        error,
        carregarInscricoes,
    };
}