import { useCallback, useEffect, useState } from 'react';
import {
    listarMeusEventosAvaliador,
    listarMinhasAtracoesParaEvento,
} from '../services/meusAvaliacoesService';

export function useMeusAvaliacoes() {
    const [eventos, setEventos] = useState([]);
    const [atracoes, setAtracoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    const carregarMeusEventos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listarMeusEventosAvaliador();
            setEventos(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('erro ao listar meus eventos avaliador:', e);
            setErro('Erro ao carregar eventos');
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarAtracoesParaEvento = useCallback(async (eventoId) => {
        if (!eventoId) return setAtracoes([]);
        setLoading(true);
        try {
            const data = await listarMinhasAtracoesParaEvento(eventoId);
            setAtracoes(Array.isArray(data) ? data : []);
            return data;
        } catch (e) {
            console.error('erro ao listar atracoes para evento:', e);
            setErro('Erro ao carregar atrações');
            setAtracoes([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarMeusEventos();
    }, [carregarMeusEventos]);

    return {
        eventos,
        atracoes,
        loading,
        erro,
        carregarMeusEventos,
        carregarAtracoesParaEvento,
    };
}

export default useMeusAvaliacoes;
