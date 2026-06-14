import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import service from '../services/avaliacaoSubmissaoService';
import { listarEtapas } from '../services/etapaEventoService';
import { pegarTokenCsrf } from '../services/csrfService';

export default function useAvaliarSubmissao({
    submissaoId,
    avaliacaoId: avaliacaoIdParam,
}) {
    const [submissao, setSubmissao] = useState(null);
    const [criterios, setCriterios] = useState([]);
    const [itens, setItens] = useState([]);
    const [parecer, setParecer] = useState('');
    const [statusAprovacao, setStatusAprovacao] = useState('EM_AVALIACAO');
    const [loading, setLoading] = useState(false);
    const [avaliacaoId, setAvaliacaoId] = useState(avaliacaoIdParam || null);
    const [editingAllowed, setEditingAllowed] = useState(false);

    const parseNota = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const n = Number(String(value).replace(',', '.'));
        return Number.isFinite(n) ? n : null;
    };

    const formatNota = (v) => {
        if (v === null || v === undefined) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n.toFixed(1) : null;
    };

    useEffect(() => {
        if (!submissaoId) return;

        (async () => {
            try {
                setLoading(true);

                // Busca o objeto injetado via Link state do react-router primeiro
                const estadoNavegacao = window.history.state?.usr;
                let dadosSubmissao = estadoNavegacao?.submissaoObjeto;

                // Fallback: Se não veio por estado, faz a busca filtrada na listagem geral
                if (!dadosSubmissao) {
                    const respLista = await axios.get(
                        `${API_URL}/api/submissoes/`,
                        { withCredentials: true },
                    );
                    dadosSubmissao = (respLista.data || []).find(
                        (s) => String(s.id) === String(submissaoId),
                    );
                }

                if (!dadosSubmissao) {
                    console.error('Submissão não encontrada no sistema.');
                    setLoading(false);
                    return;
                }

                setSubmissao(dadosSubmissao);

                const criteriosData =
                    await service.pegarCriteriosSubmissaoPorModalidade(
                        dadosSubmissao.modalidade,
                    );
                setCriterios(criteriosData || []);

                const inicial = (criteriosData || []).map((c) => ({
                    criterio_avaliacao: c.id,
                    nota: null,
                    item_id: null,
                }));

                try {
                    const etapas = await listarEtapas();
                    const now = new Date();
                    const etapa = (etapas || []).find(
                        (e) =>
                            String(e.evento) ===
                                String(dadosSubmissao.evento) &&
                            e.tipo_etapa === 'AVALIACAO_PREVIA',
                    );
                    setEditingAllowed(
                        !!(
                            etapa &&
                            new Date(etapa.data_inicio) <= now &&
                            new Date(etapa.data_fim) >= now
                        ),
                    );
                } catch (err) {
                    console.error('Erro ao verificar etapas:', err);
                }

                if (avaliacaoIdParam) {
                    try {
                        const respAv = await axios.get(
                            `${API_URL}/api/avaliacao_submissao/${avaliacaoIdParam}/`,
                            { withCredentials: true },
                        );
                        setParecer(respAv.data.parecer || '');
                        setStatusAprovacao(
                            respAv.data.status_aprovacao || 'EM_AVALIACAO',
                        );
                        setAvaliacaoId(respAv.data.id);

                        const respItens = await axios.get(
                            `${API_URL}/api/item_avaliacao_submissao/`,
                            {
                                params: {
                                    avaliacao_submissao: avaliacaoIdParam,
                                },
                                withCredentials: true,
                            },
                        );

                        (respItens.data || []).forEach((it) => {
                            const idx = inicial.findIndex(
                                (x) =>
                                    String(x.criterio_avaliacao) ===
                                    String(it.criterio_avaliacao),
                            );
                            if (idx >= 0) {
                                inicial[idx].nota = parseNota(it.nota);
                                inicial[idx].item_id = it.id;
                            }
                        });
                    } catch (err) {
                        console.error('Erro ao mapear avaliação:', err);
                    }
                }

                setItens(inicial);
            } catch (err) {
                console.error('Erro ao inicializar dados do formulário:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [submissaoId, avaliacaoIdParam]);

    const handleNotaChange = (idx, value) => {
        let v = null;
        if (value !== '' && value !== null && value !== undefined) {
            const num = Number(String(value).replace(',', '.'));
            if (Number.isFinite(num)) {
                v = Math.min(10, Math.max(0, Math.round(num * 10) / 10));
            }
        }
        setItens((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], nota: v };
            return copy;
        });
    };

    const podeEnviar = (() => {
        if (!editingAllowed) return false;
        if (!parecer || parecer.trim() === '') return false;
        if (!itens.length) return false;
        return itens.every((i) => Number.isFinite(i.nota));
    })();

    const handleSubmit = async () => {
        if (!submissao) return { success: false };
        const payloadCabecalho = {
            submissao: submissao.id,
            parecer: parecer,
            status_aprovacao: statusAprovacao,
            data_avaliacao: new Date().toISOString(),
        };

        try {
            setLoading(true);
            const csrfData = await pegarTokenCsrf();
            const csrfToken = csrfData?.csrfToken || '';

            // CORREÇÃO: Aplica o token CSRF globalmente nas instâncias do Axios.
            // Isso garante que tanto as requisições inline abaixo quanto as chamadas feitas
            // dentro do 'service.criarAvaliacaoSubmissaoComItens' possuam o cabeçalho obrigatório.
            if (csrfToken) {
                axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
            }

            if (avaliacaoId) {
                await axios.put(
                    `${API_URL}/api/avaliacao_submissao/${avaliacaoId}/`,
                    payloadCabecalho,
                    {
                        headers: { 'X-CSRFToken': csrfToken },
                        withCredentials: true,
                    },
                );

                for (const it of itens) {
                    const payloadItem = {
                        nota: formatNota(it.nota),
                        criterio_avaliacao: it.criterio_avaliacao,
                        avaliacao_submissao: avaliacaoId,
                    };
                    if (it.item_id) {
                        await axios.put(
                            `${API_URL}/api/item_avaliacao_submissao/${it.item_id}/`,
                            payloadItem,
                            {
                                headers: { 'X-CSRFToken': csrfToken },
                                withCredentials: true,
                            },
                        );
                    } else {
                        await axios.post(
                            `${API_URL}/api/item_avaliacao_submissao/`,
                            payloadItem,
                            {
                                headers: { 'X-CSRFToken': csrfToken },
                                withCredentials: true,
                            },
                        );
                    }
                }
            } else {
                const itensPayload = itens.map((it) => ({
                    criterio_avaliacao: it.criterio_avaliacao,
                    nota: formatNota(it.nota),
                }));
                // Agora o service executa com o token CSRF injetado no cabeçalho comum do Axios
                await service.criarAvaliacaoSubmissaoComItens(
                    payloadCabecalho,
                    itensPayload,
                );
            }
            return { success: true };
        } catch (err) {
            console.error('Erro ao salvar avaliação:', err);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        submissao,
        criterios,
        itens,
        parecer,
        setParecer,
        statusAprovacao,
        setStatusAprovacao,
        loading,
        editingAllowed,
        handleNotaChange,
        handleSubmit,
        podeEnviar,
    };
}
