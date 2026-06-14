import { useCallback, useEffect, useState } from 'react';
import useSubmissaoAvaliador from './useSubmissaoAvaliador';
import service from '../services/gerenciarAvaliadoresSubmissaoService';
import {
    construirOpcoesModalidade,
    filtrarAtracoes as filtrarSubmissoes,
    ordenarAtracoesPorMedia as ordenarSubmissoesPorMedia,
    contarDesignacoes,
} from '../utils/gerenciarAvaliadoresHelpers';

export default function useGerenciarAvaliadoresSubmissoes(eventoId) {
    const [exibirModal, setExibirModal] = useState(false);
    const [submissoes, setSubmissoes] = useState([]);
    const [todasSubmissoes, setTodasSubmissoes] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [filtroModalidade, setFiltroModalidade] = useState('');
    const [filtroOrdenacao, setFiltroOrdenacao] = useState('desc');
    const [carregando, setCarregando] = useState(false);

    const [filtroArea, setFiltroArea] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);

    const [selecionada, setSelecionada] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [selecionadasSugestoes, setSelecionadasSugestoes] = useState([]);
    const [avaliadoresAtuais, setAvaliadoresAtuais] = useState([]);
    const [eventosMap, setEventosMap] = useState({});
    const [modalidadesMap, setModalidadesMap] = useState({});
    const [criteriosMap, setCriteriosMap] = useState({});
    const [avaliadoresContagemMap, setAvaliadoresContagemMap] = useState({});
    const [avaliacoesMap, setAvaliacoesMap] = useState({});

    const [avaliacaoModal, setAvaliacaoModal] = useState({
        show: false,
        loading: false,
        avaliador: null,
        submissao: null,
        avaliacao: null,
        itens: [],
    });
    const [alerta, setAlerta] = useState(null);

    const { adicionarAvaliador, retirarAvaliador } = useSubmissaoAvaliador();

    const opcoesModalidade = construirOpcoesModalidade(modalidadesMap);
    const ordenarOpcoes = ['Nota (decrescente)', 'Nota (crescente)'];
    const valorOrdenacao =
        filtroOrdenacao === 'asc' ? 'Nota (crescente)' : 'Nota (decrescente)';

    const carregarUsuarios = async (texto) => {
        try {
            const resp = await service.listarUsuariosServidores(texto);
            const u = Array.isArray(resp) ? resp : [];
            setUsuarios(u);
            return u;
        } catch (err) {
            setUsuarios([]);
            return [];
        }
    };

    const carregarEventosMap = async () => {
        try {
            const evts = await service.listarEventos();
            const map = {};
            const now = new Date();

            (Array.isArray(evts) ? evts : []).forEach((evt) => {
                const etapas = evt?.etapas || [];
                const etapa = etapas.find(
                    (e) => e.tipo_etapa === 'AVALIACAO_PREVIA',
                );

                if (!etapa || !etapa.data_fim || !etapa.data_inicio) {
                    map[evt.id] = true;
                    return;
                }

                const inicio = new Date(etapa.data_inicio);
                const fim = new Date(etapa.data_fim);

                map[evt.id] = now >= inicio && now <= fim;
            });
            setEventosMap(map);
        } catch (e) {
            setEventosMap({});
        }
    };

    const carregarCriterios = async () => {
        try {
            const criterios = await service.listarCriteriosSubmissao();
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
            if (!eventoId) return;

            const mods = await service.listarModalidades();
            const mapMods = {};
            (mods || []).forEach((m) => (mapMods[m.id] = m));
            setModalidadesMap(mapMods);

            const dados = await service.listarSubmissoesEvento(eventoId);
            const listaFiltrada = (dados || []).filter((item) => {
                const mObj =
                    typeof item.modalidade === 'object'
                        ? item.modalidade
                        : mapMods[item.modalidade];
                return mObj?.requer_avaliacao_submissao === true;
            });

            const mapaTemporarioAvaliacoes = {};

            const listaComAvaliadores = await Promise.all(
                listaFiltrada.map(async (item) => {
                    try {
                        const resp = await service.listarAvaliadoresSubmissao(
                            item.id,
                        );
                        item.avaliadores = resp?.avaliadores || [];

                        // Carrega avaliações salvas da submissão
                        const avaliacoesEnviadas =
                            await service.listarAvaliacoes({
                                submissao: item.id,
                            });

                        (avaliacoesEnviadas || []).forEach((av) => {
                            const avaliadorIdReal =
                                av.avaliador?.id || av.avaliador;

                            // CORREÇÃO (Duplo Vínculo Seguro): Para contornar se a tabela busca
                            // por User ID ou por Perfil ID, salvamos a avaliação em ambas as chaves mapeadas.
                            mapaTemporarioAvaliacoes[
                                `${item.id}_${avaliadorIdReal}`
                            ] = av;

                            // Tenta encontrar o correspondente na lista do Guardian para amarrar pelo perfil_id
                            const avaliadorCorrespondente =
                                item.avaliadores.find(
                                    (a) =>
                                        String(a.id) ===
                                            String(avaliadorIdReal) ||
                                        String(a.perfil_id) ===
                                            String(avaliadorIdReal),
                                );

                            if (avaliadorCorrespondente) {
                                if (avaliadorCorrespondente.perfil_id) {
                                    mapaTemporarioAvaliacoes[
                                        `${item.id}_${avaliadorCorrespondente.perfil_id}`
                                    ] = av;
                                }
                                if (avaliadorCorrespondente.id) {
                                    mapaTemporarioAvaliacoes[
                                        `${item.id}_${avaliadorCorrespondente.id}`
                                    ] = av;
                                }
                            }
                        });
                    } catch (err) {
                        console.error(
                            'Erro ao mapear avaliações da submissão',
                            item.id,
                            err,
                        );
                        item.avaliadores = [];
                    }
                    return item;
                }),
            );

            setAvaliacoesMap(mapaTemporarioAvaliacoes);
            setAvaliadoresContagemMap(contarDesignacoes(listaComAvaliadores));
            setTodasSubmissoes(listaComAvaliadores);
            setSubmissoes(listaComAvaliadores);

            await carregarEventosMap();
            await carregarCriterios();
        } catch (e) {
            console.error(e);
        } finally {
            setCarregando(false);
        }
    }, [eventoId]);

    useEffect(() => {
        carregarLista();
    }, [carregarLista]);

    const aoFiltrar = useCallback(() => {
        const res = filtrarSubmissoes(
            todasSubmissoes,
            filtroArea,
            filtroBusca,
            filtroModalidade,
        );
        setSubmissoes(ordenarSubmissoesPorMedia(res, filtroOrdenacao, {}));
    }, [
        todasSubmissoes,
        filtroArea,
        filtroBusca,
        filtroModalidade,
        filtroOrdenacao,
    ]);

    const onOrdenacaoChange = (valor) => {
        setFiltroOrdenacao(valor === 'Nota (crescente)' ? 'asc' : 'desc');
    };

    const abrirAvaliacao = async (submissao, avaliador) => {
        setAvaliacaoModal({
            show: true,
            loading: true,
            avaliador,
            submissao,
            avaliacao: null,
            itens: [],
        });

        try {
            const avaliacoes = await service.listarAvaliacoes({
                submissao: submissao.id,
            });
            const found = (avaliacoes || []).find((av) => {
                const idAv = av.avaliador?.id || av.avaliador;
                return (
                    String(idAv) === String(avaliador.id) ||
                    String(idAv) === String(avaliador.perfil_id)
                );
            });
            if (!found) {
                setAvaliacaoModal((prev) => ({ ...prev, loading: false }));
                return;
            }

            const itensResp = await service.listarItensAvaliacao(found.id);
            setAvaliacaoModal((prev) => ({
                ...prev,
                loading: false,
                avaliacao: found,
                itens: Array.isArray(itensResp) ? itensResp : [],
            }));
        } catch (e) {
            setAvaliacaoModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const fecharAvaliacao = () => {
        setAvaliacaoModal((prev) => ({ ...prev, show: false }));
    };

    const abrirModalAtribuicao = async (submissao) => {
        setAlerta(null);
        setSelecionada(submissao);
        setExibirModal(true);
        const currentAvs = submissao.avaliadores || [];
        const pids = currentAvs.map((x) => x.perfil_id || x.id).filter(Boolean);
        setAvaliadoresAtuais(pids);
        setSelecionadasSugestoes(pids);
        await carregarUsuarios();
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
                if (!atuaisSet.has(pid))
                    await adicionarAvaliador(selecionada.id, pid);
            }
            for (const pid of paraRemover) {
                if (atuaisSet.has(pid))
                    await retirarAvaliador(selecionada.id, pid);
            }

            await carregarLista();
            setExibirModal(false);

            window.dispatchEvent(new Event('atualizarEventosAvaliador'));

            setAlerta({
                mensagem: 'Banca examinadora salva com sucesso!',
                variacao: 'success',
                reacao: Date.now(),
            });
        } catch (e) {
            setAlerta({
                mensagem: 'Falha ao atualizar atribuições de avaliadores.',
                variacao: 'danger',
                reacao: Date.now(),
            });
        }
    };

    const removerAvaliadorDaTabela = async (submissao, avaliador) => {
        try {
            await retirarAvaliador(
                submissao.id,
                avaliador.perfil_id || avaliador.id,
            );
            await carregarLista();

            window.dispatchEvent(new Event('atualizarEventosAvaliador'));

            setAlerta({
                mensagem: 'Avaliador removido com sucesso.',
                variacao: 'success',
                reacao: Date.now(),
            });
        } catch (e) {
            setAlerta({
                mensagem: 'Não foi possível remover o avaliador selecionado.',
                variacao: 'danger',
                reacao: Date.now(),
            });
        }
    };

    return {
        alerta,
        setAlerta,
        submissoes,
        carregando,
        filtroModalidade,
        filtroBusca,
        filtroArea,
        setFiltroArea,
        areaOptions,
        opcoesModalidade,
        ordenarOpcoes,
        valorOrdenacao,
        setFiltroModalidade,
        setFiltroBusca,
        onOrdenacaoChange,
        aoFiltrar,
        abrirModalAtribuicao,
        exibirModal,
        selecionada,
        usuarios,
        selecionadasSugestoes,
        setSelecionadasSugestoes,
        salvarAtribuicoes,
        fecharModalAtribuicao: () => setExibirModal(false),
        avaliadoresContagemMap,
        modalidadesMap,
        criteriosMap,
        eventosMap,
        avaliacaoModal,
        abrirAvaliacao,
        fecharAvaliacao,
        removerAvaliadorDaTabela,
        avaliacoesMap,
        isMobile:
            typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    };
}
