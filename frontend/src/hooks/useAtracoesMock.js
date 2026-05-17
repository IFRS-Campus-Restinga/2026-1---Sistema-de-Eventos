import { useState, useEffect } from 'react';
import { listarAtracoes } from '../services/atracaoService';

export function useAtracoesMock() {
    const [atracoes, setAtracoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const carregarAtracoes = async () => {
            try {
                setLoading(true);
                const response = await listarAtracoes();
                setAtracoes(Array.isArray(response) ? response : response.results || []);
                setError(null);
            } catch (erro) {
                console.error('Erro ao carregar atrações:', erro);
                setError('Erro ao carregar atrações');
                setAtracoes([]);
            } finally {
                setLoading(false);
            }
        };

        carregarAtracoes();
    }, []);

    const obterAtracaoPorId = (id) => {
        return atracoes.find((a) => String(a.id) === String(id));
    };

    return { atracoes, loading, error, obterAtracaoPorId };
}
