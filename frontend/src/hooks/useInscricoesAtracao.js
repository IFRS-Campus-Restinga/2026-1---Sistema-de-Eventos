import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    criarInscricaoAtracao,
    listarInscricoesAtracoes,
} from '../services/inscricaoAtracaoService';
import { checkSession } from '../services/authService';

export default function useInscricoesAtracao(atracaoIdInicial = '') {
    const [atracaoId, setAtracaoId] = useState(String(atracaoIdInicial || ''));
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);

    useEffect(() => {
        async function carregarUsuario() {
            setCarregandoUsuario(true);

            try {
                const authResult = await checkSession();
                setUsuarioLogado(
                    authResult.authenticated ? authResult.user : null,
                );
            } catch {
                setUsuarioLogado(null);
            } finally {
                setCarregandoUsuario(false);
            }
        }

        carregarUsuario();
    }, []);

    const carregarInscricoes = useCallback(async (idAtracao = '') => {
        setLoading(true);
        setError(null);

        try {
            const data = await listarInscricoesAtracoes(idAtracao);
            setInscricoes(data);
            return data;
        } catch (erro) {
            setError(erro);
            setInscricoes([]);
            throw erro;
        } finally {
            setLoading(false);
        }
    }, []);

    const criarInscricao = useCallback(
        async (dados) => {
            setLoading(true);
            setError(null);

            try {
                const inscricaoCriada = await criarInscricaoAtracao(dados);

                const atracaoAtual =
                    dados?.atracao_id ?? inscricaoCriada?.atracao_id;
                if (atracaoAtual) {
                    await carregarInscricoes(atracaoAtual);
                } else if (inscricaoCriada) {
                    setInscricoes((prev) => [inscricaoCriada, ...prev]);
                }

                return inscricaoCriada;
            } catch (erro) {
                setError(erro);
                throw erro;
            } finally {
                setLoading(false);
            }
        },
        [carregarInscricoes],
    );

    useEffect(() => {
        carregarInscricoes(atracaoId);
    }, [atracaoId, carregarInscricoes]);

    const presentes = useMemo(
        () => inscricoes.filter((i) => Boolean(i.presente)),
        [inscricoes],
    );

    const estaInscritoEmAtracao = useCallback(
        (atracaoParaVerificar) => {
            if (!usuarioLogado?.id || !atracaoParaVerificar) {
                return false;
            }

            const perfilIdSessao = usuarioLogado.perfil_id;

            return inscricoes.some(
                (inscricao) =>
                    Number(inscricao.atracao_id) ===
                        Number(atracaoParaVerificar) &&
                    Number(inscricao.perfil_id) === Number(perfilIdSessao),
            );
        },
        [inscricoes, usuarioLogado],
    );

    const obterStatusInscricao = useCallback(
        (atracaoParaVerificar) => {
            const perfilIdSessao = usuarioLogado?.perfil_id;
            if (!perfilIdSessao || !atracaoParaVerificar) return null;

            const inscricao = inscricoes.find(
                (i) =>
                    Number(i.atracao_id) === Number(atracaoParaVerificar) &&
                    Number(i.perfil_id) === Number(perfilIdSessao),
            );

            return inscricao ? inscricao.status : null;
        },
        [inscricoes, usuarioLogado],
    );

    return {
        atracaoId,
        setAtracaoId,
        inscricoes,
        presentes,
        loading,
        error,
        usuarioLogado,
        carregandoUsuario,
        carregarInscricoes,
        criarInscricao,
        estaInscritoEmAtracao,
        obterStatusInscricao,
    };
}
