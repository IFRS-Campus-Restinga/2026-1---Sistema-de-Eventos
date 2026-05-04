import { useState, useEffect } from 'react';
import submissoesMock from '../mocks/submissoes_mock.json';

export function useSubmissoesMock() {
    const [submissoes, setSubmissoes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Simula um delay de requisição
        setLoading(true);
        const timer = setTimeout(() => {
            setSubmissoes(submissoesMock.submissoes);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const obterSubmissaoPorId = (id) => {
        return submissoes.find((s) => s.id === parseInt(id));
    };

    return {
        submissoes,
        loading,
        obterSubmissaoPorId,
    };
}
