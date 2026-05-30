import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import avaliacaoAtracaoService from '../services/avaliacaoAtracaoService';
import { listarEtapas } from '../services/etapaEventoService';
import { pegarTokenCsrf } from '../services/csrfService';

export default function useAvaliarAtracao({
    atracaoId,
    avaliacaoId: avaliacaoIdParam,
}) {
    const [atracao, setAtracao] = useState(null);
    const [criterios, setCriterios] = useState([]);
    const [itens, setItens] = useState([]);
    const [parecer, setParecer] = useState('');
    const [destaque, setDestaque] = useState(false);
    const [compareceu, setCompareceu] = useState(true);
    const [loading, setLoading] = useState(false);
    const [avaliacaoId, setAvaliacaoId] = useState(avaliacaoIdParam || null);
    const [editingAllowed, setEditingAllowed] = useState(false);

    const parseNota = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const s = String(value).replace(',', '.');
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    };

    const formatNota = (v) => {
        if (v === null || v === undefined) return null;
        const n = Number(v);
        if (!Number.isFinite(n)) return null;
        // ensure one decimal place as string (uses dot)
        return n.toFixed(1);
    };

    useEffect(() => {
        if (!atracaoId) return;

        (async () => {
            try {
                setLoading(true);
                const resp = await axios.get(
                    `${API_URL}/api/atracoes/${atracaoId}/`,
                    { withCredentials: true },
                );
                setAtracao(resp.data);
                const criteriosData =
                    await avaliacaoAtracaoService.pegarCriteriosPorModalidade(
                        resp.data.modalidade,
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
                            String(e.evento) === String(resp.data.evento) &&
                            e.tipo_etapa === 'REALIZACAO_EVENTO',
                    );
                    const etapaAberta =
                        etapa &&
                        new Date(etapa.data_inicio) <= now &&
                        new Date(etapa.data_fim) >= now;
                    setEditingAllowed(!!etapaAberta);
                } catch (err) {
                    console.error('erro ao verificar etapas', err);
                }

                // carregar avaliacao existente se houver (apenas do usuário logado)
                if (avaliacaoIdParam) {
                    try {
                        const respAv = await axios.get(
                            `${API_URL}/api/avaliacao_atracao/${avaliacaoIdParam}`,
                            { withCredentials: true },
                        );
                        const dadosAv = respAv.data;
                        setParecer(dadosAv.parecer || '');
                        setDestaque(!!dadosAv.destaque_do_dia);
                        setCompareceu(!!dadosAv.compareceu);
                        setAvaliacaoId(dadosAv.id);
                        const respItens = await axios.get(
                            `${API_URL}/api/item_avaliacao_atracao/`,
                            {
                                params: { avaliacao_atracao: avaliacaoIdParam },
                                withCredentials: true,
                            },
                        );
                        const itensData = respItens.data || [];
                        const itensFiltrados = itensData.filter(
                            (it) =>
                                String(it.avaliacao_atracao) ===
                                String(avaliacaoIdParam),
                        );
                        itensFiltrados.forEach((it) => {
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
                        console.error(
                            'erro ao carregar avaliacao existente',
                            err,
                        );
                    }
                }

                // se não veio avaliacao_id na query, buscar avaliação do usuário logado
                if (!avaliacaoIdParam) {
                    try {
                        const respAll = await axios.get(
                            `${API_URL}/api/avaliacao_atracao/`,
                            {
                                params: {
                                    atracao: resp.data.id,
                                    mine: 1,
                                },
                                withCredentials: true,
                            },
                        );
                        const all = respAll.data || [];
                        const found = all[0];
                        if (found) {
                            setParecer(found.parecer || '');
                            setDestaque(!!found.destaque_do_dia);
                            setCompareceu(!!found.compareceu);
                            setAvaliacaoId(found.id);
                            const respItens2 = await axios.get(
                                `${API_URL}/api/item_avaliacao_atracao/`,
                                {
                                    params: { avaliacao_atracao: found.id },
                                    withCredentials: true,
                                },
                            );
                            const itensData2 = respItens2.data || [];
                            const itensFiltrados2 = itensData2.filter(
                                (it) =>
                                    String(it.avaliacao_atracao) ===
                                    String(found.id),
                            );
                            itensFiltrados2.forEach((it) => {
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
                        }
                    } catch (err) {
                        console.error(
                            'erro ao buscar avaliacao do usuario',
                            err,
                        );
                    }
                }

                setItens(inicial);
            } catch (err) {
                console.error('erro ao carregar atracao/criterios', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [atracaoId, avaliacaoIdParam]);

    const handleNotaChange = (idx, value) => {
        let v = null;
        if (value !== '' && value !== null && value !== undefined) {
            const normalized = String(value).replace(',', '.');
            const num = Number(normalized);
            if (Number.isFinite(num)) {
                // round to one decimal and clamp between 0 and 10
                const rounded = Math.round(num * 10) / 10;
                const clamped = Math.min(10, Math.max(0, rounded));
                v = clamped;
            } else {
                v = null;
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
        if (!parecer || String(parecer).trim() === '') return false;
        if (!itens || itens.length === 0) return false;
        const notasValidas = itens.every((i) => Number.isFinite(i.nota));
        return notasValidas;
    })();

    const handleSubmit = async () => {
        if (!atracao) return { success: false };
        const avaliacaoDados = {
            atracao: atracao.id,
            parecer: parecer,
            destaque_do_dia: !!destaque,
            compareceu: !!compareceu,
            data_avaliacao: new Date().toISOString(),
        };

        try {
            setLoading(true);
            if (avaliacaoId) {
                const csrfData = await pegarTokenCsrf();
                const csrfToken = csrfData?.csrfToken || '';
                await axios.put(
                    `${API_URL}/api/avaliacao_atracao/${avaliacaoId}`,
                    avaliacaoDados,
                    {
                        headers: { 'X-CSRFToken': csrfToken },
                        withCredentials: true,
                    },
                );

                for (const it of itens) {
                    const payload = {
                        nota: formatNota(it.nota),
                        criterio_avaliacao: it.criterio_avaliacao,
                        avaliacao_atracao: avaliacaoId,
                    };
                    if (it.item_id) {
                        await axios.put(
                            `${API_URL}/api/item_avaliacao_atracao/${it.item_id}`,
                            payload,
                            {
                                headers: { 'X-CSRFToken': csrfToken },
                                withCredentials: true,
                            },
                        );
                    } else {
                        await axios.post(
                            `${API_URL}/api/item_avaliacao_atracao/`,
                            payload,
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
                await avaliacaoAtracaoService.criarAvaliacaoAtracaoComItens(
                    avaliacaoDados,
                    itensPayload,
                );
            }

            return { success: true };
        } catch (err) {
            console.error('erro ao enviar avaliacao', err);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        atracao,
        criterios,
        itens,
        parecer,
        setParecer,
        destaque,
        setDestaque,
        compareceu,
        setCompareceu,
        loading,
        avaliacaoId,
        setAvaliacaoId,
        editingAllowed,
        handleNotaChange,
        handleSubmit,
        podeEnviar,
    };
}
