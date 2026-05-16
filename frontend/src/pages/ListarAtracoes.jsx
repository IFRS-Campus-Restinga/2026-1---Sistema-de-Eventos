import React, { useEffect, useMemo, useState } from 'react';
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
    MdAccessTime,
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
    editarAtracao,
    excluirAtracao,
    listarAtracoes,
} from '../services/atracaoService';
import { getSelectedEventoId } from '../utils/selectedEvento';

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
        local_atracao: '',
        data_hora_inicio: '',
        data_hora_fim: '',
        status: 'PREVISTA',
    });
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
    });

    const navigate = useNavigate();

    const mostrarAlerta = (mensagem, variacao = 'danger') => {
        setAlerta((prev) => ({
            ...prev,
            mensagem,
            variacao,
            reacao: (prev.reacao || 0) + 1,
        }));
    };

    const carregarAtracoes = async () => {
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
    };

    useEffect(() => {
        carregarAtracoes();
    }, []);

    const formatarDataHora = (valor) => {
        if (!valor) return 'Não informado';

        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return 'Não informado';

        return data.toLocaleString('pt-BR');
    };

    const formatarParaDatetimeLocal = (valor) => {
        if (!valor) return '';

        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return '';

        const pad = (numero) => String(numero).padStart(2, '0');
        const ano = data.getFullYear();
        const mes = pad(data.getMonth() + 1);
        const dia = pad(data.getDate());
        const hora = pad(data.getHours());
        const minuto = pad(data.getMinutes());

        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    };

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
            local_atracao: atracao.local_atracao || '',
            data_hora_inicio: formatarParaDatetimeLocal(atracao.data_hora_inicio),
            data_hora_fim: formatarParaDatetimeLocal(atracao.data_hora_fim),
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

    const handleSalvarEdicao = async () => {
        if (!formEdicao.id) return;

        if (!formEdicao.titulo || !formEdicao.evento) {
            mostrarAlerta('Título e evento são obrigatórios para salvar alterações.');
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
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdAccessTime /> <strong>Início:</strong>{' '}
                                                            {formatarDataHora(atracao.data_hora_inicio)}
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
                                            Início
                                        </Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            value={formEdicao.data_hora_inicio || ''}
                                            onChange={(e) =>
                                                setFormEdicao((prev) => ({
                                                    ...prev,
                                                    data_hora_inicio: e.target.value,
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Fim
                                        </Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            value={formEdicao.data_hora_fim || ''}
                                            onChange={(e) =>
                                                setFormEdicao((prev) => ({
                                                    ...prev,
                                                    data_hora_fim: e.target.value,
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={7}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                            Local
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formEdicao.local_atracao || ''}
                                            onChange={(e) =>
                                                setFormEdicao((prev) => ({
                                                    ...prev,
                                                    local_atracao: e.target.value,
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
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
