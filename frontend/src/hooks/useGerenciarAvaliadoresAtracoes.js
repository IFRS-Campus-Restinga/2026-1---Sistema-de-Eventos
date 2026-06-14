import { useCallback, useEffect, useMemo, useState } from 'react';
import useAtracaoAvaliador from './useAtracaoAvaliador';
import {
    listarAtracoesEvento,
    listarUsuariosServidores,
    listarEventos,
    listarModalidades,
    listarAvaliadoresAtracao,
    listarAvaliacoes,
    listarItensAvaliacao,
    listarCriteriosAtracao,
} from '../services/gerenciarAvaliadoresService';
import {
    construirOpcoesArea,
    construirOpcoesModalidade,
    filtrarAtracoes,
    ordenarAtracoesPorMedia,
    mapearAvaliacoes,
    contarDesignacoes,
    gerarSugestoesPorArea,
} from '../utils/gerenciarAvaliadoresHelpers';

export default function useGerenciarAvaliadoresAtracoes(eventoId) {
    const [exibirModal, setExibirModal] = useState(false);
    const [atracoes, setAtracoes] = useState([]);
    const [todasAtracoes, setTodasAtracoes] = useState([]);
    const [filtroArea, setFiltroArea] = useState('');
    const [filtroBusca, setFiltroBusca] = useState('');
    const [filtroModalidade, setFiltroModalidade] = useState('');
    const [filtroOrdenacao, setFiltroOrdenacao] = useState('desc');
    const [carregando, setCarregando] = useState(false);
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    );

    const [selecionada, setSelecionada] = useState(null);
    const [sugestoes, setSugestoes] = useState([]);
    const [manualBusca, setManualBusca] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [selecionadasSugestoes, setSelecionadasSugestoes] = useState([]);
    const [avaliadoresAtuais, setAvaliadoresAtuais] = useState([]);
    const [eventosMap, setEventosMap] = useState({});
    const [modalidadesMap, setModalidadesMap] = useState({});
    const [criteriosMap, setCriteriosMap] = useState({});
    const [avaliacoesMap, setAvaliacoesMap] = useState({});
    const [destaquesMap, setDestaquesMap] = useState({});
    const [avaliadoresContagemMap, setAvaliadoresContagemMap] = useState({});
    const [avaliacaoModal, setAvaliacaoModal] = useState({
        show: false,
        loading: false,
        avaliador: null,
        atracao: null,
        avaliacao: null,
        itens: [],
    });
    const [alerta, setAlerta] = useState(null);

    const { carregarAvaliadores, adicionarAvaliador, retirarAvaliador } =
        useAtracaoAvaliador();

    const areaOptions = useMemo(
        () => construirOpcoesArea(todasAtracoes),
        [todasAtracoes],
    );

    const opcoesModalidade = useMemo(
        () => construirOpcoesModalidade(modalidadesMap),
        [modalidadesMap],
    );

    const ordenarOpcoes = useMemo(
        () => [
            'Nota (decrescente)',
            'Nota (crescente)',
            'Destaque + Nota (decrescente)',
            'Destaque + Nota (crescente)',
        ],
        [],
    );

    const valorOrdenacao = useMemo(() => {
        if (filtroOrdenacao === 'destaque_asc') {
            return 'Destaque + Nota (crescente)';
        }
        if (filtroOrdenacao === 'destaque_desc') {
            return 'Destaque + Nota (decrescente)';
        }
        return filtroOrdenacao === 'asc'
            ? 'Nota (crescente)'
            : 'Nota (decrescente)';
    }, [filtroOrdenacao]);

    const carregarUsuarios = async (texto) => {
        try {
            const resp = await listarUsuariosServidores(texto);
            const u = Array.isArray(resp) ? resp : [];
            setUsuarios(u);
            return u;
        } catch (err) {
            setUsuarios([]);
            return [];
        }
    };

    const carregarAvaliadoresSelecionados = async (atracaoId) => {
        try {
            const avResp = await listarAvaliadoresAtracao(atracaoId);
            const avs = avResp?.avaliadores || [];
            const pids = avs.map((x) => x.perfil_id || x.id).filter(Boolean);
            setAvaliadoresAtuais(pids);
            setSelecionadasSugestoes(pids);
            return pids;
        } catch (e) {
            return [];
        }
    };

    const carregarModalidades = async () => {
        try {
            const mods = await listarModalidades();
            const map = {};
            (Array.isArray(mods) ? mods : []).forEach((m) => {
                map[m.id] = m;
            });
            setModalidadesMap(map);
            return map;
        } catch (e) {
            setModalidadesMap({});
            return {};
        }
    };

    const carregarEventosMap = async () => {
        try {
            const evts = await listarEventos();
            const map = {};
            const now = new Date();
            (Array.isArray(evts) ? evts : []).forEach((evt) => {
                const etapas = evt?.etapas || [];
                const etapa = etapas.find(
                    (e) => e.tipo_etapa === 'REALIZACAO_EVENTO',
                );
                if (!etapa || !etapa.data_fim) {
                    map[evt.id] = true;
                    return;
                }
                const fim = new Date(etapa.data_fim);
                map[evt.id] = now <= fim;
            });
            setEventosMap(map);
        } catch (e) {
            setEventosMap({});
        }
    };

    const carregarCriterios = async () => {
        try {
            const criterios = await listarCriteriosAtracao();
            const map = {};
            (Array.isArray(criterios) ? criterios : []).forEach((c) => {
                map[c.id] = c;
            });
            setCriteriosMap(map);
        } catch (e) {
            setCriteriosMap({});
        }
    };

    const carregarLista = useCallback(async () => {
        setCarregando(true);
        try {
            if (!eventoId) {
                setTodasAtracoes([]);
                setAtracoes([]);
                setCarregando(false);
                return;
            }
            const mapaModalidades = await carregarModalidades();

            const dados = await listarAtracoesEvento(eventoId);
            const lista = Array.isArray(dados) ? dados : [];

            const listaFiltrada = lista.filter((item) => {
                const modalidadeObj =
                    typeof item.modalidade === 'object' && item.modalidade
                        ? item.modalidade
                        : mapaModalidades[item.modalidade];
                if (!modalidadeObj) return true;
                return modalidadeObj.requer_avaliacao === true;
            });

            const listaComAvaliadores = await Promise.all(
                listaFiltrada.map(async (item) => {
                    try {
                        const resp = await listarAvaliadoresAtracao(item.id);
                        item.avaliadores = resp?.avaliadores || [];
                    } catch (e) {
                        item.avaliadores = item.avaliadores || [];
                    }
                    return item;
                }),
            );

            setAvaliadoresContagemMap(contarDesignacoes(listaComAvaliadores));

            let mediasMap = {};
            let destaquesCalc = {};
            try {
                const avaliacoesResp = await listarAvaliacoes();
                const ids = new Set(listaFiltrada.map((item) => item.id));
                const {
                    mediasMap: medias,
                    avaliacoesMap,
                    destaquesMap,
                } = mapearAvaliacoes(avaliacoesResp, ids);
                mediasMap = medias;
                destaquesCalc = destaquesMap;
                setAvaliacoesMap(avaliacoesMap);
                setDestaquesMap(destaquesMap);
            } catch (e) {
                mediasMap = {};
                destaquesCalc = {};
                setAvaliacoesMap({});
                setDestaquesMap({});
            }

            const listaComNotas = listaComAvaliadores.map((item) => {
                const media = Object.prototype.hasOwnProperty.call(
                    mediasMap,
                    item.id,
                )
                    ? mediasMap[item.id]
                    : null;
                return { ...item, nota_media: media };
            });
            // armazenar as atrações sem forçar nova requisição ao alterar ordenação
            setTodasAtracoes(listaComNotas);
            setAtracoes(listaComNotas);
            await carregarEventosMap();
            await carregarCriterios();
        } catch (e) {
            setTodasAtracoes([]);
            setAtracoes([]);
        } finally {
            setCarregando(false);
        }
    }, [eventoId]);

    // Reordena localmente quando a ordenação muda, sem recarregar os dados do servidor
    // Agora reordena a lista atualmente exibida para não perder filtros aplicados.
    useEffect(() => {
        setAtracoes((prev) =>
            ordenarAtracoesPorMedia(
                Array.isArray(prev) ? prev : [],
                filtroOrdenacao,
                destaquesMap,
            ),
        );
    }, [filtroOrdenacao, destaquesMap]);

    useEffect(() => {
        carregarLista();
    }, [carregarLista]);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const aoFiltrar = useCallback(() => {
        const filtrado = filtrarAtracoes(
            todasAtracoes,
            filtroArea,
            filtroBusca,
            filtroModalidade,
        );
        setAtracoes(
            ordenarAtracoesPorMedia(filtrado, filtroOrdenacao, destaquesMap),
        );
    }, [
        todasAtracoes,
        filtroArea,
        filtroBusca,
        filtroModalidade,
        filtroOrdenacao,
        destaquesMap,
    ]);

    const toggleSelecao = (perfilId) => {
        setSelecionadasSugestoes((prev) => {
            if (prev.includes(perfilId)) {
                return prev.filter((p) => p !== perfilId);
            }
            return [...prev, perfilId];
        });
    };

    const abrirAvaliacao = async (atracao, avaliador) => {
        setAvaliacaoModal({
            show: true,
            loading: true,
            avaliador,
            atracao,
            avaliacao: null,
            itens: [],
        });

        try {
            const avaliacoes = await listarAvaliacoes({ atracao: atracao.id });
            const lista = Array.isArray(avaliacoes) ? avaliacoes : [];
            const found = lista.find(
                (av) => String(av.avaliador) === String(avaliador.id),
            );
            if (!found) {
                setAvaliacaoModal((prev) => ({
                    ...prev,
                    loading: false,
                    avaliacao: null,
                    itens: [],
                }));
                return;
            }

            const itensResp = await listarItensAvaliacao(found.id);
            const itens = Array.isArray(itensResp) ? itensResp : [];

            setAvaliacaoModal((prev) => ({
                ...prev,
                loading: false,
                avaliacao: found,
                itens,
            }));
        } catch (e) {
            setAvaliacaoModal((prev) => ({
                ...prev,
                loading: false,
                avaliacao: null,
                itens: [],
            }));
        }
    };

    const fecharAvaliacao = () => {
        setAvaliacaoModal((prev) => ({
            ...prev,
            show: false,
        }));
    };

    const abrirModalAtribuicao = async (atracao) => {
        setSelecionada(atracao);
        setExibirModal(true);
        await carregarAvaliadores(atracao.id);
        const u = await carregarUsuarios();
        await carregarAvaliadoresSelecionados(atracao.id);
        const sugest = gerarSugestoesPorArea(u, atracao);
        setSugestoes(sugest.slice(0, 6));
    };

    const fecharModalAtribuicao = () => {
        setExibirModal(false);
        setSelecionada(null);
        setSugestoes([]);
        setManualBusca('');
        setAvaliadoresAtuais([]);
        setSelecionadasSugestoes([]);
    };

    const salvarAtribuicoes = async () => {
        if (!selecionada) return;
        try {
            const atuaisSet = new Set(avaliadoresAtuais);
            const selecionadasSet = new Set(selecionadasSugestoes);
            const paraRemover = avaliadoresAtuais.filter(
                (pid) => !selecionadasSet.has(pid),
            );
            for (const pid of selecionadasSugestoes) {
                if (!atuaisSet.has(pid)) {
                    await adicionarAvaliador(selecionada.id, pid);
                }
            }
            for (const pid of paraRemover) {
                await retirarAvaliador(selecionada.id, pid);
            }
            await carregarLista();
            await carregarAvaliadores(selecionada.id);
            setAvaliadoresAtuais([]);
            setSelecionadasSugestoes([]);
            setExibirModal(false);
            setAlerta({
                mensagem: 'Atribuições atualizadas com sucesso.',
                variacao: 'success',
                reacao: Date.now(),
            });
        } catch (e) {
            const msg =
                e?.response?.data?.erro ||
                'Não foi possível salvar as alterações.';
            setAlerta({
                mensagem: msg,
                variacao: 'danger',
                reacao: Date.now(),
            });
        }
    };

    const removerAvaliadorDaTabela = async (atracao, avaliador) => {
        try {
            await retirarAvaliador(
                atracao.id,
                avaliador.perfil_id || avaliador.id,
            );
            await carregarLista();
            await carregarAvaliadores(atracao.id);
            setAlerta({
                mensagem: 'Avaliador removido com sucesso.',
                variacao: 'success',
                reacao: Date.now(),
            });
        } catch (e) {
            const msg =
                e?.response?.data?.erro ||
                'Não foi possível remover o avaliador.';
            setAlerta({
                mensagem: msg,
                variacao: 'danger',
                reacao: Date.now(),
            });
        }
    };

    const onBuscarUsuarios = async () => {
        const texto = (manualBusca || '').trim();
        await carregarUsuarios(texto);
    };

    const onOrdenacaoChange = (valor) => {
        setFiltroOrdenacao(
            valor === 'Nota (crescente)'
                ? 'asc'
                : valor === 'Destaque + Nota (crescente)'
                  ? 'destaque_asc'
                  : valor === 'Destaque + Nota (decrescente)'
                    ? 'destaque_desc'
                    : 'desc',
        );
    };

    return {
        alerta,
        setAlerta,
        atracoes,
        carregando,
        isMobile,
        filtroArea,
        filtroModalidade,
        filtroBusca,
        filtroOrdenacao,
        areaOptions,
        opcoesModalidade,
        ordenarOpcoes,
        valorOrdenacao,
        setFiltroArea,
        setFiltroModalidade,
        setFiltroBusca,
        onOrdenacaoChange,
        aoFiltrar,
        modalidadesMap,
        avaliacoesMap,
        destaquesMap,
        criteriosMap,
        avaliadoresContagemMap,
        abrirAvaliacao,
        fecharAvaliacao,
        removerAvaliadorDaTabela,
        abrirModalAtribuicao,
        exibirModal,
        selecionada,
        sugestoes,
        usuarios,
        manualBusca,
        setManualBusca,
        selecionadasSugestoes,
        toggleSelecao,
        onBuscarUsuarios,
        salvarAtribuicoes,
        fecharModalAtribuicao,
        avaliacaoModal,
        setAvaliacaoModal,
        eventosMap,
    };
}
