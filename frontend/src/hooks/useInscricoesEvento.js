import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    criarInscricaoEvento,
    listarInscricoesEventos,
} from '../services/inscricaoEventoService';
import { checkSession } from '../services/authService';

export default function useInscricoesEvento(eventoIdInicial = '') {
    const [eventoId, setEventoId] = useState(String(eventoIdInicial || ''));
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

    const carregarInscricoes = useCallback(async (idEvento = '') => {
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
    }, []);

    const criarInscricao = useCallback(
        async (dados) => {
            setLoading(true);
            setError(null);

            try {
                const inscricaoCriada = await criarInscricaoEvento(dados);

                const eventoAtual =
                    dados?.evento_id ?? inscricaoCriada?.evento_id;
                if (eventoAtual) {
                    await carregarInscricoes(eventoAtual);
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
        carregarInscricoes(eventoId);
    }, [eventoId, carregarInscricoes]);

    const presentes = useMemo(
        () => inscricoes.filter((i) => Boolean(i.presente)),
        [inscricoes],
    );

    const estaInscritoEmEvento = useCallback(
        (eventoParaVerificar) => {
            if (!usuarioLogado?.id || !eventoParaVerificar) {
                return false;
            }

            const perfilIdSessao = usuarioLogado.perfil_id;

            return inscricoes.some(
                (inscricao) =>
                    Number(inscricao.evento_id) ===
                        Number(eventoParaVerificar) &&
                    Number(inscricao.perfil_id) === Number(perfilIdSessao),
            );
        },
        [inscricoes, usuarioLogado],
    );

    const obterStatusInscricao = useCallback(
        (eventoParaVerificar) => {
            const perfilIdSessao = usuarioLogado?.perfil_id;
            if (!perfilIdSessao || !eventoParaVerificar) return null;

            const inscricao = inscricoes.find(
                (i) =>
                    Number(i.evento_id) === Number(eventoParaVerificar) &&
                    Number(i.perfil_id) === Number(perfilIdSessao),
            );

            return inscricao ? inscricao.status : null;
        },
        [inscricoes, usuarioLogado],
    );

    return {
        eventoId,
        setEventoId,
        inscricoes,
        presentes,
        loading,
        error,
        usuarioLogado,
        carregandoUsuario,
        carregarInscricoes,
        criarInscricao,
        estaInscritoEmEvento,
        obterStatusInscricao,
    };
}
