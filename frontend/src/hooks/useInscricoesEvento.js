import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarInscricoesEventos } from '../services/inscricaoEventoService';

const paraLista = (data) =>
    Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

const normalizarEventoId = (valor) => String(valor ?? '').trim();

export default function useInscricoesEvento(eventoIdInicial = '') {
    const [eventoId, setEventoId] = useState(normalizarEventoId(eventoIdInicial));
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const carregarInscricoes = useCallback(async (eventoIdAlvo = eventoId) => {
        const eventoIdNormalizado = normalizarEventoId(eventoIdAlvo);

        if (!eventoIdNormalizado) {
            setInscricoes([]);
            setError(null);
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const data = await listarInscricoesEventos();
            const lista = paraLista(data).filter(
                (item) => normalizarEventoId(item.evento_id) === eventoIdNormalizado,
            );
            setInscricoes(lista);
            return lista;
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
    }, [carregarInscricoes, eventoId]);

    const presentes = useMemo(
        () => inscricoes.filter((inscricao) => Boolean(inscricao.presente)),
        [inscricoes],
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