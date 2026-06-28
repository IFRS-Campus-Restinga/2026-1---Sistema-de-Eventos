import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Spinner,
    Button,
    Form,
    Modal,
} from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta';
import Card from '../components/common/Card';
import EditarAtracaoModal from '../components/common/EditarAtracaoModal';
import { useMinhasInscricoes } from '../hooks/useMinhasInscricoes';
import useInscricoesAtracao from '../hooks/useInscricoesAtracao';
import {
    listarAtracoes,
    buscarEventos,
    buscarOpcoesAtracao,
    buscarUsuarios,
    editarAtracao,
    excluirAtracao,
} from '../services/atracaoService';
import {
    listarSubmissoes,
    editarSubmissao,
    excluirSubmissao,
} from '../services/submissoesService';
import {
    listarAvaliacoesSubmissao,
    listarItensAvaliacaoSubmissao,
    pegarCriteriosSubmissaoPorModalidade,
} from '../services/avaliacaoSubmissaoService';
import {
    listarAvaliacoesAtracao,
    listarItensAvaliacaoAtracao,
    pegarCriteriosPorModalidade,
} from '../services/avaliacaoAtracaoService';
import { buscarEventoPorId } from '../services/eventoService';
import { pegarModalidade } from '../services/modalidadeService';
import {
    getSelectedEventoId,
    setSelectedEventoId,
} from '../utils/selectedEvento';
import { etapaEstaAberta } from '../utils/submissaoAcesso';

const LIMITS_EDICAO = {
    titulo: { minWords: 1, maxWords: 150 },
    palavrasChave: { maxChars: 100 },
};

export default function MinhasParticipacoes({ campus = 'Campus Restinga' }) {
    const { eventoId } = useParams();
    const navigate = useNavigate();
    const eventoSelecionadoId = eventoId || getSelectedEventoId();
    const [evento, setEvento] = useState(null);
    const [atracoes, setAtracoes] = useState([]);
    const [submissoes, setSubmissoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carregandoEvento, setCarregandoEvento] = useState(true);
    const [alerta, setAlerta] = useState(null);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [itemEmEdicao, setItemEmEdicao] = useState(null);
    const [formEdicao, setFormEdicao] = useState({
        id: null,
        titulo: '',
        resumo: '',
        palavras_chave: '',
        modalidade: '',
        nivel_ensino: '',
        area_conhecimento: '',
        acessibilidade: false,
        evento: '',
        sugestao_vagas: '',
        equipe: [],
        status: '',
    });
    const [opcoesEdicao, setOpcoesEdicao] = useState({
        modalidades: [],
        niveis_ensino: [],
    });
    const [eventosEdicao, setEventosEdicao] = useState([]);
    const [usuariosEdicao, setUsuariosEdicao] = useState([]);
    const [eventoEdicaoDetalhe, setEventoEdicaoDetalhe] = useState(null);
    const [modalidadeEdicaoDetalhe, setModalidadeEdicaoDetalhe] =
        useState(null);
    const [habilitarSugestaoVagasEdicao, setHabilitarSugestaoVagasEdicao] =
        useState(false);
    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [somenteLeituraModal, setSomenteLeituraModal] = useState(false);
    const [mostrarModalAvaliacoes, setMostrarModalAvaliacoes] = useState(false);
    const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false);
    const [avaliacoesLista, setAvaliacoesLista] = useState([]);
    const [avaliacoesItensMap, setAvaliacoesItensMap] = useState({});
    const [avaliacoesDisponiveisMap, setAvaliacoesDisponiveisMap] = useState(
        {},
    );
    const [tipoListagem, setTipoListagem] = useState('atracoes');
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [ordenacao, setOrdenacao] = useState('criacao');
    const {
        inscricoes: inscricoesEventos,
        carregando: carregandoInscricoesEvento,
    } = useMinhasInscricoes();
    const {
        inscricoes,
        erro,
        carregandoUsuario,
        loading: carregandoInscricoes,
        usuarioLogado,
    } = useInscricoesAtracao();
    const inscricaoEvento = useMemo(() => {
        if (!eventoSelecionadoId) return null;

        return (
            inscricoesEventos.find(
                (inscricao) =>
                    Number(inscricao.evento_id) ===
                        Number(eventoSelecionadoId) && Boolean(inscricao.id),
            ) || null
        );
    }, [inscricoesEventos, eventoSelecionadoId]);

    useEffect(() => {
        const carregarDados = async () => {
            if (!eventoSelecionadoId) {
                setAlerta({
                    mensagem:
                        'Nenhum evento foi selecionado. Volte para Meus Eventos e escolha um evento.',
                    variacao: 'warning',
                });
                setLoading(false);
                setCarregandoEvento(false);
                return;
            }

            try {
                setLoading(true);
                setCarregandoEvento(true);

                const [dadosEvento, dadosAtracoes, dadosSubmissoes] =
                    await Promise.all([
                        buscarEventoPorId(eventoSelecionadoId),
                        listarAtracoes(eventoSelecionadoId),
                        listarSubmissoes({
                            evento: eventoSelecionadoId,
                            minhas: true,
                        }),
                    ]);

                setEvento(dadosEvento);
                setSelectedEventoId(eventoSelecionadoId);
                setAtracoes(Array.isArray(dadosAtracoes) ? dadosAtracoes : []);
                setSubmissoes(
                    Array.isArray(dadosSubmissoes) ? dadosSubmissoes : [],
                );

                if (!carregandoInscricoesEvento && !inscricaoEvento) {
                    setAlerta({
                        mensagem:
                            'Você não está inscrito neste evento. Algumas ações podem ficar indisponíveis.',
                        variacao: 'warning',
                    });
                }
            } catch (err) {
                setAlerta({
                    mensagem:
                        err?.response?.data?.erro ||
                        err?.message ||
                        'Não foi possível carregar as participações do evento.',
                    variacao: 'danger',
                });
            } finally {
                setLoading(false);
                setCarregandoEvento(false);
            }
        };

        carregarDados();
    }, [
        eventoSelecionadoId,
        inscricaoEvento,
        carregandoInscricoesEvento,
        carregandoInscricoes,
        carregandoUsuario,
        navigate,
    ]);

    const atracoesInscritas = useMemo(() => {
        if (!eventoSelecionadoId || !usuarioLogado?.perfil_id) return [];

        // ids de atrações em que o usuário está inscrito
        const idsInscritos = new Set(
            inscricoes
                .filter(
                    (inscricao) =>
                        Number(inscricao.evento_id) ===
                            Number(eventoSelecionadoId) &&
                        Number(inscricao.perfil_id) ===
                            Number(usuarioLogado.perfil_id),
                )
                .map((inscricao) => Number(inscricao.atracao_id)),
        );

        // ids de atrações em que o usuário é autor ou membro da equipe
        const idsAutorOuEquipe = new Set();
        atracoes.forEach((atracao) => {
            const autorias = Array.isArray(atracao.autorias)
                ? atracao.autorias
                : [];

            const pertenceComoAutoria = autorias.some((a) => {
                if (!a) return false;
                // normal match by local user id (when available)
                if (typeof a.usuario !== 'undefined' && usuarioLogado?.id) {
                    if (Number(a.usuario) === Number(usuarioLogado.id))
                        return true;
                }

                // fallback: compare by name/username using usuario_nome
                const usuarioNome = String(a.usuario_nome || '')
                    .trim()
                    .toLowerCase();
                const display = String(usuarioLogado?.display_name || '')
                    .trim()
                    .toLowerCase();
                const perfilNome = String(usuarioLogado?.nome || '')
                    .trim()
                    .toLowerCase();
                const username = String(usuarioLogado?.username || '')
                    .trim()
                    .toLowerCase();

                return (
                    (usuarioNome && display && usuarioNome === display) ||
                    (usuarioNome && perfilNome && usuarioNome === perfilNome) ||
                    (usuarioNome && username && usuarioNome === username)
                );
            });

            let pertenceComoEquipe = false;
            if (Array.isArray(atracao.equipe_nomes) && usuarioLogado) {
                const nomePerfil = String(usuarioLogado.nome || '').trim();
                const username = String(usuarioLogado.username || '').trim();
                pertenceComoEquipe = atracao.equipe_nomes.some((n) => {
                    if (!n) return false;
                    const s = String(n).trim();
                    return (
                        (nomePerfil && s === nomePerfil) ||
                        (username && s === username)
                    );
                });
            }

            if (pertenceComoAutoria || pertenceComoEquipe) {
                idsAutorOuEquipe.add(Number(atracao.id));
            }
        });

        // combinação: inscrito OU autor/equipe
        const idsCombinados = new Set([
            ...Array.from(idsInscritos),
            ...Array.from(idsAutorOuEquipe),
        ]);

        const minhas = atracoes
            .filter((atracao) => idsCombinados.has(Number(atracao.id)))
            .map((atracao) => {
                const autorias = Array.isArray(atracao.autorias)
                    ? atracao.autorias
                    : [];

                const isAutor = autorias.some((a) => {
                    if (!a) return false;
                    if (String(a.tipo).toUpperCase() !== 'AUTOR') return false;

                    if (typeof a.usuario !== 'undefined' && usuarioLogado?.id) {
                        if (Number(a.usuario) === Number(usuarioLogado.id))
                            return true;
                    }

                    const usuarioNome = String(a.usuario_nome || '')
                        .trim()
                        .toLowerCase();
                    const display = String(usuarioLogado?.display_name || '')
                        .trim()
                        .toLowerCase();
                    const perfilNome = String(usuarioLogado?.nome || '')
                        .trim()
                        .toLowerCase();
                    const username = String(usuarioLogado?.username || '')
                        .trim()
                        .toLowerCase();

                    return (
                        (usuarioNome && display && usuarioNome === display) ||
                        (usuarioNome &&
                            perfilNome &&
                            usuarioNome === perfilNome) ||
                        (usuarioNome && username && usuarioNome === username)
                    );
                });

                return { ...atracao, isAutor };
            });

        return minhas;
    }, [
        atracoes,
        inscricoes,
        eventoSelecionadoId,
        inscricaoEvento,
        usuarioLogado,
    ]);

    const gruposUsuarioNormalizados = useMemo(() => {
        const grupos = Array.isArray(usuarioLogado?.groups)
            ? usuarioLogado.groups
            : [];

        return grupos
            .map((group) => (typeof group === 'string' ? group : group?.name))
            .filter(Boolean)
            .map((group) => String(group).trim().toLowerCase());
    }, [usuarioLogado]);

    const contarPalavras = (texto) =>
        texto
            ?.trim()
            .split(/\s+/)
            .filter((palavra) => palavra.length > 0).length || 0;

    const normalizarNiveisEnsino = (valor) => {
        if (Array.isArray(valor)) {
            const primeiroValido = valor.find(
                (item) => String(item || '').trim() !== '',
            );
            return primeiroValido ? String(primeiroValido).trim() : '';
        }

        if (!valor) {
            return '';
        }

        return (
            String(valor)
                .split(',')
                .map((item) => item.trim())
                .find((item) => item !== '') || ''
        );
    };

    const getNomeUsuario = (usuario) =>
        usuario?.nome ||
        usuario?.name ||
        usuario?.username ||
        `Usuário ${usuario?.id}`;

    const getNivelEnsinoUsuario = (nomeMembro) => {
        const nomeNormalizado = (nomeMembro || '').trim().toLowerCase();
        if (!nomeNormalizado) return '';

        const usuarioEncontrado = (usuariosEdicao || []).find(
            (usuario) =>
                getNomeUsuario(usuario).trim().toLowerCase() ===
                nomeNormalizado,
        );

        return (
            usuarioEncontrado?.nivel_ensino_display ||
            usuarioEncontrado?.nivel_ensino ||
            ''
        );
    };

    const getAreasEventoEdicao = () => {
        const areasDoEvento = eventoEdicaoDetalhe?.area_conhecimento_detalhes;
        if (Array.isArray(areasDoEvento) && areasDoEvento.length > 0) {
            return areasDoEvento;
        }

        const areasSimples = eventoEdicaoDetalhe?.area_conhecimento;
        if (Array.isArray(areasSimples) && areasSimples.length > 0) {
            return areasSimples;
        }

        return [];
    };

    const normalizarAreaEdicao = (area) => ({
        value: area?.area_conhecimento ?? area?.value ?? area?.id ?? area,
        label:
            area?.area_conhecimento_display ||
            area?.nome ||
            area?.descricao ||
            area?.label ||
            String(area),
    });

    const selecionarNivelEnsinoEdicao = (nivelValue) => {
        setFormEdicao((prev) => ({
            ...prev,
            nivel_ensino: nivelValue,
        }));
    };

    const handleAdicionarMembroEdicao = () => {
        setFormEdicao((prev) => ({
            ...prev,
            equipe: [
                ...(prev.equipe || []),
                {
                    user_id: '',
                    nome: '',
                    instituicao_curso: '',
                    funcao: 'COAUTOR',
                },
            ],
        }));
    };

    const handleRemoverMembroEdicao = (index) => {
        setFormEdicao((prev) => ({
            ...prev,
            equipe: (prev.equipe || []).filter((_, i) => i !== index),
        }));
    };

    const handleMembroEdicaoChange = (index, campo, valor) => {
        setFormEdicao((prev) => {
            const equipeAtualizada = [...(prev.equipe || [])];

            if (campo === 'user_id') {
                const usuarioSelecionado = (usuariosEdicao || []).find(
                    (usuario) => String(usuario.id) === String(valor),
                );

                equipeAtualizada[index] = {
                    ...equipeAtualizada[index],
                    user_id: valor,
                    nome: usuarioSelecionado
                        ? getNomeUsuario(usuarioSelecionado)
                        : '',
                    instituicao_curso: usuarioSelecionado
                        ? usuarioSelecionado.nivel_ensino_display ||
                          usuarioSelecionado.nivel_ensino ||
                          ''
                        : '',
                };
            } else {
                equipeAtualizada[index] = {
                    ...equipeAtualizada[index],
                    [campo]: valor,
                };
            }

            return {
                ...prev,
                equipe: equipeAtualizada,
            };
        });
    };

    const getNivelEnsinoMembroEdicao = (membro) => {
        if (membro?.user_id) {
            const usuarioPorId = (usuariosEdicao || []).find(
                (usuario) => String(usuario.id) === String(membro.user_id),
            );

            return (
                usuarioPorId?.nivel_ensino_display ||
                usuarioPorId?.nivel_ensino ||
                membro?.instituicao_curso ||
                ''
            );
        }

        return (
            getNivelEnsinoUsuario(membro?.nome) ||
            membro?.instituicao_curso ||
            ''
        );
    };

    const getUsuariosDisponiveisLinhaEdicao = (index) => {
        const idsSelecionadosEmOutrasLinhas = new Set(
            (formEdicao.equipe || [])
                .filter((_, i) => i !== index)
                .map((membro) => String(membro?.user_id || '').trim())
                .filter((id) => id !== ''),
        );

        return (usuariosEdicao || []).filter((usuario) => {
            const idUsuario = String(usuario.id);
            if (String(usuarioLogado?.id || '') === idUsuario) {
                return false;
            }
            return !idsSelecionadosEmOutrasLinhas.has(idUsuario);
        });
    };

    useEffect(() => {
        const carregarOpcoesEdicao = async () => {
            const [dadosOpcoes, dadosEventos, dadosUsuarios] =
                await Promise.allSettled([
                    buscarOpcoesAtracao(),
                    buscarEventos(),
                    buscarUsuarios(),
                ]);

            if (dadosOpcoes.status === 'fulfilled') {
                setOpcoesEdicao({
                    modalidades: dadosOpcoes.value?.modalidades || [],
                    niveis_ensino: dadosOpcoes.value?.niveis_ensino || [],
                });
            }

            if (dadosEventos.status === 'fulfilled') {
                setEventosEdicao(dadosEventos.value || []);
            }

            if (dadosUsuarios.status === 'fulfilled') {
                setUsuariosEdicao(dadosUsuarios.value || []);
            }
        };

        carregarOpcoesEdicao();
    }, []);

    useEffect(() => {
        if (!mostrarModalEdicao || !formEdicao.evento) {
            setEventoEdicaoDetalhe(null);
            return;
        }

        const eventoResumo = eventosEdicao.find(
            (ev) => String(ev.id) === String(formEdicao.evento),
        );

        if (eventoResumo?.area_conhecimento_detalhes?.length) {
            setEventoEdicaoDetalhe(eventoResumo);
            return;
        }

        if (evento && String(evento.id) === String(formEdicao.evento)) {
            setEventoEdicaoDetalhe(evento);
        }
    }, [mostrarModalEdicao, formEdicao.evento, eventosEdicao, evento]);

    useEffect(() => {
        const carregarModalidade = async () => {
            if (!mostrarModalEdicao || !formEdicao.modalidade) {
                setModalidadeEdicaoDetalhe(null);
                return;
            }

            try {
                const detalhe = await pegarModalidade(formEdicao.modalidade);
                setModalidadeEdicaoDetalhe(detalhe);
            } catch (error) {
                setModalidadeEdicaoDetalhe(null);
            }
        };

        carregarModalidade();
    }, [mostrarModalEdicao, formEdicao.modalidade]);

    const isAdmin = () =>
        Boolean(
            usuarioLogado?.is_superuser ||
                usuarioLogado?.is_staff ||
                ['admin', 'administrador'].includes(
                    String(usuarioLogado?.group || '')
                        .trim()
                        .toLowerCase(),
                ) ||
                gruposUsuarioNormalizados.includes('admin') ||
                gruposUsuarioNormalizados.includes('administrador'),
        );

    const isCoordenador = () =>
        isAdmin() || gruposUsuarioNormalizados.includes('coordenador');

    const usuarioCorrespondeAutoria = (autoria) => {
        if (!autoria) return false;

        if (typeof autoria.usuario !== 'undefined' && usuarioLogado?.id) {
            if (Number(autoria.usuario) === Number(usuarioLogado.id)) {
                return true;
            }
        }

        const usuarioNome = String(autoria.usuario_nome || autoria.nome || '')
            .trim()
            .toLowerCase();
        const display = String(usuarioLogado?.display_name || '')
            .trim()
            .toLowerCase();
        const perfilNome = String(usuarioLogado?.nome || '')
            .trim()
            .toLowerCase();
        const username = String(usuarioLogado?.username || '')
            .trim()
            .toLowerCase();

        return (
            (usuarioNome && display && usuarioNome === display) ||
            (usuarioNome && perfilNome && usuarioNome === perfilNome) ||
            (usuarioNome && username && usuarioNome === username)
        );
    };

    const isParticipanteSubmissao = (item) => {
        const autorias = Array.isArray(item?.autorias) ? item.autorias : [];
        return autorias.some((autoria) => usuarioCorrespondeAutoria(autoria));
    };

    const coordenadorGerenciaEvento = (item) => {
        if (!isCoordenador()) return false;
        return Boolean(
            usuarioLogado?.eventos_coordenados?.includes(item?.evento),
        );
    };

    const getStatusNormalizado = (item) =>
        String(item?.status || item?.status_submissao || '')
            .trim()
            .toUpperCase();

    const podeEditarItem = (item) => {
        const status = getStatusNormalizado(item);

        if (tipoListagem === 'submissoes') {
            const statusPermitidos = ['RASCUNHO', 'SUBMETIDA', 'PREVISTA'];

            if (isCoordenador()) {
                return (
                    coordenadorGerenciaEvento(item) &&
                    statusPermitidos.includes(status)
                );
            }

            if (!isParticipanteSubmissao(item)) {
                return false;
            }

            if (statusPermitidos.includes(status)) {
                return etapaEstaAberta(evento, 'SUBMISSAO_TRABALHOS');
            }

            return (
                Boolean(item?.pode_editar_com_ressalvas) &&
                etapaEstaAberta(evento, 'AVALIACAO_PREVIA')
            );
        }

        if (!isCoordenador()) {
            return false;
        }

        if (!coordenadorGerenciaEvento(item)) {
            return false;
        }

        return ['A_APRESENTAR', 'CONFIRMADA', 'EM_ANDAMENTO'].includes(status);
    };

    const podeExcluirItem = (item) => {
        const status = getStatusNormalizado(item);

        if (tipoListagem === 'submissoes') {
            if (isCoordenador()) {
                return false;
            }

            return (
                isParticipanteSubmissao(item) &&
                ['RASCUNHO', 'SUBMETIDA', 'PREVISTA'].includes(status)
            );
        }

        return (
            isCoordenador() &&
            coordenadorGerenciaEvento(item) &&
            ['A_APRESENTAR', 'CONFIRMADA'].includes(status)
        );
    };

    const itensFiltrados = useMemo(() => {
        const base =
            tipoListagem === 'atracoes' ? atracoesInscritas : submissoes;
        const termo = String(termoBusca || '')
            .trim()
            .toLowerCase();

        const filtrados = base.filter((item) => {
            if (
                filtroStatus &&
                String(
                    item?.status || item?.status_submissao || '',
                ).toUpperCase() !== String(filtroStatus).toUpperCase()
            ) {
                return false;
            }

            if (!termo) return true;

            const textoBusca = [
                item?.titulo,
                item?.resumo,
                item?.palavras_chave,
                item?.autor_nome,
                item?.tipo,
                item?.status,
                item?.status_submissao,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return textoBusca.includes(termo);
        });

        const ordenados = [...filtrados];
        ordenados.sort((a, b) => {
            if (ordenacao === 'titulo') {
                return String(a?.titulo || '').localeCompare(
                    String(b?.titulo || ''),
                    'pt-BR',
                );
            }

            if (ordenacao === 'status') {
                const sa = String(a?.status || a?.status_submissao || '');
                const sb = String(b?.status || b?.status_submissao || '');
                return sa.localeCompare(sb, 'pt-BR');
            }

            return Number(b?.id || 0) - Number(a?.id || 0);
        });

        return ordenados;
    }, [
        tipoListagem,
        atracoesInscritas,
        submissoes,
        termoBusca,
        filtroStatus,
        ordenacao,
    ]);

    const opcoesStatus = useMemo(() => {
        const base =
            tipoListagem === 'atracoes' ? atracoesInscritas : submissoes;
        const statusSet = new Set();
        base.forEach((item) => {
            const status = String(
                item?.status || item?.status_submissao || '',
            ).trim();
            if (status) statusSet.add(status);
        });
        return Array.from(statusSet.values()).sort();
    }, [tipoListagem, atracoesInscritas, submissoes]);

    const getStatusConfig = (status) => {
        const statusNormalizado = String(status || '')
            .trim()
            .toUpperCase();

        const mapa = {
            RASCUNHO: { label: 'RASCUNHO', bg: 'secondary' },
            PREVISTA: { label: 'SUBMETIDA', bg: 'primary' },
            SUBMETIDA: { label: 'SUBMETIDA', bg: 'primary' },
            A_APRESENTAR: { label: 'A APRESENTAR', bg: 'success' },
            CONFIRMADA: { label: 'A APRESENTAR', bg: 'success' },
            EM_ANDAMENTO: { label: 'EM ANDAMENTO', bg: 'warning' },
            ENCERRADA: { label: 'ENCERRADA', bg: 'dark' },
            CANCELADA: { label: 'CANCELADA', bg: 'danger' },
            EM_AVALIACAO: { label: 'EM AVALIACAO', bg: 'warning' },
            REJEITADO: { label: 'REJEITADA', bg: 'danger' },
            REPROVADA: { label: 'REJEITADA', bg: 'danger' },
            REPROVADO: { label: 'REJEITADA', bg: 'danger' },
            APROVADO_COM_RESSALVAS: {
                label: 'ACEITO COM RESSALVAS',
                bg: 'info',
            },
            ACEITA: { label: 'ACEITA', bg: 'success' },
            APROVADA: { label: 'ACEITA', bg: 'success' },
            APROVADO: { label: 'ACEITA', bg: 'success' },
            CONVERTIDA_EM_ATRACAO: { label: 'A APRESENTAR', bg: 'success' },
            FINALIZADA: { label: 'FINALIZADA', bg: 'success' },
        };

        return (
            mapa[statusNormalizado] || {
                label: statusNormalizado || 'N/A',
                bg: 'secondary',
            }
        );
    };

    const getStatusLabel = (item) =>
        getStatusConfig(item?.status || item?.status_submissao).label;

    const formatarDataHoraCurta = (valor) => {
        if (!valor) return '';
        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return '';
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBorderColor = (item) => {
        const status = String(item?.status || item?.status_submissao || '')
            .trim()
            .toUpperCase();

        const mapa = {
            RASCUNHO: '#6c757d',
            PREVISTA: '#0d6efd',
            SUBMETIDA: '#0d6efd',
            EM_AVALIACAO: '#fd7e14',
            APROVADA: '#198754',
            ACEITA: '#198754',
            APROVADO_COM_RESSALVAS: '#0dcaf0',
            REPROVADA: '#dc3545',
            REJEITADA: '#dc3545',
            CANCELADA: '#dc3545',
            CONFIRMADA: '#198754',
            A_APRESENTAR: '#198754',
            EM_ANDAMENTO: '#ffc107',
            ENCERRADA: '#212529',
            FINALIZADA: '#20c997',
        };

        return mapa[status] || '#6c757d';
    };

    const getChaveAvaliacaoItem = (item, tipo) => `${tipo}-${item?.id}`;

    const verificarAvaliacoesDisponiveis = async (item, tipo) => {
        if (!item?.id) return false;

        const chave = getChaveAvaliacaoItem(item, tipo);

        try {
            let avals = [];

            if (tipo === 'atracoes') {
                const dados = await listarAvaliacoesAtracao({
                    atracao: item.id,
                });
                avals = Array.isArray(dados) ? dados : [];
            } else {
                const dados = await listarAvaliacoesSubmissao({
                    submissao: item.id,
                });
                avals = Array.isArray(dados) ? dados : [];
            }

            const temAvaliacoes =
                avals.length > 0 ||
                Boolean(
                    item?.avaliacoes?.length ||
                        item?.avaliacao?.length ||
                        item?.avaliacoes_atracao?.length ||
                        item?.avaliacoes_submissao?.length,
                );

            setAvaliacoesDisponiveisMap((prev) => ({
                ...prev,
                [chave]: temAvaliacoes,
            }));
            return temAvaliacoes;
        } catch (error) {
            console.error('Erro ao verificar avaliações:', error);
            setAvaliacoesDisponiveisMap((prev) => ({
                ...prev,
                [chave]: false,
            }));
            return false;
        }
    };

    useEffect(() => {
        const itensAtuais =
            tipoListagem === 'atracoes' ? atracoesInscritas : submissoes;

        if (!Array.isArray(itensAtuais) || itensAtuais.length === 0) {
            setAvaliacoesDisponiveisMap({});
            return;
        }

        setAvaliacoesDisponiveisMap({});

        itensAtuais.forEach((item) => {
            verificarAvaliacoesDisponiveis(item, tipoListagem);
        });
    }, [tipoListagem, atracoesInscritas, submissoes]);

    const abrirModalAvaliacoes = async (item, tipo = tipoListagem) => {
        if (!item?.id) return;
        setMostrarModalAvaliacoes(true);
        setCarregandoAvaliacoes(true);

        try {
            let dados = [];
            let criterios = [];
            let listarItens = null;
            let paramAvaliacao = null;
            let tipoItem = 'submissão';

            if (tipo === 'atracoes') {
                tipoItem = 'atração';
                dados = await listarAvaliacoesAtracao({ atracao: item.id });
                criterios = await pegarCriteriosPorModalidade();
                listarItens = listarItensAvaliacaoAtracao;
                paramAvaliacao = 'avaliacao_atracao';
            } else {
                dados = await listarAvaliacoesSubmissao({ submissao: item.id });
                criterios = await pegarCriteriosSubmissaoPorModalidade();
                listarItens = listarItensAvaliacaoSubmissao;
                paramAvaliacao = 'avaliacao_submissao';
            }

            const avals = Array.isArray(dados) ? dados : [];
            setAvaliacoesLista(avals);

            const itensPorAvaliacaoEntries = await Promise.all(
                avals.map(async (avaliacao) => {
                    try {
                        const itens = await listarItens(avaliacao.id);
                        const itensComCriterio = (itens || []).map((it) => ({
                            ...it,
                            criterio_nome:
                                (criterios || []).find(
                                    (criterio) =>
                                        criterio.id === it.criterio_avaliacao,
                                )?.nome || `Critério ${it.criterio_avaliacao}`,
                        }));
                        return [avaliacao.id, itensComCriterio];
                    } catch {
                        return [avaliacao.id, []];
                    }
                }),
            );

            setAvaliacoesItensMap(Object.fromEntries(itensPorAvaliacaoEntries));
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            setAvaliacoesLista([]);
            setAvaliacoesItensMap({});
            setAlerta({
                mensagem: `Não foi possível carregar as avaliações desta ${tipoItem}.`,
                variacao: 'danger',
            });
        } finally {
            setCarregandoAvaliacoes(false);
        }
    };

    const abrirModalEdicao = (item, somenteLeitura = false) => {
        const sugestaoAtual = item.sugestao_vagas ?? '';
        const fonteAutoria =
            Array.isArray(item.autorias) && item.autorias.length > 0
                ? item.autorias
                : Array.isArray(item.equipe)
                  ? item.equipe
                  : [];

        setItemEmEdicao(item);
        setFormEdicao({
            id: item.id,
            titulo: item?.titulo || '',
            resumo: item?.resumo || '',
            palavras_chave: item?.palavras_chave || '',
            modalidade: item?.modalidade || '',
            nivel_ensino: normalizarNiveisEnsino(item?.nivel_ensino),
            area_conhecimento: item?.area_conhecimento || '',
            acessibilidade: item?.acessibilidade || false,
            evento: item?.evento,
            sugestao_vagas: sugestaoAtual,
            status:
                tipoListagem === 'submissoes' ? '' : item?.status || 'PREVISTA',
            equipe: fonteAutoria.map((membro) => ({
                user_id:
                    membro.user_id ||
                    membro.usuario ||
                    (usuariosEdicao || []).find(
                        (usuario) =>
                            getNomeUsuario(usuario).trim().toLowerCase() ===
                            (membro.nome || membro.usuario_nome || '')
                                .trim()
                                .toLowerCase(),
                    )?.id ||
                    '',
                nome: membro.nome || membro.usuario_nome || '',
                instituicao_curso: membro.instituicao_curso || '',
                funcao:
                    membro.funcao === 'COLABORADOR'
                        ? 'COAUTOR'
                        : membro.funcao || membro.tipo || '',
            })),
        });
        setHabilitarSugestaoVagasEdicao(
            sugestaoAtual !== '' &&
                sugestaoAtual !== null &&
                sugestaoAtual !== undefined,
        );
        setSomenteLeituraModal(somenteLeitura);
        setMostrarModalEdicao(true);
    };

    const fecharModalEdicao = () => {
        setItemEmEdicao(null);
        setMostrarModalEdicao(false);
        setSomenteLeituraModal(false);
        setFormEdicao({
            id: null,
            titulo: '',
            resumo: '',
            palavras_chave: '',
            modalidade: '',
            nivel_ensino: '',
            area_conhecimento: '',
            acessibilidade: false,
            evento: '',
            sugestao_vagas: '',
            equipe: [],
            status: '',
        });
    };

    const recarregarParticipacoes = async () => {
        if (!eventoSelecionadoId) return;

        const [dadosAtracoes, dadosSubmissoes] = await Promise.all([
            listarAtracoes(eventoSelecionadoId),
            listarSubmissoes({
                evento: eventoSelecionadoId,
                minhas: true,
            }),
        ]);

        setAtracoes(Array.isArray(dadosAtracoes) ? dadosAtracoes : []);
        setSubmissoes(Array.isArray(dadosSubmissoes) ? dadosSubmissoes : []);
    };

    const handleSalvarEdicao = async () => {
        if (!itemEmEdicao?.id || !formEdicao.titulo?.trim()) {
            return;
        }

        const tituloPalavras = contarPalavras(formEdicao.titulo || '');
        const nivelEnsinoVazio = !String(formEdicao.nivel_ensino || '').trim();

        if (
            !formEdicao.titulo ||
            !formEdicao.evento ||
            !formEdicao.modalidade ||
            nivelEnsinoVazio ||
            !formEdicao.area_conhecimento
        ) {
            setAlerta({
                mensagem:
                    'Preencha titulo, evento, modalidade, nivel de ensino e area de conhecimento.',
                variacao: 'warning',
            });
            return;
        }

        if (tituloPalavras < LIMITS_EDICAO.titulo.minWords) {
            setAlerta({
                mensagem: `O título deve ter pelo menos ${LIMITS_EDICAO.titulo.minWords} palavra.`,
                variacao: 'warning',
            });
            return;
        }

        if (tituloPalavras > LIMITS_EDICAO.titulo.maxWords) {
            setAlerta({
                mensagem: `O título deve ter no máximo ${LIMITS_EDICAO.titulo.maxWords} palavras.`,
                variacao: 'warning',
            });
            return;
        }

        if (
            (formEdicao.palavras_chave || '').length >
            LIMITS_EDICAO.palavrasChave.maxChars
        ) {
            setAlerta({
                mensagem: `Palavras-chave deve ter no máximo ${LIMITS_EDICAO.palavrasChave.maxChars} caracteres.`,
                variacao: 'warning',
            });
            return;
        }

        const equipeComUsuario = (formEdicao.equipe || []).filter(
            (membro) => String(membro?.user_id || '').trim() !== '',
        );

        if (equipeComUsuario.length === 0) {
            setAlerta({
                mensagem:
                    'Adicione pelo menos um membro com usuário selecionado na equipe.',
                variacao: 'warning',
            });
            return;
        }

        if (equipeComUsuario.some((membro) => !membro?.funcao)) {
            setAlerta({
                mensagem: 'Defina um papel para todos os membros da equipe.',
                variacao: 'warning',
            });
            return;
        }

        const totalAutores = equipeComUsuario.filter(
            (membro) => membro?.funcao === 'AUTOR',
        ).length;
        if (totalAutores !== 1) {
            setAlerta({
                mensagem: 'A equipe deve possuir exatamente 1 Autor.',
                variacao: 'warning',
            });
            return;
        }

        try {
            setSalvandoEdicao(true);

            if (tipoListagem === 'submissoes') {
                await editarSubmissao(itemEmEdicao.id, formEdicao);
            } else {
                await editarAtracao(itemEmEdicao.id, formEdicao);
            }

            await recarregarParticipacoes();
            setAlerta({
                mensagem: `${
                    tipoListagem === 'submissoes' ? 'Submissão' : 'Atração'
                } atualizado com sucesso.`,
                variacao: 'success',
            });
            fecharModalEdicao();
        } catch (error) {
            const mensagemErro = error?.response?.data
                ? JSON.stringify(error.response.data)
                : 'Não foi possível salvar a edição.';
            setAlerta({
                mensagem: mensagemErro,
                variacao: 'danger',
            });
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleExcluir = async (item) => {
        if (!item?.id) return;

        const confirmou = window.confirm(
            `Deseja realmente excluir ${
                tipoListagem === 'submissoes'
                    ? 'esta submissão'
                    : 'esta atração'
            }?`,
        );
        if (!confirmou) return;

        try {
            if (tipoListagem === 'submissoes') {
                await excluirSubmissao(item.id);
            } else {
                await excluirAtracao(item.id);
            }

            await recarregarParticipacoes();
            setAlerta({
                mensagem: `${
                    tipoListagem === 'submissoes' ? 'Submissão' : 'Atração'
                } excluído com sucesso.`,
                variacao: 'success',
            });
        } catch (error) {
            setAlerta({
                mensagem:
                    error?.response?.data?.detail ||
                    error?.response?.data?.erro ||
                    `Não foi possível excluir o ${
                        tipoListagem === 'submissoes' ? 'submissão' : 'atração'
                    }.`,
                variacao: 'danger',
            });
        }
    };

    useEffect(() => {
        // Evita carregar um status selecionado de um tipo de listagem para outro.
        setFiltroStatus('');
        setTermoBusca('');
    }, [tipoListagem]);

    const baseListagemAtual =
        tipoListagem === 'atracoes' ? atracoesInscritas : submissoes;

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill">
                <Container fluid className="p-0">
                    <Row
                        className="w-100 p-0"
                        style={{
                            backgroundImage:
                                ' linear-gradient(to right, rgb(23, 136, 44) 0px, rgb(0, 81, 15) 100%)',
                        }}
                    >
                        <Col className="text-center text-white pb-4 d-flex flex-column my-3 align-items-center">
                            <h1 className="fw-bold">Minhas Participações</h1>

                            <span className="fs-5">
                                Veja suas partipações do evento selecionado.
                            </span>
                        </Col>
                    </Row>

                    <Row className="m-0">
                        <Col
                            xs={12}
                            md={10}
                            lg={8}
                            className="mx-auto d-flex flex-column align-items-center my-5 gap-4"
                        >
                            {loading ||
                            carregandoInscricoes ||
                            carregandoEvento ||
                            carregandoUsuario ||
                            carregandoInscricoesEvento ? (
                                <div className="text-center py-5">
                                    <Spinner
                                        animation="border"
                                        variant="success"
                                    />
                                    <p className="mt-2 text-muted mb-0">
                                        Carregando participações...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {!inscricaoEvento && (
                                        <div className="w-100">
                                            <div className="alert alert-warning mb-0">
                                                Você não está inscrito neste
                                                evento. A interface permanece
                                                disponível para consulta.
                                            </div>
                                        </div>
                                    )}
                                    <div className="w-100">
                                        <Container fluid className="px-3 py-1">
                                            <Row className="mb-2">
                                                <Col>
                                                    <h5 className="mb-1 text-success fw-semibold text-center">
                                                        Selecione o tipo de
                                                        participação que deseja
                                                        visualizar
                                                    </h5>
                                                    <p className="text-muted text-center mb-0">
                                                        Alterne entre submissões
                                                        e atrações para
                                                        consultar seus
                                                        registros.
                                                    </p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col className="d-flex justify-content-center gap-2 flex-wrap">
                                                    <Button
                                                        variant={
                                                            tipoListagem ===
                                                            'submissoes'
                                                                ? 'success'
                                                                : 'outline-success'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            setTipoListagem(
                                                                'submissoes',
                                                            )
                                                        }
                                                    >
                                                        Submissões
                                                    </Button>
                                                    <Button
                                                        variant={
                                                            tipoListagem ===
                                                            'atracoes'
                                                                ? 'success'
                                                                : 'outline-success'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            setTipoListagem(
                                                                'atracoes',
                                                            )
                                                        }
                                                    >
                                                        Atrações
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </div>

                                    <div className="w-100">
                                        <Container fluid className="px-3 py-1">
                                            <Row className="g-3 align-items-end">
                                                <Col md={12} lg={6}>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Buscar por título, resumo, autor..."
                                                        value={termoBusca}
                                                        onChange={(e) =>
                                                            setTermoBusca(
                                                                e.target.value,
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                '#eeeeee',
                                                        }}
                                                    />
                                                </Col>
                                                <Col md={6} lg={3}>
                                                    <Form.Select
                                                        value={filtroStatus}
                                                        onChange={(e) =>
                                                            setFiltroStatus(
                                                                e.target.value,
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                '#eeeeee',
                                                        }}
                                                    >
                                                        <option value="">
                                                            Todos status
                                                        </option>
                                                        {opcoesStatus.map(
                                                            (status) => (
                                                                <option
                                                                    key={status}
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {
                                                                        getStatusConfig(
                                                                            status,
                                                                        ).label
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </Form.Select>
                                                </Col>
                                                <Col md={6} lg={3}>
                                                    <Form.Select
                                                        value={ordenacao}
                                                        onChange={(e) =>
                                                            setOrdenacao(
                                                                e.target.value,
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                '#eeeeee',
                                                        }}
                                                    >
                                                        <option value="criacao">
                                                            Recente
                                                        </option>
                                                        <option value="titulo">
                                                            Título
                                                        </option>
                                                        <option value="status">
                                                            Status
                                                        </option>
                                                    </Form.Select>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </div>

                                    {itensFiltrados.length > 0 ? (
                                        itensFiltrados.map((item) => (
                                            <div
                                                key={item.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    abrirModalEdicao(item, true)
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === 'Enter' ||
                                                        event.key === ' '
                                                    ) {
                                                        event.preventDefault();
                                                        abrirModalEdicao(
                                                            item,
                                                            true,
                                                        );
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Card
                                                    corBorda={getStatusBorderColor(
                                                        item,
                                                    )}
                                                >
                                                    <Container
                                                        fluid
                                                        className="p-4"
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                            <h3 className="mb-0">
                                                                {item.titulo}
                                                            </h3>
                                                            <div className="d-flex gap-2">
                                                                <span className="badge bg-dark">
                                                                    {getStatusLabel(
                                                                        item,
                                                                    )}
                                                                </span>
                                                                {tipoListagem ===
                                                                'atracoes' ? (
                                                                    item.isAutor ? (
                                                                        <span className="badge bg-success">
                                                                            Autor
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge bg-secondary">
                                                                            Participante
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="badge bg-success">
                                                                        Submissão
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-muted mt-2 small">
                                                            <div>
                                                                <strong>
                                                                    Tipo:
                                                                </strong>{' '}
                                                                {item.tipo ||
                                                                    'Atração'}
                                                            </div>
                                                            <div>
                                                                <strong>
                                                                    Autor:
                                                                </strong>{' '}
                                                                {item.autor_nome ||
                                                                    (Array.isArray(
                                                                        item.autorias,
                                                                    ) &&
                                                                        item
                                                                            .autorias[0]
                                                                            ?.usuario_nome) ||
                                                                    '—'}
                                                            </div>
                                                            <div>
                                                                <strong>
                                                                    Orientador:
                                                                </strong>{' '}
                                                                {item.orientador_nome ||
                                                                    '—'}
                                                            </div>
                                                        </div>

                                                        <div className="d-flex gap-2 mt-3 flex-wrap">
                                                            {tipoListagem ===
                                                                'atracoes' &&
                                                                item.isAutor && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="success"
                                                                        className="fw-bold px-3 py-1"
                                                                        as={
                                                                            Link
                                                                        }
                                                                        to={`/listar_inscritos_atracao?atracaoId=${item.id}`}
                                                                        onClick={(
                                                                            event,
                                                                        ) =>
                                                                            event.stopPropagation()
                                                                        }
                                                                    >
                                                                        Inscritos
                                                                    </Button>
                                                                )}
                                                            {(tipoListagem ===
                                                                'atracoes' ||
                                                                tipoListagem ===
                                                                    'submissoes') &&
                                                                avaliacoesDisponiveisMap[
                                                                    `${tipoListagem}-${item?.id}`
                                                                ] && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-success"
                                                                        className="fw-bold px-3 py-1"
                                                                        onClick={(
                                                                            event,
                                                                        ) => {
                                                                            event.stopPropagation();
                                                                            abrirModalAvaliacoes(
                                                                                item,
                                                                                tipoListagem,
                                                                            );
                                                                        }}
                                                                    >
                                                                        Ver
                                                                        Avaliações
                                                                    </Button>
                                                                )}
                                                            {podeEditarItem(
                                                                item,
                                                            ) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="success"
                                                                    className="fw-bold px-3 py-1"
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        abrirModalEdicao(
                                                                            item,
                                                                        );
                                                                    }}
                                                                >
                                                                    Editar
                                                                </Button>
                                                            )}
                                                            {podeExcluirItem(
                                                                item,
                                                            ) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="danger"
                                                                    className="fw-bold px-3 py-1"
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        handleExcluir(
                                                                            item,
                                                                        );
                                                                    }}
                                                                >
                                                                    Excluir
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Container>
                                                </Card>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white w-100">
                                            <p className="text-muted mb-0">
                                                {baseListagemAtual.length === 0
                                                    ? tipoListagem ===
                                                      'submissoes'
                                                        ? 'Você ainda não possui submissões neste evento.'
                                                        : 'Você ainda não possui atrações neste evento.'
                                                    : 'Nenhum resultado encontrado para os filtros aplicados.'}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </Col>
                    </Row>
                </Container>
            </main>
            {erro && (
                <Alerta mensagem={erro} variacao="danger" duracao={5000} />
            )}
            {alerta && (
                <Alerta
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    duracao={3000}
                />
            )}
            <Modal
                show={mostrarModalAvaliacoes}
                onHide={() => setMostrarModalAvaliacoes(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Avaliações</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {carregandoAvaliacoes ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" variant="success" />
                        </div>
                    ) : avaliacoesLista.length === 0 ? (
                        <p className="text-muted">
                            Nenhuma avaliação disponível para esta item.
                        </p>
                    ) : (
                        <div>
                            {avaliacoesLista.map((avaliacao, index) => (
                                <div key={avaliacao.id} className="mb-3">
                                    <h6 className="mb-1">
                                        Avaliador {index + 1}
                                    </h6>
                                    <div className="small text-muted mb-1">
                                        <strong>Status:</strong>{' '}
                                        {avaliacao.status_aprovacao || '-'} •{' '}
                                        <strong>Nota:</strong>{' '}
                                        {avaliacao.nota_final ?? '-'} •{' '}
                                        <strong>Data:</strong>{' '}
                                        {formatarDataHoraCurta(
                                            avaliacao.data_avaliacao,
                                        ) || '-'}
                                    </div>
                                    <div>
                                        {avaliacao.parecer || (
                                            <span className="text-muted">
                                                Sem parecer.
                                            </span>
                                        )}
                                    </div>

                                    {avaliacoesItensMap[avaliacao.id] &&
                                    avaliacoesItensMap[avaliacao.id].length >
                                        0 ? (
                                        <div className="mt-2">
                                            <strong>Itens de Avaliação:</strong>
                                            <ul className="mb-2">
                                                {avaliacoesItensMap[
                                                    avaliacao.id
                                                ].map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="small"
                                                    >
                                                        {item.criterio_nome} —{' '}
                                                        <strong>
                                                            {item.nota}
                                                        </strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    <hr />
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setMostrarModalAvaliacoes(false)}
                    >
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            <EditarAtracaoModal
                show={mostrarModalEdicao}
                formEdicao={formEdicao}
                setFormEdicao={setFormEdicao}
                permitirEdicaoStatus={false}
                opcoesStatus={[]}
                opcoesEdicao={opcoesEdicao}
                modalidadeEdicaoDetalhe={modalidadeEdicaoDetalhe}
                habilitarSugestaoVagasEdicao={habilitarSugestaoVagasEdicao}
                setHabilitarSugestaoVagasEdicao={
                    setHabilitarSugestaoVagasEdicao
                }
                contarPalavras={contarPalavras}
                LIMITS_EDICAO={LIMITS_EDICAO}
                selecionarNivelEnsinoEdicao={selecionarNivelEnsinoEdicao}
                getAreasEventoEdicao={getAreasEventoEdicao}
                normalizarAreaEdicao={normalizarAreaEdicao}
                getNomeUsuario={getNomeUsuario}
                getNivelEnsinoMembroEdicao={getNivelEnsinoMembroEdicao}
                getUsuariosDisponiveisLinhaEdicao={
                    getUsuariosDisponiveisLinhaEdicao
                }
                handleAdicionarMembroEdicao={handleAdicionarMembroEdicao}
                handleRemoverMembroEdicao={handleRemoverMembroEdicao}
                handleMembroEdicaoChange={handleMembroEdicaoChange}
                salvandoEdicao={salvandoEdicao}
                somenteLeitura={somenteLeituraModal}
                onClose={fecharModalEdicao}
                onSalvar={handleSalvarEdicao}
            />
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </div>
    );
}
