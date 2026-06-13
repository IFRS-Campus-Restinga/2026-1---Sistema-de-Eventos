import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Col,
    Container,
    Form,
    ListGroup,
    Row,
    Spinner,
} from 'react-bootstrap';
import {
    MdAddCircle,
    MdArrowBack,
    MdDelete,
    MdEdit,
    MdEvent,
    MdInfoOutline,
    MdPlace,
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
import { getSelectedEventoId } from '../utils/selectedEvento';
import { buscarEventoPorId } from '../services/eventoService';
import { pegarModalidade } from '../services/modalidadeService';
import { getCurrentUser } from '../services/authService';

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
    const [filtroEvento, setFiltroEvento] = useState('');
    const [ordenacao, setOrdenacao] = useState('criacao');

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
    const [modalidadeEdicaoDetalhe, setModalidadeEdicaoDetalhe] = useState(null);
    const [habilitarSugestaoVagasEdicao, setHabilitarSugestaoVagasEdicao] = useState(false);
    const [usuarioLogadoEdicao, setUsuarioLogadoEdicao] = useState(null);

    const eventoFiltroId = getSelectedEventoId();
    const eventoSelecionadoLista = useMemo(() => {
        if (!eventoFiltroId) return null;

        return (
            eventosEdicao.find((evento) => String(evento.id) === String(eventoFiltroId)) ||
            null
        );
    }, [eventosEdicao, eventoFiltroId]);

    const contarPalavras = (texto) =>
        texto?.trim().split(/\s+/).filter((palavra) => palavra.length > 0).length || 0;

    const normalizarNiveisEnsino = (valor) => {
        if (Array.isArray(valor)) {
            const primeiroValido = valor.find((item) => String(item || '').trim() !== '');
            return primeiroValido ? String(primeiroValido).trim() : '';
        }

        if (!valor) {
            return '';
        }

        return String(valor)
            .split(',')
            .map((item) => item.trim())
            .find((item) => item !== '') || '';
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
            const dados = await listarAtracoes(eventoId);
            setAtracoes(dados);
            setAlerta((prev) => ({
                ...prev,
                mensagem: '',
            }));
        } catch (error) {
            console.error('Erro ao buscar atrações:', error);
            const status = error?.response?.status;
            const detalhe = error?.response?.data?.detail;
            const mensagem =
                detalhe ||
                (status
                    ? `Não foi possível carregar as atrações (HTTP ${status}).`
                    : 'Não foi possível carregar as atrações. Verifique backend e URL da API.');
            mostrarAlerta(mensagem);
        } finally {
            setCarregando(false);
        }
    }, [mostrarAlerta]);

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
            const [dadosOpcoes, dadosEventos, dadosUsuarios, dadosUsuarioLogado] = await Promise.allSettled([
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
                console.error('Erro ao carregar detalhe do evento na edicao:', error);
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
                console.error('Erro ao carregar detalhe da modalidade na edicao:', error);
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
            CONFIRMADA: { label: 'CONFIRMADA', bg: 'success' },
            EM_ANDAMENTO: { label: 'EM ANDAMENTO', bg: 'warning' },
            ENCERRADA: { label: 'ENCERRADA', bg: 'dark' },
            CANCELADA: { label: 'CANCELADA', bg: 'danger' },
            EM_AVALIACAO: { label: 'EM AVALIACAO', bg: 'warning' },
            APROVADA: { label: 'APROVADA', bg: 'success' },
            REPROVADA: { label: 'REPROVADA', bg: 'danger' },
        };

        return (
            mapa[statusNormalizado] || {
                label: statusNormalizado || 'N/A',
                bg: 'secondary',
            }
        );
    };

    // Função para determinar se usuário é admin
    const isAdmin = () => usuarioLogado?.groups?.includes('ADMIN') || usuarioLogado?.is_superuser;

    // Função para determinar se usuário é coordenador
    const isCoordenador = () => usuarioLogado?.groups?.includes('COORDENADOR');

    // Função para determinar se usuário é autor do item
    const isAutor = (item) => {
        if (!usuarioLogado) return false;
        const autorias = item.autorias || item.equipe || [];
        return autorias.some(
            (autoria) =>
                (autoria.usuario === usuarioLogado.id ||
                    autoria.user_id === usuarioLogado.id ||
                    autoria.perfil_usuario === usuarioLogado.id)
        );
    };

    // Função para determinar se coordenador gerencia o evento
    const coordenadorGerenciaEvento = (item) => {
        if (!isCoordenador()) return false;
        return usuarioLogado?.eventos_coordenados?.includes(item.evento) || false;
    };

    // Função para validar se pode editar
    const podeEditar = (item) => {
        if (isAdmin()) return true;

        const status = (item.status || '').toUpperCase();
        const statusPermitidosCoordenador = ['SUBMETIDA', 'CONFIRMADA', 'RASCUNHO'];
        const statusPermitidosUsuario = ['RASCUNHO'];

        if (isCoordenador()) {
            if (!coordenadorGerenciaEvento(item) && !isAutor(item)) return false;
            return statusPermitidosCoordenador.includes(status);
        }

        if (!isAutor(item)) return false;
        return statusPermitidosUsuario.includes(status);
    };

    // Função para validar se pode excluir
    const podeExcluir = (item) => {
        if (!podeEditar(item)) return false; // Se não pode editar, não pode excluir
        
        const status = (item.status || '').toUpperCase();
        const statusPermitidos = ['SUBMETIDA', 'RASCUNHO'];
        
        return statusPermitidos.includes(status);
    };

    // Função para obter motivo do bloqueio de exclusão
    const obterMotivoBloqueioExclusao = (item) => {
        if (isAdmin()) return null;

        const status = (item.status || '').toUpperCase();
        const statusPermitidos = ['SUBMETIDA', 'RASCUNHO'];

        if (!podeEditar(item)) {
            return 'Você não tem permissão para editar este item.';
        }

        if (!statusPermitidos.includes(status)) {
            return `Exclusão não permitida para itens com status "${getStatusConfig(status).label}".`;
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

    const atracoesFiltradas = useMemo(() => {
        let resultado = [...atracoes];

        // Aplicar filtro de busca
        const termo = normalizarTexto(termoBusca.trim());
        if (termo) {
            resultado = resultado.filter((atracao) => {
                const conteudoBusca = [
                    atracao.titulo,
                    atracao.tipo,
                    atracao.local_atracao,
                    getStatusConfig(atracao.status).label,
                ]
                    .map((valor) => normalizarTexto(valor))
                    .join(' ');

                return conteudoBusca.includes(termo);
            });
        }

        // Aplicar filtro de status
        if (filtroStatus) {
            resultado = resultado.filter(
                (item) => (item.status || '').toUpperCase() === filtroStatus.toUpperCase()
            );
        }

        // Aplicar filtro de autor
        if (filtroAutor) {
            resultado = resultado.filter((item) => {
                const autorias = item.autorias || item.equipe || [];
                return autorias.some(
                    (autoria) =>
                        normalizarTexto(autoria.nome || '').includes(normalizarTexto(filtroAutor))
                );
            });
        }

        // Aplicar filtro de modalidade
        if (filtroModalidade) {
            resultado = resultado.filter(
                (item) => item.modalidade === filtroModalidade
            );
        }

        // Aplicar filtro de nível
        if (filtroNivel) {
            resultado = resultado.filter((item) => {
                const nivel = normalizarNiveisEnsino(item.nivel_ensino);
                return normalizarTexto(nivel).includes(normalizarTexto(filtroNivel));
            });
        }

        // Aplicar filtro de evento (apenas para admin)
        if (filtroEvento && isAdmin()) {
            resultado = resultado.filter(
                (item) => item.evento === parseInt(filtroEvento, 10)
            );
        }

        // Aplicar ordenação
        if (ordenacao === 'titulo') {
            resultado.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
        } else if (ordenacao === 'autor') {
            resultado.sort((a, b) => {
                const autorA = ((a.autorias || a.equipe || [])[0]?.nome || '').toLowerCase();
                const autorB = ((b.autorias || b.equipe || [])[0]?.nome || '').toLowerCase();
                return autorA.localeCompare(autorB);
            });
        } else if (ordenacao === 'status') {
            resultado.sort((a, b) => {
                const statusA = (a.status || '').toUpperCase();
                const statusB = (b.status || '').toUpperCase();
                return statusA.localeCompare(statusB);
            });
        } else if (ordenacao === 'modalidade') {
            resultado.sort((a, b) => (a.modalidade || '').localeCompare(b.modalidade || ''));
        } else if (ordenacao === 'nivel') {
            resultado.sort((a, b) => {
                const nivelA = normalizarNiveisEnsino(a.nivel_ensino);
                const nivelB = normalizarNiveisEnsino(b.nivel_ensino);
                return nivelA.localeCompare(nivelB);
            });
        } else {
            // Padrão: por criação (reverso)
            resultado.sort((a, b) => {
                const dataA = new Date(a.criado_em || a.created_at || 0);
                const dataB = new Date(b.criado_em || b.created_at || 0);
                return dataB - dataA;
            });
        }

        return resultado;
    }, [atracoes, termoBusca, filtroStatus, filtroAutor, filtroModalidade, filtroNivel, filtroEvento, ordenacao]);

    const abrirModalEdicao = (atracao) => {
        const sugestaoAtual = atracao.sugestao_vagas ?? '';
        const fonteAutoria = Array.isArray(atracao.autorias) && atracao.autorias.length > 0
            ? atracao.autorias
            : (Array.isArray(atracao.equipe) ? atracao.equipe : []);

        setFormEdicao({
            id: atracao.id,
            titulo: atracao.titulo || '',
            resumo: atracao.resumo || '',
            status: atracao.status || 'PREVISTA',
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
                        : (membro.funcao || membro.tipo || ''),
            })),
        });
        setHabilitarSugestaoVagasEdicao(
            sugestaoAtual !== '' && sugestaoAtual !== null && sugestaoAtual !== undefined,
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
            (usuario) => getNomeUsuario(usuario).trim().toLowerCase() === nomeNormalizado,
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
                { user_id: '', nome: '', instituicao_curso: '', funcao: 'COAUTOR' },
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
                    nome: usuarioSelecionado ? getNomeUsuario(usuarioSelecionado) : '',
                    instituicao_curso: usuarioSelecionado
                        ? (usuarioSelecionado.nivel_ensino_display || usuarioSelecionado.nivel_ensino || '')
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

        return getNivelEnsinoUsuario(membro?.nome) || membro?.instituicao_curso || '';
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

        if (!formEdicao.titulo || !formEdicao.evento || !formEdicao.modalidade || nivelEnsinoVazio || !formEdicao.area_conhecimento) {
            mostrarAlerta('Preencha titulo, evento, modalidade, nivel de ensino e area de conhecimento.');
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

        if ((formEdicao.palavras_chave || '').length > LIMITS_EDICAO.palavrasChave.maxChars) {
            mostrarAlerta(
                `Palavras-chave deve ter no máximo ${LIMITS_EDICAO.palavrasChave.maxChars} caracteres.`,
            );
            return;
        }

        const equipeComUsuario = (formEdicao.equipe || []).filter(
            (membro) => String(membro?.user_id || '').trim() !== '',
        );
        if (equipeComUsuario.length === 0) {
            mostrarAlerta('Adicione pelo menos um membro com usuário selecionado na equipe.');
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
            await editarAtracao(formEdicao.id, formEdicao);

            mostrarAlerta(`${ehSubmissoes ? 'Submissão' : 'Atração'} atualizado com sucesso.`, 'success');
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
            await excluirAtracao(atracaoSelecionada.id);
            mostrarAlerta(`${ehSubmissoes ? 'Submissão' : 'Atração'} excluído com sucesso.`, 'success');
            setMostrarModalExclusao(false);
            setAtracaoSelecionada(null);
            await carregarAtracoes();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            mostrarAlerta(`Não foi possível excluir o ${ehSubmissoes ? 'submissão' : 'atração'}.`);
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

                    <Card corBorda="#00A44B">
                        <Container fluid className="mb-5 px-4">
                            <Row className="pt-5 pb-2">
                                <Col className="d-flex align-items-center">
                                    <MdEvent color="#00A44B" size={35} />
                                    <h3 className="fw-bold ms-2 mb-0" style={{ color: '#00A44B' }}>
                                        {ehSubmissoes ? 'Gerenciar Submissões' : 'Gerenciar Atrações'}
                                    </h3>
                                </Col>
                            </Row>
                            <hr className="mb-4" />

                            {eventoFiltroId && (
                                <Row className="mb-4">
                                    <Col>
                                        <div
                                            className="rounded px-3 py-2"
                                            style={{
                                                backgroundColor: '#e7f1ff',
                                                border: '1px solid #9ec5fe',
                                                color: '#084298',
                                            }}
                                        >
                                            <strong>Evento selecionado:</strong>{' '}
                                            {eventoSelecionadoLista?.nome || `ID ${eventoFiltroId}`}
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {/* Filtros e Ordenação */}
                            <Row className="mb-4">
                                <Col md={8} lg={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Buscar {ehSubmissoes ? 'submissão' : 'atração'}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={termoBusca}
                                            onChange={(e) => setTermoBusca(e.target.value)}
                                            placeholder={`Digite titulo, tipo, local ou status`}
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                border: '1px solid #ced4da',
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4} lg={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Ordenar por
                                        </Form.Label>
                                        <Form.Select
                                            value={ordenacao}
                                            onChange={(e) => setOrdenacao(e.target.value)}
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                border: '1px solid #ced4da',
                                            }}
                                        >
                                            <option value="criacao">Criação (Recente)</option>
                                            <option value="titulo">Título</option>
                                            <option value="autor">Autor</option>
                                            <option value="status">Status</option>
                                            <option value="modalidade">Modalidade</option>
                                            <option value="nivel">Nível de Ensino</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Filtros Avançados */}
                            <Row className="mb-4 g-2">
                                <Col md={4} lg={2}>
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', color: '#666' }}>
                                            Status
                                        </Form.Label>
                                        <Form.Select
                                            value={filtroStatus}
                                            onChange={(e) => setFiltroStatus(e.target.value)}
                                            size="sm"
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                border: '1px solid #ced4da',
                                            }}
                                        >
                                            <option value="">Todos</option>
                                            {ehSubmissoes ? (
                                                <>
                                                    <option value="RASCUNHO">Rascunho</option>
                                                    <option value="PREVISTA">Submetida</option>
                                                    <option value="EM_AVALIACAO">Em Avaliação</option>
                                                    <option value="APROVADA">Aprovada</option>
                                                    <option value="REPROVADA">Reprovada</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="CONFIRMADA">Confirmada</option>
                                                    <option value="EM_ANDAMENTO">Em Andamento</option>
                                                    <option value="ENCERRADA">Encerrada</option>
                                                    <option value="CANCELADA">Cancelada</option>
                                                </>
                                            )}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4} lg={2}>
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', color: '#666' }}>
                                            Modalidade
                                        </Form.Label>
                                        <Form.Select
                                            value={filtroModalidade}
                                            onChange={(e) => setFiltroModalidade(e.target.value)}
                                            size="sm"
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                border: '1px solid #ced4da',
                                            }}
                                        >
                                            <option value="">Todas</option>
                                            {opcoesEdicao.modalidades?.map((modalidade) => (
                                                <option key={modalidade.value || modalidade.id} value={modalidade.value || modalidade.id}>
                                                    {modalidade.label || modalidade.nome}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4} lg={2}>
                                    <Form.Group>
                                        <Form.Label style={{ fontSize: '0.85rem', color: '#666' }}>
                                            Nível
                                        </Form.Label>
                                        <Form.Select
                                            value={filtroNivel}
                                            onChange={(e) => setFiltroNivel(e.target.value)}
                                            size="sm"
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                border: '1px solid #ced4da',
                                            }}
                                        >
                                            <option value="">Todos</option>
                                            {opcoesEdicao.niveis_ensino?.map((nivel) => (
                                                <option key={nivel.value || nivel.id} value={nivel.value || nivel.id}>
                                                    {nivel.label || nivel.nome}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {isAdmin() && (
                                    <Col md={4} lg={2}>
                                        <Form.Group>
                                            <Form.Label style={{ fontSize: '0.85rem', color: '#666' }}>
                                                Evento
                                            </Form.Label>
                                            <Form.Select
                                                value={filtroEvento}
                                                onChange={(e) => setFiltroEvento(e.target.value)}
                                                size="sm"
                                                style={{
                                                    backgroundColor: '#eeeeee',
                                                    border: '1px solid #ced4da',
                                                }}
                                            >
                                                <option value="">Todos</option>
                                                {eventosEdicao?.map((evento) => (
                                                    <option key={evento.id} value={evento.id}>
                                                        {evento.nome}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                )}
                                {filtroStatus || filtroModalidade || filtroNivel || filtroEvento ? (
                                    <Col md={4} lg={2} className="d-flex align-items-end">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => {
                                                setFiltroStatus('');
                                                setFiltroModalidade('');
                                                setFiltroNivel('');
                                                setFiltroEvento('');
                                            }}
                                            className="w-100"
                                        >
                                            Limpar Filtros
                                        </Button>
                                    </Col>
                                ) : null}
                            </Row>

                            {carregando ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="mt-2 text-muted">Buscando {ehSubmissoes ? 'submissões' : 'atrações'} no sistema...</p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {atracoesFiltradas?.length > 0 ? (
                                        atracoesFiltradas.map((atracao, index) => {
                                            const podeEditarItem = podeEditar(atracao);
                                            const podeExcluirItem = podeExcluir(atracao);
                                            const motivoBloqueio = bloqueioExclusao[atracao.id];

                                            return (
                                                <ListGroup.Item
                                                    key={atracao.id || index}
                                                    className="d-flex justify-content-between align-items-center mb-3 border rounded shadow-sm p-3"
                                                    style={{ borderLeft: '5px solid #00A44B' }}
                                                >
                                                    <div className="d-flex flex-column flex-grow-1">
                                                        <div className="fs-5 fw-bold text-dark mb-1">{atracao.titulo}</div>
                                                        <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
                                                            <span className="d-flex align-items-center gap-1">
                                                                <MdInfoOutline /> <strong>Tipo:</strong> {atracao.tipo}
                                                            </span>
                                                            <span className="d-flex align-items-center gap-1">
                                                                <MdPlace /> <strong>Local:</strong> {atracao.local_atracao}
                                                            </span>
                                                        </div>
                                                        {motivoBloqueio && (
                                                            <div style={{ fontSize: '0.85rem', color: '#dc3545', marginBottom: '0.5rem' }}>
                                                                ⚠️ {motivoBloqueio}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2">
                                                        <Badge
                                                            pill
                                                            bg={getStatusConfig(atracao.status).bg}
                                                            className="px-3 py-2"
                                                        >
                                                            {getStatusConfig(atracao.status).label}
                                                        </Badge>

                                                        <Button
                                                            variant="outline-primary"
                                                            className="d-flex align-items-center gap-1"
                                                            onClick={() => abrirModalEdicao(atracao)}
                                                            disabled={!podeEditarItem}
                                                            title={!podeEditarItem ? 'Você não tem permissão para editar' : ''}
                                                        >
                                                            <MdEdit /> Editar
                                                        </Button>

                                                        <Button
                                                            variant="outline-danger"
                                                            className="d-flex align-items-center gap-1"
                                                            onClick={() => {
                                                                setAtracaoSelecionada(atracao);
                                                                setMostrarModalExclusao(true);
                                                            }}
                                                            disabled={!podeExcluirItem}
                                                            title={motivoBloqueio || ''}
                                                        >
                                                            <MdDelete /> Excluir
                                                        </Button>
                                                    </div>
                                                </ListGroup.Item>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">
                                                {atracoes.length > 0
                                                    ? `Nenhuma ${ehSubmissoes ? 'submissão' : 'atração'} encontrada para o termo informado.`
                                                    : `Nenhuma ${ehSubmissoes ? 'submissão' : 'atração'} cadastrada até o momento.`}
                                            </p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}

                            <div className="mt-4">
                                <Button
                                    as={Link}
                                    to={ehSubmissoes ? '/adicionar_submissao' : '/adicionar_atracao'}
                                    variant="success"
                                    className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{ backgroundColor: '#00A44B', border: 'none' }}
                                >
                                    <MdAddCircle size={20} /> Novo{ehSubmissoes ? 'a Submissão' : 'a Atração'}
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

                <EditarAtracaoModal
                    show={mostrarModalEdicao}
                    formEdicao={formEdicao}
                    setFormEdicao={setFormEdicao}
                    opcoesEdicao={opcoesEdicao}
                    modalidadeEdicaoDetalhe={modalidadeEdicaoDetalhe}
                    habilitarSugestaoVagasEdicao={habilitarSugestaoVagasEdicao}
                    setHabilitarSugestaoVagasEdicao={setHabilitarSugestaoVagasEdicao}
                    contarPalavras={contarPalavras}
                    LIMITS_EDICAO={LIMITS_EDICAO}
                    normalizarNiveisEnsino={normalizarNiveisEnsino}
                    selecionarNivelEnsinoEdicao={selecionarNivelEnsinoEdicao}
                    getAreasEventoEdicao={getAreasEventoEdicao}
                    normalizarAreaEdicao={normalizarAreaEdicao}
                    usuariosEdicao={usuariosEdicao}
                    getNomeUsuario={getNomeUsuario}
                    getNivelEnsinoMembroEdicao={getNivelEnsinoMembroEdicao}
                    getUsuariosDisponiveisLinhaEdicao={getUsuariosDisponiveisLinhaEdicao}
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
                tituloSecundario={`Excluir ${ehSubmissoes ? 'Submissão' : 'Atração'}`}
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
