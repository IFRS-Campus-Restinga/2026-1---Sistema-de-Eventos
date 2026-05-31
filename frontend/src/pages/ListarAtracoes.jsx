import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Col,
    Container,
    Form,
    ListGroup,
    Modal,
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
import { Link, useNavigate } from 'react-router-dom';
import Alerta from '../components/common/Alerta';
import Card from '../components/common/Card';
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
    const [atracoes, setAtracoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [mostrarModalExclusao, setMostrarModalExclusao] = useState(false);
    const [atracaoSelecionada, setAtracaoSelecionada] = useState(null);
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

    const navigate = useNavigate();
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
            return valor.filter((item) => String(item || '').trim() !== '');
        }

        if (!valor) {
            return [];
        }

        return String(valor)
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item !== '');
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
        const termo = normalizarTexto(termoBusca.trim());
        if (!termo) return atracoes;

        return atracoes.filter((atracao) => {
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
    }, [atracoes, termoBusca]);

    const abrirModalEdicao = (atracao) => {
        const sugestaoAtual = atracao.sugestao_vagas ?? '';
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
            equipe: Array.isArray(atracao.equipe)
                ? atracao.equipe.map((membro) => ({
                      user_id:
                          (usuariosEdicao || []).find(
                              (usuario) =>
                                  getNomeUsuario(usuario).trim().toLowerCase() ===
                                  (membro.nome || '').trim().toLowerCase(),
                          )?.id || '',
                      nome: membro.nome || '',
                      instituicao_curso: membro.instituicao_curso || '',
                      funcao:
                          membro.funcao === 'COLABORADOR'
                              ? 'COAUTOR'
                              : (membro.funcao || ''),
                  }))
                : [],
        });
        setHabilitarSugestaoVagasEdicao(
            sugestaoAtual !== '' && sugestaoAtual !== null && sugestaoAtual !== undefined,
        );
        setMostrarModalEdicao(true);
    };

    const toggleNivelEnsinoEdicao = (nivelValue) => {
        setFormEdicao((prev) => {
            const atuais = normalizarNiveisEnsino(prev.nivel_ensino);
            const atualizados = atuais.includes(nivelValue)
                ? atuais.filter((item) => item !== nivelValue)
                : [...atuais, nivelValue];

            return {
                ...prev,
                nivel_ensino: atualizados,
            };
        });
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

        const nivelEnsinoVazio = normalizarNiveisEnsino(formEdicao.nivel_ensino).length === 0;

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
            (membro) =>
                String(membro?.user_id || '').trim() !== '' ||
                (membro?.nome || '').trim().length > 0,
        );
        if (equipeComUsuario.length === 0) {
            mostrarAlerta('Adicione pelo menos um membro com nome na equipe.');
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
            mostrarAlerta('Submissão atualizada com sucesso.', 'success');
            setMostrarModalEdicao(false);
            await carregarAtracoes();
        } catch (error) {
            console.error('Erro ao editar atração:', error);
            const mensagemErro = error.response?.data
                ? JSON.stringify(error.response.data)
                : 'Não foi possível salvar a edição.';
            mostrarAlerta(mensagemErro);
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleConfirmarExclusao = async () => {
        if (!atracaoSelecionada?.id) return;

        try {
            await excluirAtracao(atracaoSelecionada.id);
            mostrarAlerta('Submissão excluída com sucesso.', 'success');
            setMostrarModalExclusao(false);
            setAtracaoSelecionada(null);
            await carregarAtracoes();
        } catch (error) {
            console.error('Erro ao excluir atração:', error);
            mostrarAlerta('Não foi possível excluir a submissão.');
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
                                        Gerenciar Submissões
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

                            <Row className="mb-4">
                                <Col md={8} lg={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Buscar submissão
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={termoBusca}
                                            onChange={(e) => setTermoBusca(e.target.value)}
                                            placeholder="Digite titulo, tipo, local ou status"
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                border: '1px solid #ced4da',
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {carregando ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="mt-2 text-muted">Buscando submissões no sistema...</p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {atracoesFiltradas?.length > 0 ? (
                                        atracoesFiltradas.map((atracao, index) => (
                                            <ListGroup.Item
                                                key={atracao.id || index}
                                                className="d-flex justify-content-between align-items-center mb-3 border rounded shadow-sm p-3"
                                                style={{ borderLeft: '5px solid #00A44B' }}
                                            >
                                                <div className="d-flex flex-column">
                                                    <div className="fs-5 fw-bold text-dark mb-1">{atracao.titulo}</div>
                                                    <div className="d-flex flex-wrap gap-3 text-muted small">
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdInfoOutline /> <strong>Tipo:</strong> {atracao.tipo}
                                                        </span>
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdPlace /> <strong>Local:</strong> {atracao.local_atracao}
                                                        </span>
                                                    </div>
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
                                                    >
                                                        <MdDelete /> Excluir
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">
                                                {atracoes.length > 0
                                                    ? 'Nenhuma submissao encontrada para o termo informado.'
                                                    : 'Nenhuma submissao cadastrada ate o momento.'}
                                            </p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}

                            <div className="mt-4">
                                <Button
                                    as={Link}
                                    to="/adicionar_atracao"
                                    variant="success"
                                    className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{ backgroundColor: '#00A44B', border: 'none' }}
                                >
                                    <MdAddCircle size={20} /> Nova Submissão
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
                    show={mostrarModalEdicao}
                    onHide={() => setMostrarModalEdicao(false)}
                    centered
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title style={{ color: '#00A44B' }}>Editar Submissão</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Título
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formEdicao.titulo || ''}
                                    onChange={(e) =>
                                        setFormEdicao((prev) => ({
                                            ...prev,
                                            titulo: e.target.value,
                                        }))
                                    }
                                />
                                <Form.Text className="text-muted">
                                    {contarPalavras(formEdicao.titulo || '')}/{LIMITS_EDICAO.titulo.maxWords} palavras
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Resumo
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    value={formEdicao.resumo || ''}
                                    onChange={(e) =>
                                        setFormEdicao((prev) => ({
                                            ...prev,
                                            resumo: e.target.value,
                                        }))
                                    }
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Modalidade
                                        </Form.Label>
                                        <Form.Select
                                            value={formEdicao.modalidade || ''}
                                            onChange={(e) =>
                                                setFormEdicao((prev) => ({
                                                    ...prev,
                                                    modalidade: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Selecione a modalidade</option>
                                            {opcoesEdicao.modalidades.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </Form.Select>

                                        {modalidadeEdicaoDetalhe && (
                                            <div className="mt-2">
                                                <Form.Check
                                                    type="checkbox"
                                                    id="edicao-habilitar-sugestao-vagas"
                                                    label="Habilitar sugestão para número de vagas"
                                                    className="mb-2"
                                                    checked={habilitarSugestaoVagasEdicao}
                                                    onChange={(e) => {
                                                        const habilitado = e.target.checked;
                                                        setHabilitarSugestaoVagasEdicao(habilitado);
                                                        if (!habilitado) {
                                                            setFormEdicao((prev) => ({
                                                                ...prev,
                                                                sugestao_vagas: '',
                                                            }));
                                                        }
                                                    }}
                                                />

                                                {habilitarSugestaoVagasEdicao && (
                                                    <>
                                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                                            Sugestão para Número de Vagas
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min={1}
                                                            max={
                                                                modalidadeEdicaoDetalhe.limite_vagas > 0
                                                                    ? modalidadeEdicaoDetalhe.limite_vagas
                                                                    : undefined
                                                            }
                                                            value={formEdicao.sugestao_vagas ?? ''}
                                                            onChange={(e) =>
                                                                setFormEdicao((prev) => ({
                                                                    ...prev,
                                                                    sugestao_vagas:
                                                                        e.target.value === ''
                                                                            ? ''
                                                                            : Number(e.target.value),
                                                                }))
                                                            }
                                                            placeholder="Ex: 30"
                                                        />
                                                    </>
                                                )}

                                                <Form.Text className="text-muted">
                                                    {modalidadeEdicaoDetalhe.limite_vagas > 0
                                                        ? `Limite definido para esta modalidade: ${modalidadeEdicaoDetalhe.limite_vagas} vagas.`
                                                        : 'Esta modalidade não possui limite de vagas definido.'}
                                                </Form.Text>
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Nivel de Ensino
                                        </Form.Label>
                                        <div
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                borderRadius: '0.375rem',
                                                padding: '0.75rem',
                                                border: '1px solid #ced4da',
                                            }}
                                        >
                                            {opcoesEdicao.niveis_ensino.map((opt) => (
                                                <Form.Check
                                                    key={opt.value}
                                                    type="checkbox"
                                                    id={`edicao-nivel-${opt.value}`}
                                                    label={opt.label}
                                                    checked={normalizarNiveisEnsino(formEdicao.nivel_ensino).includes(opt.value)}
                                                    onChange={() => toggleNivelEnsinoEdicao(opt.value)}
                                                    className="mb-1"
                                                />
                                            ))}
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Area do Conhecimento
                                        </Form.Label>
                                        <Form.Select
                                            value={formEdicao.area_conhecimento || ''}
                                            disabled={!formEdicao.evento}
                                            onChange={(e) =>
                                                setFormEdicao((prev) => ({
                                                    ...prev,
                                                    area_conhecimento: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">
                                                {formEdicao.evento
                                                    ? (getAreasEventoEdicao().length > 0
                                                        ? 'Selecione a area'
                                                        : 'Evento sem areas configuradas')
                                                    : 'Selecione primeiro um evento'}
                                            </option>
                                            {getAreasEventoEdicao().map((area) => {
                                                const normalizada = normalizarAreaEdicao(area);
                                                return (
                                                    <option key={normalizada.value} value={normalizada.value}>
                                                        {normalizada.label}
                                                    </option>
                                                );
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Palavras-chave
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formEdicao.palavras_chave || ''}
                                    maxLength={LIMITS_EDICAO.palavrasChave.maxChars}
                                    onChange={(e) =>
                                        setFormEdicao((prev) => ({
                                            ...prev,
                                            palavras_chave: e.target.value,
                                        }))
                                    }
                                />
                                <Form.Text className="text-muted">
                                    {(formEdicao.palavras_chave || '').length}/{LIMITS_EDICAO.palavrasChave.maxChars} caracteres
                                </Form.Text>
                            </Form.Group>

                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Recursos
                                        </Form.Label>
                                        <Form.Check
                                            type="checkbox"
                                            id="edicao-acessibilidade"
                                            label="Necessita recursos de acessibilidade"
                                            checked={!!formEdicao.acessibilidade}
                                            onChange={(e) =>
                                                setFormEdicao((prev) => ({
                                                    ...prev,
                                                    acessibilidade: e.target.checked,
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Status de Avaliação
                                        </Form.Label>
                                        <Form.Select
                                            value={formEdicao.status || 'PREVISTA'}
                                            onChange={(e) =>
                                                setFormEdicao((prev) => ({
                                                    ...prev,
                                                    status: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="RASCUNHO">RASCUNHO</option>
                                            <option value="PREVISTA">SUBMETIDA</option>
                                            <option value="CONFIRMADA">CONFIRMADA</option>
                                            <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                                            <option value="ENCERRADA">ENCERRADA</option>
                                            <option value="CANCELADA">CANCELADA</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label className="fw-bold mb-0" style={{ color: '#00A44B' }}>
                                    Membros da Equipe
                                </Form.Label>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleAdicionarMembroEdicao}
                                >
                                    Adicionar membro
                                </Button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Nível de Ensino</th>
                                            <th>Papel</th>
                                            <th style={{ width: '90px' }}>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(formEdicao.equipe || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted">
                                                    Nenhum membro informado.
                                                </td>
                                            </tr>
                                        ) : (
                                            (formEdicao.equipe || []).map((membro, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {(() => {
                                                            const usuariosDisponiveis =
                                                                getUsuariosDisponiveisLinhaEdicao(index);
                                                            return (
                                                                <Form.Select
                                                                    value={membro.user_id || ''}
                                                                    onChange={(e) =>
                                                                        handleMembroEdicaoChange(
                                                                            index,
                                                                            'user_id',
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">Selecione o usuário</option>
                                                                    {usuariosDisponiveis.map((usuario) => (
                                                                        <option key={usuario.id} value={usuario.id}>
                                                                            {getNomeUsuario(usuario)}
                                                                        </option>
                                                                    ))}
                                                                </Form.Select>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            value={getNivelEnsinoMembroEdicao(membro)}
                                                            placeholder="Nível de ensino (auto-preenchido)"
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            value={membro.funcao || ''}
                                                            disabled={!membro.user_id && !membro.nome}
                                                            onChange={(e) =>
                                                                handleMembroEdicaoChange(
                                                                    index,
                                                                    'funcao',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">Selecione</option>
                                                            <option
                                                                value="AUTOR"
                                                                disabled={
                                                                    (formEdicao.equipe || []).some(
                                                                        (item, i) =>
                                                                            i !== index && item?.funcao === 'AUTOR',
                                                                    )
                                                                }
                                                            >
                                                                Autor
                                                            </option>
                                                            <option value="COAUTOR">Co-autor</option>
                                                            <option value="ORIENTADOR">Orientador</option>
                                                        </Form.Select>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoverMembroEdicao(index)
                                                            }
                                                        >
                                                            Remover
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setMostrarModalEdicao(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="success"
                            style={{ backgroundColor: '#00A44B', border: 'none' }}
                            disabled={salvandoEdicao}
                            onClick={handleSalvarEdicao}
                        >
                            {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </main>

            <ModalPopup
                show={mostrarModalExclusao}
                titulo="Aviso!"
                tituloSecundario="Excluir Submissão"
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
