import { useCallback, useEffect, useMemo, useState } from 'react';
import useSubmissaoAvaliador from './useSubmissaoAvaliador';
import service from '../services/gerenciarAvaliadoresSubmissaoService';
import {
    homologarSubmissao,
    reprovarSubmissao,
} from '../services/submissoesService';
import {
    construirOpcoesModalidade,
    filtrarAtracoes as filtrarSubmissoes,
    ordenarAtracoesPorMedia as ordenarSubmissoesPorMedia,
    contarDesignacoes,
    gerarSugestoesPorArea,
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
    const [areaOptions] = useState([]);

    const [selecionada, setSelecionada] = useState(null);
    const [manualBusca, setManualBusca] = useState('');
    const [sugestoes, setSugestoes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [selecionadasSugestoes, setSelecionadasSugestoes] = useState([]);
    const [avaliadoresAtuais, setAvaliadoresAtuais] = useState([]);
    const [carregandoAutomatico, setCarregandoAutomatico] = useState(false);
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
        } catch {
            setUsuarios([]);
            return [];
        }
    };

    const extrairDadosParticipacao = (submissao) => {
        const fontesAutoria =
            Array.isArray(submissao?.autorias) && submissao.autorias.length
                ? submissao.autorias
                : Array.isArray(submissao?.equipe) && submissao.equipe.length
                  ? submissao.equipe
                  : [];

        const ids = new Set();
        const nomes = new Set();

        fontesAutoria.forEach((autor) => {
            [
                autor?.perfil_id,
                autor?.user_id,
                autor?.usuario_id,
                autor?.id,
            ].forEach((valor) => {
                if (valor != null && valor !== '') {
                    ids.add(String(valor));
                }
            });

            const nome =
                autor?.nome ||
                autor?.full_name ||
                autor?.usuario_nome ||
                autor?.autor ||
                autor?.autor_nome ||
                autor?.user_nome;
            if (nome) {
                nomes.add(String(nome).trim().toLowerCase());
            }
        });

        return { ids, nomes };
    };

    const usuarioEAutorOuCoautor = (usuario, autorData) => {
        const perfilId = usuario.perfil_id || usuario.id;
        if (perfilId && autorData.ids.has(String(perfilId))) {
            return true;
        }
        const nome = String(
            usuario.nome || usuario.full_name || usuario.user_nome || '',
        )
            .trim()
            .toLowerCase();
        return nome && autorData.nomes.has(nome);
    };

    const obterEventoIdTrabalho = (trabalho) => {
        const evento = trabalho?.evento;
        return evento && typeof evento === 'object' ? evento.id : evento;
    };

    const trabalhoElegivelParaAtribuicao = (trabalho) => {
        const status = trabalho?.status_submissao || trabalho?.status;
        const statusValido = ![
            'CONVERTIDA_EM_ATRACAO',
            'HOMOLOGADA',
            'REPROVADA',
            'APROVADA',
            'CANCELADA',
        ].includes(status);
        const eventoId = obterEventoIdTrabalho(trabalho);
        const etapaAtiva = eventoId
            ? eventosMap[String(eventoId)] === true
            : false;
        return statusValido && etapaAtiva;
    };

    const existemSubmissoesElegiveisParaAtribuicao = useMemo(
        () => (submissoes || []).some(trabalhoElegivelParaAtribuicao),
        [submissoes, eventosMap],
    );

    const criarRecomendadosAutomaticos = (submissao, usuariosLista) => {
        const autorData = extrairDadosParticipacao(submissao);
        const atuaisSet = new Set(
            (submissao.avaliadores || []).map((av) =>
                String(av.perfil_id || av.id),
            ),
        );

        const limiteRaw =
            typeof submissao.modalidade === 'object'
                ? submissao.modalidade?.limite_avaliadores
                : modalidadesMap?.[submissao.modalidade]?.limite_avaliadores;
        const limite = Number(limiteRaw);
        const target = Number.isFinite(limite) && limite > 0 ? limite : 2;

        const candidatos = (usuariosLista || []).filter((u) => {
            const pid = u.perfil_id || u.id;
            if (!pid) return false;
            if (atuaisSet.has(String(pid))) return false;
            if (usuarioEAutorOuCoautor(u, autorData)) return false;
            return true;
        });

        const sugestoesArea = gerarSugestoesPorArea(candidatos, submissao);
        const sugestoesAreaIds = new Set(
            sugestoesArea.map((u) => String(u.perfil_id || u.id)),
        );

        const outros = candidatos.filter(
            (u) => !sugestoesAreaIds.has(String(u.perfil_id || u.id)),
        );

        const ordenarPorCarga = (a, b) => {
            const aId = String(a.perfil_id || a.id);
            const bId = String(b.perfil_id || b.id);
            return (
                (avaliadoresContagemMap[aId] || 0) -
                (avaliadoresContagemMap[bId] || 0)
            );
        };

        sugestoesArea.sort(ordenarPorCarga);
        outros.sort(ordenarPorCarga);

        return [...sugestoesArea, ...outros]
            .slice(0, target)
            .map((u) => String(u.perfil_id || u.id));
    };

    const toggleSelecao = (perfilId) => {
        setSelecionadasSugestoes((prev) => {
            if (prev.includes(perfilId)) {
                return prev.filter((p) => p !== perfilId);
            }
            return [...prev, perfilId];
        });
    };

    const onBuscarUsuarios = async () => {
        const texto = (manualBusca || '').trim();
        await carregarUsuarios(texto);
    };

    const atribuirAutomaticamente = async () => {
        if (carregandoAutomatico || !Array.isArray(submissoes)) return;
        setCarregandoAutomatico(true);
        try {
            const usuariosCarregados = await carregarUsuarios();
            const trabalhos = (submissoes || []).filter(
                trabalhoElegivelParaAtribuicao,
            );

            for (const submissao of trabalhos) {
                const recomendados = criarRecomendadosAutomaticos(
                    submissao,
                    usuariosCarregados,
                );
                for (const pid of recomendados) {
                    await adicionarAvaliador(submissao.id, pid);
                }
            }

            await carregarLista();
            setAlerta({
                mensagem: 'Atribuição automática executada com sucesso.',
                variacao: 'success',
                reacao: Date.now(),
            });
        } catch (e) {
            setAlerta({
                mensagem:
                    'Falha ao executar a atribuição automática. Tente novamente.',
                variacao: 'danger',
                reacao: Date.now(),
            });
        } finally {
            setCarregandoAutomatico(false);
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

                if (!etapa || !etapa.data_inicio || !etapa.data_fim) {
                    map[evt.id] = false;
                    return;
                }

                const inicio = new Date(etapa.data_inicio);
                const fim = new Date(etapa.data_fim);

                map[evt.id] = now >= inicio && now <= fim;
            });
            setEventosMap(map);
        } catch {
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
        } catch {
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
                        // Garante que a UI tenha texto dos autores
                        // (TabelaAtribuicao usa `autores_text`)
                        const fontesAutoria =
                            Array.isArray(item?.autorias) &&
                            item.autorias.length
                                ? item.autorias
                                : Array.isArray(item?.equipe) &&
                                    item.equipe.length
                                  ? item.equipe
                                  : [];

                        const nomesAutores = fontesAutoria
                            .map(
                                (aut) =>
                                    aut?.nome ||
                                    aut?.usuario_nome ||
                                    aut?.autor ||
                                    aut?.usuario ||
                                    '',
                            )
                            .map((v) => String(v).trim())
                            .filter(Boolean);

                        item.autores_text =
                            item.autores_text ||
                            (nomesAutores.length
                                ? nomesAutores.join(', ')
                                : '—');

                        const resp = await service.listarAvaliadoresSubmissao(
                            item.id,
                        );
                        item.avaliadores = resp?.avaliadores || [];

                        // Carrega avaliações salvas da submissão
                        const avaliacoesEnviadas =
                            await service.listarAvaliacoes({
                                submissao: item.id,
                            });

                        // Calcula a média final para exibir na coluna "Média"
                        // (TabelaAtribuicao usa `nota_media`)
                        const notas = (avaliacoesEnviadas || [])
                            .map((av) => av.nota_final)
                            .map((n) => (Number.isFinite(n) ? n : Number(n)))
                            .filter((n) => Number.isFinite(n));

                        item.nota_media =
                            notas.length > 0
                                ? notas.reduce((acc, v) => acc + v, 0) /
                                  notas.length
                                : null;

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
        } catch {
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

        const usuariosCarregados = await carregarUsuarios();
        setSugestoes(
            gerarSugestoesPorArea(usuariosCarregados, submissao).slice(0, 6),
        );
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
        } catch {
            setAlerta({
                mensagem: 'Falha ao atualizar atribuições de avaliadores.',
                variacao: 'danger',
                reacao: Date.now(),
            });
        }
    };

    const homologarUmaSubmissao = async (submissao) => {
        if (!submissao?.id) return;

        setAlerta(null);
        try {
            await homologarSubmissao(submissao.id);
            await carregarLista();
            window.dispatchEvent(new Event('atualizarEventosAvaliador'));
            setAlerta({
                mensagem: 'Submissão homologada com sucesso!',
                variacao: 'success',
                reacao: Date.now(),
            });
        } catch {
            setAlerta({
                mensagem: 'Falha ao homologar a submissão.',
                variacao: 'danger',
                reacao: Date.now(),
            });
        }
    };

    const reprovarUmaSubmissao = async (submissao) => {
        if (!submissao?.id) return;

        setAlerta(null);
        try {
            await reprovarSubmissao(submissao.id);
            await carregarLista();
            window.dispatchEvent(new Event('atualizarEventosAvaliador'));
            setAlerta({
                mensagem: 'Submissão reprovada com sucesso!',
                variacao: 'success',
                reacao: Date.now(),
            });
        } catch {
            setAlerta({
                mensagem: 'Falha ao reprovar a submissão.',
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
        } catch {
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
        manualBusca,
        setManualBusca,
        sugestoes,
        selecionadasSugestoes,
        setSelecionadasSugestoes,
        toggleSelecao,
        onBuscarUsuarios,
        atribuirAutomaticamente,
        carregandoAutomatico,
        existemSubmissoesElegiveisParaAtribuicao,
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
        homologarSubmissao: homologarUmaSubmissao,
        reprovarSubmissao: reprovarUmaSubmissao,
        avaliacoesMap,
        isMobile:
            typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    };
}
