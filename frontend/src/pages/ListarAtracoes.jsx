import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Col,
    Container,
    Dropdown,
    Form,
    ListGroup,
    Row,
    Spinner,
} from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import {
    MdAddCircle,
    MdArrowBack,
    MdCalendarToday,
    MdDelete,
    MdEdit,
    MdEvent,
    MdInfoOutline,
    MdLocalOffer,
    MdPerson,
    MdSchool,
} from 'react-icons/md';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Alerta from '../components/common/Alerta';
import Card from '../components/common/Card';
import EditarAtracaoModal from '../components/common/EditarAtracaoModal';
import ModalPopup from '../components/common/ModalPopup';
import Footer from '../components/footer/Footer';
import NavBar from '../components/nav_bar/NavBar';
import {
    buscarEventos,
    buscarOpcoesAtracao,
    buscarUsuarios,
    editarAtracao,
    excluirAtracao,
    listarAtracoes,
} from '../services/atracaoService';
import {
    editarSubmissao,
    excluirSubmissao,
    homologarSubmissao,
    listarSubmissoes,
    reprovarSubmissao,
} from '../services/submissoesService';
import { getSelectedEventoId } from '../utils/selectedEvento';
import { buscarEventoPorId } from '../services/eventoService';
import { pegarModalidade } from '../services/modalidadeService';
import { getCurrentUser } from '../services/authService';
import {
    listarAvaliacoesSubmissao,
    listarItensAvaliacaoSubmissao,
    pegarCriteriosSubmissaoPorModalidade,
} from '../services/avaliacaoSubmissaoService';

const LIMITS_EDICAO = {
    titulo: { minWords: 1, maxWords: 150 },
    palavrasChave: { maxChars: 100 },
};

export default function ListarAtracoes() {
    const navigate = useNavigate();
    const location = useLocation();
    const ehSubmissoes = location.pathname === '/listar_submissoes';
    const ehAtracoes = location.pathname === '/listar_atracoes';

    const [atracoes, setAtracoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [mostrarModalExclusao, setMostrarModalExclusao] = useState(false);
    const [atracaoSelecionada, setAtracaoSelecionada] = useState(null);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [bloqueioExclusao, setBloqueioExclusao] = useState({});
    const [bloqueioEdicao, setBloqueioEdicao] = useState({});

    // Filtros e ordenação
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroAutor, setFiltroAutor] = useState('');
    const [filtroModalidade, setFiltroModalidade] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('');
    const [ordenacao, setOrdenacao] = useState('criacao');
    const [paginaAtual, setPaginaAtual] = useState(1);

    const ITENS_POR_PAGINA = 10;

    const [formEdicao, setFormEdicao] = useState({
        id: null,
        titulo: '',
        resumo: '',
        status: 'PREVISTA',
    });
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
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
    const [usuarioLogadoEdicao, setUsuarioLogadoEdicao] = useState(null);
    const [mostrarModalAvaliacoes, setMostrarModalAvaliacoes] = useState(false);
    const [avaliacoesLista, setAvaliacoesLista] = useState([]);
    const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false);
    const [avaliacoesItensMap, setAvaliacoesItensMap] = useState({});

    const eventoFiltroId = getSelectedEventoId();
    const gruposUsuarioNormalizados = useMemo(() => {
        const grupos = Array.isArray(usuarioLogado?.groups)
            ? usuarioLogado.groups
            : [];
        return grupos
            .map((group) => (typeof group === 'string' ? group : group?.name))
            .filter(Boolean)
            .map((group) => String(group).trim().toLowerCase());
    }, [usuarioLogado]);

    const eventoSelecionadoLista = useMemo(() => {
        if (!eventoFiltroId) return null;

        return (
            eventosEdicao.find(
                (evento) => String(evento.id) === String(eventoFiltroId),
            ) || null
        );
    }, [eventosEdicao, eventoFiltroId]);

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

    const mostrarAlerta = useCallback((mensagem, variacao = 'danger') => {
        setAlerta((prev) => ({
            ...prev,
            mensagem,
            variacao,
            reacao: (prev.reacao || 0) + 1,
        }));
    }, []);

    const carregarAtracoes = useCallback(async () => {
        try {
            setCarregando(true);
            const eventoId = getSelectedEventoId();
            const params = {
                ...(filtroStatus && { status: filtroStatus }),
                ...(filtroModalidade && { modalidade: filtroModalidade }),
                ...(termoBusca.trim() && { busca: termoBusca.trim() }),
                ...(ordenacao && { ordenar: ordenacao }),
            };
            const dados = ehSubmissoes
                ? await listarSubmissoes({ evento: eventoId, ...params })
                : await listarAtracoes(eventoId, params);
            setAtracoes(dados);
            setAlerta((prev) => ({ ...prev, mensagem: '' }));
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
            const detalhe = error?.response?.data?.detail;
            mostrarAlerta(detalhe || 'Não foi possível carregar os itens.');
        } finally {
            setCarregando(false);
        }
    }, [mostrarAlerta, ehSubmissoes, filtroStatus, filtroModalidade, termoBusca, ordenacao]);

    useEffect(() => {
        carregarAtracoes();
    }, [carregarAtracoes]);

    // Atualizar bloqueios de exclusão quando atracoes mudam
    useEffect(() => {
        const novosBloqueios = {};
        atracoes.forEach((item) => {
            const motivo = obterMotivoBloqueioExclusao(item);
            if (motivo) {
                novosBloqueios[item.id] = motivo;
            }
        });
        setBloqueioExclusao(novosBloqueios);
    }, [atracoes]);

    useEffect(() => {
        const carregarOpcoesEdicao = async () => {
            const [
                dadosOpcoes,
                dadosEventos,
                dadosUsuarios,
                dadosUsuarioLogado,
            ] = await Promise.allSettled([
                buscarOpcoesAtracao(),
                buscarEventos(),
                buscarUsuarios(),
                getCurrentUser(),
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

            if (dadosUsuarioLogado.status === 'fulfilled') {
                setUsuarioLogadoEdicao(dadosUsuarioLogado.value || null);
                setUsuarioLogado(dadosUsuarioLogado.value || null);
            }
        };

        carregarOpcoesEdicao();
    }, []);

    useEffect(() => {
        const carregarDetalheEventoEdicao = async () => {
            if (!mostrarModalEdicao || !formEdicao.evento) {
                setEventoEdicaoDetalhe(null);
                return;
            }

            const eventoResumo = eventosEdicao.find(
                (evento) => String(evento.id) === String(formEdicao.evento),
            );

            if (eventoResumo?.area_conhecimento_detalhes?.length) {
                setEventoEdicaoDetalhe(eventoResumo);
                return;
            }

            try {
                const detalhe = await buscarEventoPorId(formEdicao.evento);
                setEventoEdicaoDetalhe(detalhe);
            } catch (error) {
                console.error(
                    'Erro ao carregar detalhe do evento na edicao:',
                    error,
                );
                setEventoEdicaoDetalhe(null);
            }
        };

        carregarDetalheEventoEdicao();
    }, [mostrarModalEdicao, formEdicao.evento, eventosEdicao]);

    useEffect(() => {
        const carregarDetalheModalidadeEdicao = async () => {
            if (!mostrarModalEdicao || !formEdicao.modalidade) {
                setModalidadeEdicaoDetalhe(null);
                return;
            }

            try {
                const detalhe = await pegarModalidade(formEdicao.modalidade);
                setModalidadeEdicaoDetalhe(detalhe);
            } catch (error) {
                console.error(
                    'Erro ao carregar detalhe da modalidade na edicao:',
                    error,
                );
                setModalidadeEdicaoDetalhe(null);
            }
        };

        carregarDetalheModalidadeEdicao();
    }, [mostrarModalEdicao, formEdicao.modalidade]);

    const getStatusConfig = (status) => {
        const statusNormalizado = (status || '').toUpperCase();

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

    const getStatusBorderColor = (status) => {
        const statusNormalizado = (status || '').toUpperCase();

        const mapa = {
            RASCUNHO: '#6c757d',
            PREVISTA: '#0d6efd',
            SUBMETIDA: '#0d6efd',
            A_APRESENTAR: '#198754',
            CONFIRMADA: '#198754',
            EM_ANDAMENTO: '#ffc107',
            ENCERRADA: '#212529',
            CANCELADA: '#dc3545',
            EM_AVALIACAO: '#fd7e14',
            REJEITADO: '#dc3545',
            REPROVADA: '#dc3545',
            REPROVADO: '#dc3545',
            APROVADO_COM_RESSALVAS: '#0dcaf0',
            ACEITA: '#198754',
            APROVADA: '#198754',
            APROVADO: '#198754',
            CONVERTIDA_EM_ATRACAO: '#198754',
            FINALIZADA: '#20c997',
        };

        return mapa[statusNormalizado] || '#6c757d';
    };

    const opcoesStatusEdicao = ehSubmissoes
        ? [
                            { value: '', label: 'Selecione uma ação' },
              { value: 'APROVADA', label: 'Aceita' },
              { value: 'REPROVADA', label: 'Rejeitada' },
          ]
        : [
              { value: 'CONFIRMADA', label: 'A Apresentar' },
              { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
              { value: 'ENCERRADA', label: 'Encerrada' },
              { value: 'CANCELADA', label: 'Cancelada' },
          ];

    // Função para determinar se usuário é admin
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

    // Função para determinar se usuário é coordenador
    const isCoordenador = () =>
        gruposUsuarioNormalizados.includes('coordenador');

    // Função para determinar se usuário é avaliador
    const isAvaliador = () => gruposUsuarioNormalizados.includes('avaliador');

    const getMinhaAutoria = (item) => {
        if (isAdmin()) return null;

        const autorias =
            Array.isArray(item?.autorias) && item.autorias.length > 0
                ? item.autorias
                : Array.isArray(item?.equipe)
                  ? item.equipe
                  : [];

        const usuarioId = String(usuarioLogado?.id || '').trim();
        const usuarioNome = String(
            usuarioLogado?.username || usuarioLogado?.nome || '',
        )
            .trim()
            .toLowerCase();

        const autoriaEncontrada = autorias.find((autoria) => {
            const idsPossiveis = [
                autoria?.usuario,
                autoria?.user_id,
                autoria?.perfil_usuario,
            ]
                .map((valor) => String(valor || '').trim())
                .filter(Boolean);

            if (usuarioId && idsPossiveis.includes(usuarioId)) {
                return true;
            }

            const nomeAutoria = String(autoria?.nome || '')
                .trim()
                .toLowerCase();
            return usuarioNome && nomeAutoria === usuarioNome;
        });

        if (!autoriaEncontrada) return null;

        const tipoAutoria =
            autoriaEncontrada?.funcao ||
            autoriaEncontrada?.tipo ||
            autoriaEncontrada?.papel ||
            'AUTORIA';

        return String(tipoAutoria).trim().toUpperCase();
    };

    const getCoresAutoria = (tipoAutoria) => {
        const tipo = String(tipoAutoria || '')
            .trim()
            .toUpperCase();
        const mapa = {
            AUTOR: { fundo: '#1D4ED8', texto: '#FFFFFF' },
            COAUTOR: { fundo: '#0F766E', texto: '#FFFFFF' },
            ORIENTADOR: { fundo: '#7C3AED', texto: '#FFFFFF' },
            AUTORIA: { fundo: '#4B5563', texto: '#FFFFFF' },
        };

        return mapa[tipo] || mapa.AUTORIA;
    };

    // Função para determinar se usuário é autor do item
    const isAutor = (item) => {
        if (!usuarioLogado) return false;
        if (isAdmin()) return true;

        return Boolean(getMinhaAutoria(item));
    };

    // Função para determinar se coordenador gerencia o evento
    const coordenadorGerenciaEvento = (item) => {
        if (!isCoordenador()) return false;
        return (
            usuarioLogado?.eventos_coordenados?.includes(item.evento) || false
        );
    };

    const eventoTemAvaliacaoPreviaAberta = (item) => {
        const evento = (eventosEdicao || []).find(
            (eventoItem) => String(eventoItem.id) === String(item.evento),
        );

        if (!evento || !Array.isArray(evento.etapas)) {
            return false;
        }

        const agora = new Date();
        return evento.etapas.some((etapa) => {
            if (
                String(etapa.tipo_etapa || '').toUpperCase() !==
                'AVALIACAO_PREVIA'
            ) {
                return false;
            }
            const inicio = etapa.data_inicio
                ? new Date(etapa.data_inicio)
                : null;
            const fim = etapa.data_fim ? new Date(etapa.data_fim) : null;
            return inicio && fim && inicio <= agora && agora <= fim;
        });
    };

    const normalizarStatusParaPermissao = (status) => {
        return String(status || '').toUpperCase();
    };

    // Função para validar se pode editar
    const podeEditar = (item) => {
        if (isAdmin()) return true;

        const status = normalizarStatusParaPermissao(item.status);
        const statusPermitidosCoordenador = [
            'PREVISTA',
            'SUBMETIDA',
            'CONFIRMADA',
            'A_APRESENTAR',
            'RASCUNHO',
        ];
        const statusPermitidosUsuario = ['RASCUNHO'];

        if (isCoordenador()) {
            if (!coordenadorGerenciaEvento(item) && !isAutor(item))
                return false;
            return statusPermitidosCoordenador.includes(status);
        }

        if (!isAutor(item)) return false;
        if (statusPermitidosUsuario.includes(status)) {
            return true;
        }

        if (status === 'APROVADO_COM_RESSALVAS') {
            return eventoTemAvaliacaoPreviaAberta(item);
        }

        return false;
    };

    // Função para validar se pode excluir
    const podeExcluir = (item) => {
        if (isAdmin()) return true;

        if (!podeEditar(item)) return false; // Se não pode editar, não pode excluir

        const status = normalizarStatusParaPermissao(item.status);
        const statusPermitidos = ['PREVISTA', 'SUBMETIDA', 'RASCUNHO'];

        return statusPermitidos.includes(status);
    };

    // Função para obter motivo do bloqueio de exclusão
    const obterMotivoBloqueioExclusao = (item) => {
        if (isAdmin()) return null;

        const status = normalizarStatusParaPermissao(item.status);
        const statusPermitidos = ['PREVISTA', 'SUBMETIDA', 'RASCUNHO'];

        if (!statusPermitidos.includes(status)) {
            return `Exclusão não permitida para itens com status "${
                getStatusConfig(status).label
            }".`;
        }

        return null;
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

    const normalizarTexto = (texto) =>
        (texto || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

    const getEventoNome = (eventoId) => {
        const evento = (eventosEdicao || []).find(
            (item) => String(item.id) === String(eventoId),
        );
        return evento?.nome || `ID ${eventoId}`;
    };

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

    const getTermosDestaque = (item) => {
        const maxTermos = 4;

        const termosPalavrasChave = String(item?.palavras_chave || '')
            .split(/[;,]/)
            .map((termo) => termo.trim())
            .filter((termo) => termo.length >= 3);

        if (termosPalavrasChave.length > 0) {
            return [...new Set(termosPalavrasChave)].slice(0, maxTermos);
        }

        const stopwords = new Set([
            'para',
            'como',
            'entre',
            'sobre',
            'com',
            'sem',
            'dos',
            'das',
            'que',
            'uma',
            'um',
            'nos',
            'nas',
            'por',
            'ser',
            'sao',
            'são',
            'seu',
            'sua',
            'seus',
            'suas',
            'tambem',
            'também',
            'mais',
            'menos',
            'muito',
            'muita',
        ]);

        const termosResumo = String(item?.resumo || '')
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .split(/\s+/)
            .map((termo) => termo.trim())
            .filter((termo) => termo.length >= 5 && !stopwords.has(termo));

        return [...new Set(termosResumo)].slice(0, maxTermos);
    };

    const atracoesFiltradas = useMemo(() => {
        let resultado = [...atracoes];

        // Filtro de autor (client-side, pois não tem suporte no backend ainda)
        if (filtroAutor) {
            resultado = resultado.filter((item) => {
                const autorias = item.autorias || item.equipe || [];
                return autorias.some((autoria) =>
                    normalizarTexto(autoria.nome || '').includes(
                        normalizarTexto(filtroAutor),
                    ),
                );
            });
        }

        // Filtro de nível (client-side)
        if (filtroNivel) {
            resultado = resultado.filter((item) => {
                const nivel = normalizarNiveisEnsino(item.nivel_ensino);
                return normalizarTexto(nivel).includes(
                    normalizarTexto(filtroNivel),
                );
            });
        }

        // Ordenação local apenas para campos sem suporte backend
        if (ordenacao === 'autor') {
            resultado.sort((a, b) =>
                (a.titulo || '').localeCompare(b.titulo || ''),
            );
        } else if (ordenacao === 'autor') {
            resultado.sort((a, b) => {
                const autorA = (
                    (a.autorias || a.equipe || [])[0]?.nome || ''
                ).toLowerCase();
                const autorB = (
                    (b.autorias || b.equipe || [])[0]?.nome || ''
                ).toLowerCase();
                return autorA.localeCompare(autorB);
            });
        } else if (ordenacao === 'status') {
            resultado.sort((a, b) => {
                const statusA = (a.status || '').toUpperCase();
                const statusB = (b.status || '').toUpperCase();
                return statusA.localeCompare(statusB);
            });
        } else if (ordenacao === 'modalidade') {
            resultado.sort((a, b) =>
                (a.modalidade || '').localeCompare(b.modalidade || ''),
            );
        } else if (ordenacao === 'nivel') {
            resultado.sort((a, b) => {
                const nivelA = normalizarNiveisEnsino(a.nivel_ensino);
                const nivelB = normalizarNiveisEnsino(b.nivel_ensino);
                return nivelA.localeCompare(nivelB);
            });
        } else {
            // Ordenação por criacao vem do backend; nenhuma ordenação local adicional
        }

        return resultado;
    }, [
        atracoes,
        filtroAutor,
        filtroNivel,
        ordenacao,
    ]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [
        termoBusca,
        filtroStatus,
        filtroAutor,
        filtroModalidade,
        filtroNivel,
        ordenacao,
    ]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(atracoesFiltradas.length / ITENS_POR_PAGINA),
    );
    const paginaAtualValida = Math.min(paginaAtual, totalPaginas);
    const indiceInicial = (paginaAtualValida - 1) * ITENS_POR_PAGINA;
    const atracoesPaginadas = atracoesFiltradas.slice(
        indiceInicial,
        indiceInicial + ITENS_POR_PAGINA,
    );

    const abrirModalEdicao = (atracao) => {
        const sugestaoAtual = atracao.sugestao_vagas ?? '';
        const fonteAutoria =
            Array.isArray(atracao.autorias) && atracao.autorias.length > 0
                ? atracao.autorias
                : Array.isArray(atracao.equipe)
                  ? atracao.equipe
                  : [];

        setFormEdicao({
            id: atracao.id,
            titulo: atracao.titulo || '',
            resumo: atracao.resumo || '',
            status: ehSubmissoes ? '' : atracao.status || 'PREVISTA',
            palavras_chave: atracao.palavras_chave || '',
            modalidade: atracao.modalidade || '',
            nivel_ensino: normalizarNiveisEnsino(atracao.nivel_ensino),
            area_conhecimento: atracao.area_conhecimento || '',
            acessibilidade: atracao.acessibilidade || false,
            evento: atracao.evento,
            sugestao_vagas: sugestaoAtual,
            equipe: fonteAutoria.map((membro) => ({
                user_id:
                    membro.user_id ||
                    membro.usuario ||
                    (usuariosEdicao || []).find(
                        (usuario) =>
                            getNomeUsuario(usuario).trim().toLowerCase() ===
                            (membro.nome || '').trim().toLowerCase(),
                    )?.id ||
                    '',
                nome: membro.nome || '',
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
        setMostrarModalEdicao(true);
    };

    const selecionarNivelEnsinoEdicao = (nivelValue) => {
        setFormEdicao((prev) => ({
            ...prev,
            nivel_ensino: nivelValue,
        }));
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
            if (String(usuarioLogadoEdicao?.id || '') === idUsuario) {
                return false;
            }
            return !idsSelecionadosEmOutrasLinhas.has(idUsuario);
        });
    };

    const handleSalvarEdicao = async () => {
        if (!formEdicao.id) return;

        const tituloPalavras = contarPalavras(formEdicao.titulo || '');

        const nivelEnsinoVazio = !String(formEdicao.nivel_ensino || '').trim();

        if (
            !formEdicao.titulo ||
            !formEdicao.evento ||
            !formEdicao.modalidade ||
            nivelEnsinoVazio ||
            !formEdicao.area_conhecimento
        ) {
            mostrarAlerta(
                'Preencha titulo, evento, modalidade, nivel de ensino e area de conhecimento.',
            );
            return;
        }

        if (tituloPalavras < LIMITS_EDICAO.titulo.minWords) {
            mostrarAlerta(
                `O título deve ter pelo menos ${LIMITS_EDICAO.titulo.minWords} palavra.`,
            );
            return;
        }

        if (tituloPalavras > LIMITS_EDICAO.titulo.maxWords) {
            mostrarAlerta(
                `O título deve ter no máximo ${LIMITS_EDICAO.titulo.maxWords} palavras.`,
            );
            return;
        }

        if (
            (formEdicao.palavras_chave || '').length >
            LIMITS_EDICAO.palavrasChave.maxChars
        ) {
            mostrarAlerta(
                `Palavras-chave deve ter no máximo ${LIMITS_EDICAO.palavrasChave.maxChars} caracteres.`,
            );
            return;
        }

        const equipeComUsuario = (formEdicao.equipe || []).filter(
            (membro) => String(membro?.user_id || '').trim() !== '',
        );
        if (equipeComUsuario.length === 0) {
            mostrarAlerta(
                'Adicione pelo menos um membro com usuário selecionado na equipe.',
            );
            return;
        }

        if (equipeComUsuario.some((membro) => !membro?.funcao)) {
            mostrarAlerta('Defina um papel para todos os membros da equipe.');
            return;
        }

        const totalAutores = equipeComUsuario.filter(
            (membro) => membro?.funcao === 'AUTOR',
        ).length;
        if (totalAutores !== 1) {
            mostrarAlerta('A equipe deve possuir exatamente 1 Autor.');
            return;
        }

        try {
            setSalvandoEdicao(true);
            if (ehSubmissoes) {
                const statusDestino = String(formEdicao.status || '').toUpperCase();

                if (!statusDestino) {
                    await editarSubmissao(formEdicao.id, formEdicao);
                } else if (
                    [
                        'APROVADA',
                        'APROVADO',
                        'ACEITA',
                        'CONFIRMADA',
                        'CONVERTIDA_EM_ATRACAO',
                    ].includes(statusDestino)
                ) {
                    await homologarSubmissao(formEdicao.id, formEdicao);
                } else if (
                    ['REPROVADA', 'REPROVADO', 'REJEITADA', 'REJEITADO'].includes(
                        statusDestino,
                    )
                ) {
                    await reprovarSubmissao(formEdicao.id, formEdicao);
                } else {
                    await editarSubmissao(formEdicao.id, {
                        ...formEdicao,
                        status_submissao: statusDestino,
                    });
                }
            } else {
                await editarAtracao(formEdicao.id, formEdicao);
            }

            mostrarAlerta(
                `${
                    ehSubmissoes ? 'Submissão' : 'Atração'
                } atualizado com sucesso.`,
                'success',
            );
            setMostrarModalEdicao(false);
            await carregarAtracoes();
        } catch (error) {
            console.error('Erro ao editar:', error);
            const mensagemErro = error.response?.data
                ? JSON.stringify(error.response.data)
                : `Não foi possível salvar a edição.`;
            mostrarAlerta(mensagemErro);
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleConfirmarExclusao = async () => {
        if (!atracaoSelecionada?.id) return;

        try {
            if (ehSubmissoes) {
                await excluirSubmissao(atracaoSelecionada.id);
            } else {
                await excluirAtracao(atracaoSelecionada.id);
            }
            mostrarAlerta(
                `${
                    ehSubmissoes ? 'Submissão' : 'Atração'
                } excluído com sucesso.`,
                'success',
            );
            setMostrarModalExclusao(false);
            setAtracaoSelecionada(null);
            await carregarAtracoes();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            mostrarAlerta(
                `Não foi possível excluir o ${
                    ehSubmissoes ? 'submissão' : 'atração'
                }.`,
            );
        }
    };

    const abrirModalAvaliacoes = async (atracao) => {
        if (!atracao?.id) return;
        setMostrarModalAvaliacoes(true);
        setCarregandoAvaliacoes(true);
        try {
            const dados = await listarAvaliacoesSubmissao({
                submissao: atracao.id,
            });
            const avals = dados || [];
            setAvaliacoesLista(avals);

            // buscar criterios e itens para cada avaliação
            const criterios = await pegarCriteriosSubmissaoPorModalidade();

            const itensPorAvaliacaoEntries = await Promise.all(
                avals.map(async (a) => {
                    try {
                        const itens = await listarItensAvaliacaoSubmissao(a.id);
                        const itensComCriterio = (itens || []).map((it) => ({
                            ...it,
                            criterio_nome:
                                (criterios || []).find(
                                    (c) => c.id === it.criterio_avaliacao,
                                )?.nome || `Critério ${it.criterio_avaliacao}`,
                        }));
                        return [a.id, itensComCriterio];
                    } catch (e) {
                        return [a.id, []];
                    }
                }),
            );

            const mapa = Object.fromEntries(itensPorAvaliacaoEntries);
            setAvaliacoesItensMap(mapa);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            mostrarAlerta(
                'Não foi possível carregar as avaliações desta submissão.',
            );
            setAvaliacoesLista([]);
            setAvaliacoesItensMap({});
        } finally {
            setCarregandoAvaliacoes(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    {alerta.mensagem && (
                        <Alerta
                            mensagem={alerta.mensagem}
                            variacao={alerta.variacao}
                            reacao={alerta.reacao}
                        />
                    )}

                    <Card corBorda="transparent">
                        <Container fluid className="mb-5 px-4">
                            <Row className="pt-5 pb-2">
                                <Col className="d-flex align-items-center justify-content-center">
                                    <MdEvent color="#00A44B" size={35} />
                                    <h3
                                        className="fw-bold ms-2 mb-0"
                                        style={{ color: '#00A44B' }}
                                    >
                                        {ehSubmissoes
                                            ? 'Gerenciar Submissões'
                                            : 'Gerenciar Atrações'}
                                    </h3>
                                </Col>
                            </Row>
                            <hr className="mb-4" />

                            {/* Filtros e Ordenação */}
                            <div
                                className="mb-4 p-3 rounded-4"
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                }}
                            >
                                <Row className="g-3 align-items-end">
                                    <Col md={12} lg={7}>
                                        <Form.Group>
                                            <Form.Label
                                                className="fw-bold"
                                                style={{
                                                    color: '#00A44B',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Buscar{' '}
                                                {ehSubmissoes
                                                    ? 'submissão'
                                                    : 'atração'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={termoBusca}
                                                onChange={(e) =>
                                                    setTermoBusca(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={`Digite titulo, tipo, local ou status`}
                                                style={{
                                                    backgroundColor: '#eeeeee',
                                                    border: '1px solid #ced4da',
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12} lg={5}>
                                        <Form.Group>
                                            <Form.Label
                                                className="fw-bold"
                                                style={{
                                                    color: '#000',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Ordenar por
                                            </Form.Label>
                                            <Form.Select
                                                value={ordenacao}
                                                onChange={(e) =>
                                                    setOrdenacao(e.target.value)
                                                }
                                                style={{
                                                    backgroundColor: '#eeeeee',
                                                    border: '1px solid #ced4da',
                                                }}
                                            >
                                                <option value="criacao">
                                                    Criação (Recente)
                                                </option>
                                                <option value="titulo">
                                                    Título
                                                </option>
                                                <option value="autor">
                                                    Autor
                                                </option>
                                                <option value="status">
                                                    Status
                                                </option>
                                                <option value="modalidade">
                                                    Modalidade
                                                </option>
                                                <option value="nivel">
                                                    Nível de Ensino
                                                </option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* Filtros Avançados */}
                            <div
                                className="mb-4 p-3 rounded-4"
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e9ecef',
                                }}
                            >
                                <Row className="g-3 align-items-end">
                                    <Col md={6} lg={3}>
                                        <Form.Group>
                                            <Form.Label
                                                style={{
                                                    fontSize: '0.85rem',
                                                    color: '#000',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Status
                                            </Form.Label>
                                            <Form.Select
                                                value={filtroStatus}
                                                onChange={(e) =>
                                                    setFiltroStatus(
                                                        e.target.value,
                                                    )
                                                }
                                                size="sm"
                                                style={{
                                                    backgroundColor: '#eeeeee',
                                                    border: '1px solid #ced4da',
                                                }}
                                            >
                                                <option value="">Todos</option>
                                                {ehSubmissoes ? (
                                                    <>
                                                        <option value="RASCUNHO">
                                                            Rascunho
                                                        </option>
                                                        <option value="PREVISTA">
                                                            Submetida
                                                        </option>
                                                        <option value="EM_AVALIACAO">
                                                            Em Avaliação
                                                        </option>
                                                        <option value="REJEITADO">
                                                            Rejeitada
                                                        </option>
                                                        <option value="APROVADO_COM_RESSALVAS">
                                                            Aceito com Ressalvas
                                                        </option>
                                                        <option value="ACEITA">
                                                            Aceita
                                                        </option>
                                                        <option value="CANCELADA">
                                                            Cancelada
                                                        </option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="A_APRESENTAR">
                                                            A Apresentar
                                                        </option>
                                                        <option value="EM_ANDAMENTO">
                                                            Em Andamento
                                                        </option>
                                                        <option value="ENCERRADA">
                                                            Encerrada
                                                        </option>
                                                        <option value="CANCELADA">
                                                            Cancelada
                                                        </option>
                                                        <option value="EM_AVALIACAO">
                                                            Em Avaliação
                                                        </option>
                                                        <option value="FINALIZADA">
                                                            Finalizada
                                                        </option>
                                                    </>
                                                )}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} lg={3}>
                                        <Form.Group>
                                            <Form.Label
                                                style={{
                                                    fontSize: '0.85rem',
                                                    color: '#000',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Modalidade
                                            </Form.Label>
                                            <Form.Select
                                                value={filtroModalidade}
                                                onChange={(e) =>
                                                    setFiltroModalidade(
                                                        e.target.value,
                                                    )
                                                }
                                                size="sm"
                                                style={{
                                                    backgroundColor: '#eeeeee',
                                                    border: '1px solid #ced4da',
                                                }}
                                            >
                                                <option value="">Todas</option>
                                                {opcoesEdicao.modalidades?.map(
                                                    (modalidade) => (
                                                        <option
                                                            key={
                                                                modalidade.value ||
                                                                modalidade.id
                                                            }
                                                            value={
                                                                modalidade.value ||
                                                                modalidade.id
                                                            }
                                                        >
                                                            {modalidade.label ||
                                                                modalidade.nome}
                                                        </option>
                                                    ),
                                                )}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} lg={3}>
                                        <Form.Group>
                                            <Form.Label
                                                style={{
                                                    fontSize: '0.85rem',
                                                    color: '#000',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Nível
                                            </Form.Label>
                                            <Form.Select
                                                value={filtroNivel}
                                                onChange={(e) =>
                                                    setFiltroNivel(
                                                        e.target.value,
                                                    )
                                                }
                                                size="sm"
                                                style={{
                                                    backgroundColor: '#eeeeee',
                                                    border: '1px solid #ced4da',
                                                }}
                                            >
                                                <option value="">Todos</option>
                                                {opcoesEdicao.niveis_ensino?.map(
                                                    (nivel) => (
                                                        <option
                                                            key={
                                                                nivel.value ||
                                                                nivel.id
                                                            }
                                                            value={
                                                                nivel.value ||
                                                                nivel.id
                                                            }
                                                        >
                                                            {nivel.label ||
                                                                nivel.nome}
                                                        </option>
                                                    ),
                                                )}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    {filtroStatus ||
                                    filtroModalidade ||
                                    filtroNivel ? (
                                        <Col
                                            md={6}
                                            lg={3}
                                            className="d-flex align-items-end"
                                        >
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setFiltroStatus('');
                                                    setFiltroModalidade('');
                                                    setFiltroNivel('');
                                                }}
                                                className="w-100"
                                            >
                                                Limpar Filtros
                                            </Button>
                                        </Col>
                                    ) : null}
                                </Row>
                            </div>

                            {carregando ? (
                                <div className="text-center py-5">
                                    <Spinner
                                        animation="border"
                                        variant="success"
                                    />
                                    <p className="mt-2 text-muted">
                                        Buscando{' '}
                                        {ehSubmissoes
                                            ? 'submissões'
                                            : 'atrações'}{' '}
                                        no sistema...
                                    </p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {atracoesFiltradas?.length > 0 ? (
                                        atracoesPaginadas.map(
                                            (atracao, index) => {
                                                const podeEditarItem =
                                                    podeEditar(atracao);
                                                const podeExcluirItem =
                                                    podeExcluir(atracao);
                                                const motivoBloqueio =
                                                    bloqueioExclusao[
                                                        atracao.id
                                                    ];
                                                const podeAcessarAvaliacao =
                                                    isAdmin() ||
                                                    isCoordenador() ||
                                                    isAvaliador();
                                                const isUsuarioComum =
                                                    !isAdmin() &&
                                                    !isCoordenador() &&
                                                    !isAvaliador();
                                                const minhaAutoria =
                                                    getMinhaAutoria(atracao);

                                                return (
                                                    <ListGroup.Item
                                                        key={
                                                            atracao.id || index
                                                        }
                                                        className="d-flex justify-content-between align-items-center mb-3 rounded-4 p-3"
                                                        style={{
                                                            borderLeft: `10px solid ${getStatusBorderColor(
                                                                atracao.status,
                                                            )}`,
                                                            backgroundColor:
                                                                '#fff',
                                                            boxShadow:
                                                                '0 0.125rem 0.35rem rgba(0, 0, 0, 0.08)',
                                                        }}
                                                    >
                                                        <div className="d-flex flex-column flex-grow-1">
                                                            <div className="fs-5 fw-bold text-dark mb-1">
                                                                {atracao.titulo}
                                                            </div>
                                                            <div className="d-flex flex-wrap gap-3 text-muted small mb-1">
                                                                <span className="d-flex align-items-center gap-1">
                                                                    <MdInfoOutline />{' '}
                                                                    <strong>
                                                                        Modalidade:
                                                                    </strong>{' '}
                                                                    {atracao.tipo ||
                                                                        '-'}
                                                                </span>
                                                                <span className="d-flex align-items-center gap-1">
                                                                    <MdSchool />{' '}
                                                                    <strong>
                                                                        Nível:
                                                                    </strong>{' '}
                                                                    {atracao.nivel_ensino_display ||
                                                                        atracao.nivel_ensino ||
                                                                        '-'}
                                                                </span>
                                                                <span className="d-flex align-items-center gap-1">
                                                                    <MdEvent />{' '}
                                                                    <strong>
                                                                        Evento:
                                                                    </strong>{' '}
                                                                    {getEventoNome(
                                                                        atracao.evento,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
                                                                <span className="d-flex align-items-center gap-1">
                                                                    <MdPerson />{' '}
                                                                    <strong>
                                                                        Autor:
                                                                    </strong>{' '}
                                                                    {atracao.autor_nome ||
                                                                        '-'}
                                                                </span>
                                                                {getTermosDestaque(
                                                                    atracao,
                                                                ).length >
                                                                    0 && (
                                                                    <span className="d-flex align-items-center gap-1">
                                                                        <MdLocalOffer />{' '}
                                                                        <strong>
                                                                            Termos:
                                                                        </strong>{' '}
                                                                        {getTermosDestaque(
                                                                            atracao,
                                                                        ).join(
                                                                            ', ',
                                                                        )}
                                                                    </span>
                                                                )}
                                                                {atracao.orientador_nome ? (
                                                                    <span className="d-flex align-items-center gap-1">
                                                                        <MdPerson />{' '}
                                                                        <strong>
                                                                            Orientador:
                                                                        </strong>{' '}
                                                                        {
                                                                            atracao.orientador_nome
                                                                        }
                                                                    </span>
                                                                ) : null}
                                                                {formatarDataHoraCurta(
                                                                    atracao.data_hora_inicio,
                                                                ) ? (
                                                                    <span className="d-flex align-items-center gap-1">
                                                                        <MdCalendarToday />{' '}
                                                                        <strong>
                                                                            Início:
                                                                        </strong>{' '}
                                                                        {formatarDataHoraCurta(
                                                                            atracao.data_hora_inicio,
                                                                        )}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            {minhaAutoria && (
                                                                <div className="mb-2">
                                                                    <span
                                                                        className="badge rounded px-2 py-1"
                                                                        style={{
                                                                            backgroundColor:
                                                                                getCoresAutoria(
                                                                                    minhaAutoria,
                                                                                )
                                                                                    .fundo,
                                                                            color: getCoresAutoria(
                                                                                minhaAutoria,
                                                                            )
                                                                                .texto,
                                                                            fontSize:
                                                                                '0.7rem',
                                                                        }}
                                                                    >
                                                                        {
                                                                            minhaAutoria
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="d-flex align-items-center gap-2">
                                                            <Badge
                                                                pill
                                                                bg={
                                                                    getStatusConfig(
                                                                        atracao.status,
                                                                    ).bg
                                                                }
                                                                className="px-3 py-2"
                                                                style={{
                                                                    minWidth:
                                                                        '130px',
                                                                    textAlign:
                                                                        'center',
                                                                    fontSize:
                                                                        '0.78rem',
                                                                    lineHeight:
                                                                        '1rem',
                                                                    letterSpacing:
                                                                        '0.02em',
                                                                }}
                                                            >
                                                                {
                                                                    getStatusConfig(
                                                                        atracao.status,
                                                                    ).label
                                                                }
                                                            </Badge>

                                                            <Dropdown align="end">
                                                                <Dropdown.Toggle
                                                                    variant="primary"
                                                                    id={`acoes-${atracao.id}`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#003366',
                                                                        borderColor:
                                                                            '#003366',
                                                                        color: '#fff',
                                                                        minWidth:
                                                                            '94px',
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    Ações
                                                                </Dropdown.Toggle>

                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item
                                                                        onClick={() =>
                                                                            abrirModalEdicao(
                                                                                atracao,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !podeEditarItem
                                                                        }
                                                                    >
                                                                        Editar
                                                                    </Dropdown.Item>
                                                                    {ehSubmissoes && (
                                                                        <Dropdown.Item
                                                                            onClick={() =>
                                                                                abrirModalAvaliacoes(
                                                                                    atracao,
                                                                                )
                                                                            }
                                                                        >
                                                                            Ver
                                                                            Avaliações
                                                                        </Dropdown.Item>
                                                                    )}

                                                                    {!isUsuarioComum && (
                                                                        <>
                                                                            {ehSubmissoes ? (
                                                                                <Dropdown.Item
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/avaliar_submissao?submissao_id=${
                                                                                                atracao.id
                                                                                            }&evento_id=${
                                                                                                atracao.evento ||
                                                                                                ''
                                                                                            }`,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        !podeAcessarAvaliacao
                                                                                    }
                                                                                >
                                                                                    Avaliar
                                                                                    Submissão
                                                                                </Dropdown.Item>
                                                                            ) : (
                                                                                <Dropdown.Item
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/avaliar_atracao?atracao_id=${atracao.id}`,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        !podeAcessarAvaliacao
                                                                                    }
                                                                                >
                                                                                    Avaliar
                                                                                    Atração
                                                                                </Dropdown.Item>
                                                                            )}

                                                                            {ehSubmissoes ? (
                                                                                <Dropdown.Item
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/gerenciar_avaliadores_submissoes?evento_id=${
                                                                                                atracao.evento ||
                                                                                                ''
                                                                                            }`,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        !isAdmin()
                                                                                    }
                                                                                >
                                                                                    Gerenciar
                                                                                    Avaliadores
                                                                                </Dropdown.Item>
                                                                            ) : (
                                                                                <Dropdown.Item
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/listar_inscritos_atracao?atracaoId=${atracao.id}`,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Ver
                                                                                    Inscritos
                                                                                </Dropdown.Item>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </Dropdown.Menu>
                                                            </Dropdown>

                                                            <Button
                                                                variant="danger"
                                                                className="d-flex align-items-center gap-1"
                                                                onClick={() => {
                                                                    setAtracaoSelecionada(
                                                                        atracao,
                                                                    );
                                                                    setMostrarModalExclusao(
                                                                        true,
                                                                    );
                                                                }}
                                                                disabled={
                                                                    !podeExcluirItem
                                                                }
                                                                title={
                                                                    motivoBloqueio ||
                                                                    ''
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        podeExcluirItem
                                                                            ? '#dc3545'
                                                                            : '#adb5bd',
                                                                    borderColor:
                                                                        podeExcluirItem
                                                                            ? '#dc3545'
                                                                            : '#adb5bd',
                                                                    color: '#fff',
                                                                }}
                                                            >
                                                                <MdDelete />{' '}
                                                                Excluir
                                                            </Button>
                                                        </div>
                                                    </ListGroup.Item>
                                                );
                                            },
                                        )
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">
                                                {atracoes.length > 0
                                                    ? `Nenhuma ${
                                                          ehSubmissoes
                                                              ? 'submissão'
                                                              : 'atração'
                                                      } encontrada para o termo informado.`
                                                    : `Nenhuma ${
                                                          ehSubmissoes
                                                              ? 'submissão'
                                                              : 'atração'
                                                      } cadastrada até o momento.`}
                                            </p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}

                            {atracoesFiltradas.length > 0 && (
                                <div className="d-flex justify-content-center align-items-center mt-4">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="me-2"
                                        onClick={() =>
                                            setPaginaAtual((pagina) =>
                                                Math.max(1, pagina - 1),
                                            )
                                        }
                                        disabled={paginaAtualValida === 1}
                                    >
                                        Anterior
                                    </Button>

                                    {Array.from(
                                        { length: totalPaginas },
                                        (_, index) => {
                                            const numeroPagina = index + 1;
                                            return (
                                                <Button
                                                    key={`page-${numeroPagina}`}
                                                    variant={
                                                        numeroPagina ===
                                                        paginaAtualValida
                                                            ? 'success'
                                                            : 'outline-success'
                                                    }
                                                    size="sm"
                                                    className="mx-1"
                                                    onClick={() =>
                                                        setPaginaAtual(
                                                            numeroPagina,
                                                        )
                                                    }
                                                >
                                                    {numeroPagina}
                                                </Button>
                                            );
                                        },
                                    )}

                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="ms-2"
                                        onClick={() =>
                                            setPaginaAtual((pagina) =>
                                                Math.min(
                                                    totalPaginas,
                                                    pagina + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            paginaAtualValida === totalPaginas
                                        }
                                    >
                                        Proximo
                                    </Button>
                                </div>
                            )}

                            <div className="mt-4">
                                <Button
                                    as={Link}
                                    to={
                                        ehSubmissoes
                                            ? '/adicionar_submissao'
                                            : '/adicionar_atracao'
                                    }
                                    variant="success"
                                    className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{
                                        backgroundColor: '#00A44B',
                                        border: 'none',
                                    }}
                                >
                                    <MdAddCircle size={20} /> Novo
                                    {ehSubmissoes ? 'a Submissão' : 'a Atração'}
                                </Button>
                            </div>
                        </Container>
                    </Card>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline-secondary"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                        >
                            <MdArrowBack /> Voltar
                        </Button>
                    </div>
                </Container>

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
                                Nenhuma avaliação disponível para esta
                                submissão.
                            </p>
                        ) : (
                            <div>
                                {avaliacoesLista.map((a, idx) => (
                                    <div key={a.id} className="mb-3">
                                        <h6 className="mb-1">
                                            Avaliador {idx + 1}
                                        </h6>
                                        <div className="small text-muted mb-1">
                                            <strong>Status:</strong>{' '}
                                            {a.status_aprovacao || '-'} •{' '}
                                            <strong>Nota:</strong>{' '}
                                            {a.nota_final ?? '-'} •{' '}
                                            <strong>Data:</strong>{' '}
                                            {formatarDataHoraCurta(
                                                a.data_avaliacao,
                                            ) || '-'}
                                        </div>
                                        <div>
                                            {a.parecer || (
                                                <span className="text-muted">
                                                    Sem parecer.
                                                </span>
                                            )}
                                        </div>

                                        {avaliacoesItensMap[a.id] &&
                                        avaliacoesItensMap[a.id].length > 0 ? (
                                            <div className="mt-2">
                                                <strong>
                                                    Itens de Avaliação:
                                                </strong>
                                                <ul className="mb-2">
                                                    {avaliacoesItensMap[
                                                        a.id
                                                    ].map((it) => (
                                                        <li
                                                            key={it.id}
                                                            className="small"
                                                        >
                                                            {it.criterio_nome} —{' '}
                                                            <strong>
                                                                {it.nota}
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
                    permitirEdicaoStatus={isAdmin()}
                    opcoesStatus={opcoesStatusEdicao}
                    opcoesEdicao={opcoesEdicao}
                    modalidadeEdicaoDetalhe={modalidadeEdicaoDetalhe}
                    habilitarSugestaoVagasEdicao={habilitarSugestaoVagasEdicao}
                    setHabilitarSugestaoVagasEdicao={
                        setHabilitarSugestaoVagasEdicao
                    }
                    contarPalavras={contarPalavras}
                    LIMITS_EDICAO={LIMITS_EDICAO}
                    normalizarNiveisEnsino={normalizarNiveisEnsino}
                    selecionarNivelEnsinoEdicao={selecionarNivelEnsinoEdicao}
                    getAreasEventoEdicao={getAreasEventoEdicao}
                    normalizarAreaEdicao={normalizarAreaEdicao}
                    usuariosEdicao={usuariosEdicao}
                    getNomeUsuario={getNomeUsuario}
                    getNivelEnsinoMembroEdicao={getNivelEnsinoMembroEdicao}
                    getUsuariosDisponiveisLinhaEdicao={
                        getUsuariosDisponiveisLinhaEdicao
                    }
                    handleAdicionarMembroEdicao={handleAdicionarMembroEdicao}
                    handleRemoverMembroEdicao={handleRemoverMembroEdicao}
                    handleMembroEdicaoChange={handleMembroEdicaoChange}
                    salvandoEdicao={salvandoEdicao}
                    onClose={() => setMostrarModalEdicao(false)}
                    onSalvar={handleSalvarEdicao}
                />
            </main>

            <ModalPopup
                show={mostrarModalExclusao}
                titulo="Aviso!"
                tituloSecundario={`Excluir ${
                    ehSubmissoes ? 'Submissão' : 'Atração'
                }`}
                onAcao={handleConfirmarExclusao}
                onFechar={() => setMostrarModalExclusao(false)}
                textoAcao="Excluir"
            />

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
