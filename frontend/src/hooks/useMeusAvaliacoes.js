import { useCallback, useEffect, useState } from 'react';
import {
    listarMeusEventosAvaliador,
    listarMinhasAtracoesParaEvento,
    listarMinhasSubmissoesParaEvento, // Importação do novo service adicionado
} from '../services/meusAvaliacoesService';

export function useMeusAvaliacoes() {
    const [eventos, setEventos] = useState([]);
    const [atracoes, setAtracoes] = useState([]);
    const [submissoes, setSubmissoes] = useState([]); // Novo estado para armazenar as submissões designadas
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    const carregarMeusEventos = useCallback(async () => {
        setLoading(true);
        setErro(null);
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
        setErro(null);
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

    // NOVO COMPORTAMENTO: Carrega as submissões atribuídas ao avaliador para o evento selecionado
    const carregarSubmissoesParaEvento = useCallback(async (eventoId) => {
        if (!eventoId) return setSubmissoes([]);
        setLoading(true);
        setErro(null);
        try {
            const data = await listarMinhasSubmissoesParaEvento(eventoId);
            setSubmissoes(Array.isArray(data) ? data : []);
            return data;
        } catch (e) {
            console.error('erro ao listar submissões para o evento:', e);
            setErro('Erro ao carregar submissões de trabalho');
            setSubmissoes([]);
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
        submissoes, // Exposição do novo array de dados higienizados da API
        loading,
        erro,
        carregarMeusEventos,
        carregarAtracoesParaEvento,
        carregarSubmissoesParaEvento, // Método exposto para alimentar a view do frontend
    };
}

export default useMeusAvaliacoes;
