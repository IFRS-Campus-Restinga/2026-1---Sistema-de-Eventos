import { useCallback, useState } from 'react';
import {
    criarAvaliacao,
    atualizarAvaliacao,
    deletarAvaliacao,
    listarAvaliacoes,
    listarAvaliacoesPorSubmissao,
    listarAvaliacoesPorAvaliador,
} from '../services/avaliacaoSubmissaoService';

export function useAvaliacaoSubmissao() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [avaliacoes, setAvaliacoes] = useState([]);

    const carregarAvaliacoes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await listarAvaliacoes();
            setAvaliacoes(Array.isArray(response) ? response : response.results || []);
        } catch (erro) {
            console.error('erro ao listar avaliacoes:', erro);
            setAvaliacoes([]);
            setMessage({
                type: 'danger',
                text: 'Erro ao carregar avaliações',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarAvaliacoesPorSubmissao = useCallback(async (submissaoId) => {
        if (!submissaoId) {
            setAvaliacoes([]);
            return;
        }

        try {
            setLoading(true);
            const response = await listarAvaliacoesPorSubmissao(submissaoId);
            setAvaliacoes(Array.isArray(response) ? response : response.results || []);
        } catch (erro) {
            console.error('erro ao listar avaliacoes da submissao:', erro);
            setAvaliacoes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarAvaliacoesPorAvaliador = useCallback(async (avaliadorId) => {
        if (!avaliadorId) {
            setAvaliacoes([]);
            return;
        }

        try {
            setLoading(true);
            const response = await listarAvaliacoesPorAvaliador(avaliadorId);
            setAvaliacoes(Array.isArray(response) ? response : response.results || []);
        } catch (erro) {
            console.error('erro ao listar avaliacoes do avaliador:', erro);
            setAvaliacoes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCriarAvaliacao = useCallback(async (dadosAvaliacao) => {
        if (!dadosAvaliacao.submissao || !dadosAvaliacao.nota) {
            setMessage({
                type: 'warning',
                text: 'Preencha todos os campos obrigatórios',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await criarAvaliacao(dadosAvaliacao);
            setAvaliacoes([...avaliacoes, response]);
            setMessage({
                type: 'success',
                text: 'Avaliação criada com sucesso!',
            });
            return response;
        } catch (erro) {
            console.error('erro ao criar avaliacao:', erro.response?.data || erro.message);
            const errorMsg = erro.response?.data?.detail || erro.response?.data?.nota?.[0] || 'Erro ao criar avaliação';
            setMessage({
                type: 'danger',
                text: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    }, [avaliacoes]);

    const handleAtualizarAvaliacao = useCallback(async (avaliacaoId, dadosAtualizados) => {
        if (!avaliacaoId) {
            setMessage({
                type: 'warning',
                text: 'ID da avaliação não informado',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await atualizarAvaliacao(avaliacaoId, dadosAtualizados);
            setAvaliacoes(
                avaliacoes.map((av) => (av.id === avaliacaoId ? response : av))
            );
            setMessage({
                type: 'success',
                text: 'Avaliação atualizada com sucesso!',
            });
            return response;
        } catch (erro) {
            console.error('erro ao atualizar avaliacao:', erro);
            setMessage({
                type: 'danger',
                text: 'Erro ao atualizar avaliação',
            });
        } finally {
            setLoading(false);
        }
    }, [avaliacoes]);

    const handleDeletarAvaliacao = useCallback(async (avaliacaoId) => {
        if (!avaliacaoId) {
            setMessage({
                type: 'warning',
                text: 'ID da avaliação não informado',
            });
            return;
        }

        setLoading(true);
        try {
            await deletarAvaliacao(avaliacaoId);
            setAvaliacoes(avaliacoes.filter((av) => av.id !== avaliacaoId));
            setMessage({
                type: 'success',
                text: 'Avaliação deletada com sucesso!',
            });
        } catch (erro) {
            console.error('erro ao deletar avaliacao:', erro);
            setMessage({
                type: 'danger',
                text: 'Erro ao deletar avaliação',
            });
        } finally {
            setLoading(false);
        }
    }, [avaliacoes]);

    return {
        loading,
        message,
        avaliacoes,
        carregarAvaliacoes,
        carregarAvaliacoesPorSubmissao,
        carregarAvaliacoesPorAvaliador,
        handleCriarAvaliacao,
        handleAtualizarAvaliacao,
        handleDeletarAvaliacao,
        setMessage,
    };
}
