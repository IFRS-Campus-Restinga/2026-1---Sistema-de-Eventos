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

    const carregarInscricoes = useCallback(
        async (idEvento = eventoId) => {
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
        },
        [eventoId],
    );

    const criarInscricao = useCallback(
        async (dados) => {
            setLoading(true);
            setError(null);

            try {
                const inscricaoCriada = await criarInscricaoEvento(dados);

                const eventoAtual =
                    dados?.evento_id ?? inscricaoCriada?.evento_id;
                if (eventoAtual && Number(eventoAtual) === Number(eventoId)) {
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
        [carregarInscricoes, eventoId],
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

            return inscricoes.some(
                (inscricao) =>
                    Number(inscricao.evento_id) ===
                        Number(eventoParaVerificar) &&
                    Number(inscricao.perfil_usuario_id) ===
                        Number(usuarioLogado.id),
            );
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
    };
}
