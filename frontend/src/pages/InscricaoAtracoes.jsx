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
import { pegarEspacos } from '../services/espacoService';
import { getSelectedEventoId } from '../utils/selectedEvento';
import { buscarEventoPorId } from '../services/eventoService';
import useInscricoesAtracao from '../hooks/useInscricoesAtracao';

const LIMITS_EDICAO = {
    titulo: { minWords: 1, maxWords: 150 },
    palavrasChave: { maxChars: 100 },
};

export default function InscricaoAtracoes() {
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
        espaco: '',
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
    const [espacosEdicao, setEspacosEdicao] = useState([]);

    const navigate = useNavigate();
    const eventoFiltroId = getSelectedEventoId();
    const eventoSelecionadoLista = useMemo(() => {
        if (!eventoFiltroId) return null;

        return (
            eventosEdicao.find(
                (evento) => String(evento.id) === String(eventoFiltroId),
            ) || null
        );
    }, [eventosEdicao, eventoFiltroId]);
    const {
        criarInscricao,
        usuarioLogado,
        carregandoUsuario,
        estaInscritoEmAtracao,
        loading: carregandoInscricao,
    } = useInscricoesAtracao();

    const contarPalavras = (texto) =>
        texto
            ?.trim()
            .split(/\s+/)
            .filter((palavra) => palavra.length > 0).length || 0;

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
        const carregarEspacosEdicao = async () => {
            const localId = eventoEdicaoDetalhe?.local?.id;

            if (!mostrarModalEdicao || !formEdicao.evento || !localId) {
                setEspacosEdicao([]);
                return;
            }

            try {
                const espacos = await pegarEspacos(localId);
                setEspacosEdicao(espacos || []);

                setFormEdicao((prev) => {
                    const espacoAtualValido = (espacos || []).some(
                        (espaco) => String(espaco.id) === String(prev.espaco),
                    );

                    if (espacoAtualValido) {
                        return prev;
                    }

                    return { ...prev, espaco: '' };
                });
            } catch (error) {
                console.error('Erro ao carregar espaços da edição:', error);
                setEspacosEdicao([]);
            }
        };

        carregarEspacosEdicao();
    }, [mostrarModalEdicao, formEdicao.evento, eventoEdicaoDetalhe]);

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
        setFormEdicao({
            id: atracao.id,
            titulo: atracao.titulo || '',
            resumo: atracao.resumo || '',
            espaco: atracao.espaco || atracao.espaco_detalhe?.id || '',
            status: atracao.status || 'PREVISTA',
            palavras_chave: atracao.palavras_chave || '',
            modalidade: atracao.modalidade || '',
            nivel_ensino: atracao.nivel_ensino || '',
            area_conhecimento: atracao.area_conhecimento || '',
            orientador: atracao.orientador,
            sou_orientador: atracao.sou_orientador || false,
            acessibilidade: atracao.acessibilidade || false,
            evento: atracao.evento,
            equipe: Array.isArray(atracao.equipe)
                ? atracao.equipe.map((membro) => ({
                      nome: membro.nome || '',
                      instituicao_curso: membro.instituicao_curso || '',
                      funcao: membro.funcao || '',
                  }))
                : [],
        });
        setMostrarModalEdicao(true);
    };

    const abrirModalInscricao = (atracao) => {
        setFormEdicao({
            id: atracao.id,
            titulo: atracao.titulo || '',
            resumo: atracao.resumo || '',
            espaco: atracao.espaco || atracao.espaco_detalhe?.id || '',
            status: atracao.status || 'PREVISTA',
            palavras_chave: atracao.palavras_chave || '',
            modalidade: atracao.modalidade || '',
            nivel_ensino: atracao.nivel_ensino || '',
            area_conhecimento: atracao.area_conhecimento || '',
            orientador: atracao.orientador,
            sou_orientador: atracao.sou_orientador || false,
            acessibilidade: atracao.acessibilidade || false,
            evento: atracao.evento,
            equipe: Array.isArray(atracao.equipe)
                ? atracao.equipe.map((membro) => ({
                      nome: membro.nome || '',
                      instituicao_curso: membro.instituicao_curso || '',
                      funcao: membro.funcao || '',
                  }))
                : [],
        });
        setMostrarModalEdicao(true);
    };

    const getNomeUsuario = (usuario) =>
        usuario?.nome ||
        usuario?.name ||
        usuario?.username ||
        `Usuário ${usuario?.id}`;

    const handleInscrever = async () => {
        if (!usuarioLogado) {
            mostrarAlerta('Faça login antes de se inscrever.', 'danger');
            return;
        }
        if (!formEdicao?.id) return;

        const jaInscrito = estaInscritoEmAtracao(formEdicao.id);
        if (jaInscrito) {
            mostrarAlerta('Você já está inscrito nessa atração.', 'warning');
            return;
        }

        try {
            setSalvandoEdicao(true);
            await criarInscricao({
                perfil_id: usuarioLogado.perfil_id,
                atracao_id: formEdicao.id,
            });
            mostrarAlerta('Inscrição realizada com sucesso.', 'success');
            setMostrarModalEdicao(false);
            await carregarAtracoes();
        } catch (erro) {
            const msg =
                erro?.response?.data?.mensagem ||
                erro?.response?.data ||
                erro?.message ||
                'Erro ao inscrever.';
            mostrarAlerta(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSalvandoEdicao(false);
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
                        <Container fluid className="mb-2 px-4">
                            <Row className="pt-5 pb-2">
                                <Col className="d-flex align-items-center">
                                    <MdEvent color="#00A44B" size={35} />
                                    <h3
                                        className="fw-bold ms-2 mb-0"
                                        style={{ color: '#00A44B' }}
                                    >
                                        {eventoSelecionadoLista?.nome ||
                                            `ID ${eventoFiltroId}`}{' '}
                                    </h3>
                                </Col>
                            </Row>

                            <hr className="mb-4" />

                            <Row className="mb-4">
                                <Col md={8} lg={6}>
                                    <Form.Group>
                                        <Form.Label
                                            className="fw-bold"
                                            style={{ color: '#00A44B' }}
                                        >
                                            Buscar atração
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={termoBusca}
                                            onChange={(e) =>
                                                setTermoBusca(e.target.value)
                                            }
                                            placeholder="Digite titulo ou local"
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
                                    <Spinner
                                        animation="border"
                                        variant="success"
                                    />
                                    <p className="mt-2 text-muted">
                                        Buscando submissões no sistema...
                                    </p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {/** mostra apenas atrações do tipo oficina */}
                                    {atracoesFiltradas?.filter(
                                        (a) =>
                                            (a.tipo || '')
                                                .toString()
                                                .toLowerCase() === 'oficina',
                                    ).length > 0 ? (
                                        atracoesFiltradas
                                            .filter(
                                                (a) =>
                                                    (a.tipo || '')
                                                        .toString()
                                                        .toLowerCase() ===
                                                    'oficina',
                                            )
                                            .map((atracao, index) => (
                                                <ListGroup.Item
                                                    key={atracao.id || index}
                                                    className="d-flex justify-content-between align-items-center mb-3 border rounded shadow-sm p-3"
                                                    style={{
                                                        borderLeft:
                                                            '5px solid #00A44B',
                                                    }}
                                                >
                                                    <div className="d-flex flex-column">
                                                        <div className="fs-5 fw-bold text-dark mb-1">
                                                            {atracao.titulo}
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-3 text-muted small">
                                                            <span className="d-flex align-items-center gap-1">
                                                                <MdInfoOutline />{' '}
                                                                <strong>
                                                                    Tipo:
                                                                </strong>{' '}
                                                                {atracao.tipo}
                                                            </span>
                                                            <span className="d-flex align-items-center gap-1">
                                                                <MdPlace />{' '}
                                                                <strong>
                                                                    Local:
                                                                </strong>{' '}
                                                                {
                                                                    atracao.local_atracao
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2">
                                                        {/* não exibir badge de status e nem permitir editar/excluir nesta página de inscrição */}
                                                        <Button
                                                            variant="outline-success"
                                                            className="d-flex align-items-center gap-1"
                                                            onClick={() =>
                                                                abrirModalInscricao(
                                                                    atracao,
                                                                )
                                                            }
                                                        >
                                                            Visualizar
                                                        </Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">
                                                {atracoes.length > 0
                                                    ? 'Nenhuma oficina encontrada para o termo informado.'
                                                    : 'Nenhuma oficina cadastrada até o momento.'}
                                            </p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}
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
            </main>

            <Modal
                show={mostrarModalEdicao}
                onHide={() => setMostrarModalEdicao(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {formEdicao.titulo || 'Detalhes da atração'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <h6 className="mb-1">Resumo</h6>
                    <p className="text-muted">{formEdicao.resumo || '—'}</p>
                    <hr />

                    <h6 className="mb-1">Autor / Orientador</h6>
                    <p className="text-muted">
                        {getNomeUsuario(formEdicao.orientador) || '—'}
                    </p>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setMostrarModalEdicao(false)}
                    >
                        Fechar
                    </Button>

                    <Button
                        variant="success"
                        onClick={handleInscrever}
                        disabled={
                            salvandoEdicao ||
                            carregandoUsuario ||
                            carregandoInscricao ||
                            !formEdicao?.id
                        }
                    >
                        {salvandoEdicao ? 'Inscrevendo...' : 'Inscrever-se'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
