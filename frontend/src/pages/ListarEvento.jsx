import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    ListGroup,
    Badge,
    Spinner,
    Modal,
    Form,
} from 'react-bootstrap';
import {
    MdEdit,
    MdDelete,
    MdEvent,
    MdAddCircle,
    MdArrowBack,
    MdAccessTime,
    MdBusiness,
    MdInfoOutline,
    MdLocationOn,
} from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import {
    listarEventos,
    listarMeusEventosCoordenador,
    deletarEvento,
} from '../services/eventoService';
import { API_URL } from '../config';
import eArray from '../utils/eArray';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';
import { QRCodeCanvas } from 'qrcode.react';
import {
    clearSelectedEventoId,
    getSelectedEventoId,
    setSelectedEventoId,
    adicionarEventoRecenteAdminId,
} from '../utils/selectedEvento';
import { getCurrentUser } from '../services/authService';

export default function EventosListar() {
    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [usuarioAtual, setUsuarioAtual] = useState(null);
    const [usuarioCarregado, setUsuarioCarregado] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [alerta, setAlerta] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [eventoParaExcluir, setEventoParaExcluir] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [eventoQrSelecionado, setEventoQrSelecionado] = useState(null);
    const navigate = useNavigate();

    const qrContainerRef = useRef(null);

    const registrarEventoSelecionado = (eventoId) => {
        setSelectedEventoId(eventoId);
        adicionarEventoRecenteAdminId(eventoId);
    };

    useEffect(() => {
        let ativo = true;

        (async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!ativo) return;
                setUsuarioAtual(currentUser);
            } catch (e) {
                console.log(e);
                setUsuarioAtual(null);
            } finally {
                if (ativo) {
                    setCarregandoUsuario(false);
                    setUsuarioCarregado(true);
                }
            }
        })();

        return () => {
            ativo = false;
        };
    }, []);

    const gruposUsuario = Array.isArray(usuarioAtual?.groups)
        ? usuarioAtual.groups
              .map((group) => (typeof group === 'string' ? group : group?.name))
              .filter(Boolean)
        : [];

    const grupo = usuarioAtual?.group;
    const isCoordenador =
        gruposUsuario.includes('Coordenador') || grupo === 'Coordenador';

    const podeVerQr = gruposUsuario.some((grupo) =>
        ['Administrador', 'Coordenador'].includes(grupo),
    );

    useEffect(() => {
        if (!usuarioCarregado) return;

        const carregarEventos = async () => {
            try {
                const dados = isCoordenador
                    ? await listarMeusEventosCoordenador()
                    : await listarEventos();

                Array.isArray(dados) ? setEventos(dados) : setEventos([]);
            } catch (e) {
                console.error('Erro ao buscar eventos:', e);
                setEventos([]);
            } finally {
                setCarregando(false);
            }
        };

        carregarEventos();
    }, [isCoordenador, usuarioCarregado]);

    const abrirQr = (evento) => {
        registrarEventoSelecionado(evento.id);
        setEventoQrSelecionado(evento);
        setShowQrModal(true);
    };

    const fecharQr = () => {
        setShowQrModal(false);
        setEventoQrSelecionado(null);
    };

    const urlCredenciamento = eventoQrSelecionado
        ? `${window.location.origin}/credenciamento/${eventoQrSelecionado.slug}`
        : '';

    const confirmarExclusao = (evento) => {
        setEventoParaExcluir(evento);
        setShowModal(true);
    };

    const excluirEvento = async () => {
        if (!eventoParaExcluir?.id) {
            return;
        }

        const eventoId = eventoParaExcluir.id;

        try {
            const data = await deletarEvento(eventoId);
            setShowModal(false);
            setEventos((prev) => prev.filter((e) => e.id !== eventoId));
            setAlerta('success');
            setMensagem(data.msg || 'Evento excluído!');

            const eventoSelecionado = getSelectedEventoId();
            if (
                eventoSelecionado &&
                Number(eventoSelecionado) === Number(eventoId)
            ) {
                clearSelectedEventoId();
            }

            setTimeout(() => {
                setEventoParaExcluir(null);
            }, 300);
        } catch (error) {
            console.error('Erro na exclusão:', error);
            setAlerta('danger');
            const erroMsg =
                error.response?.data?.erro || 'Erro ao processar a exclusão';
            setMensagem(erroMsg);
        }
    };

    // editarEvento removido: função não utilizada na tela atual e gerava erro no eslint no-unused-vars

    // pra baixar um jpeg ou png do qrcode bem bolado
    const baixarQr = (formato = 'png') => {
        const canvas = qrContainerRef.current?.querySelector('canvas');
        if (!canvas || !eventoQrSelecionado) return;

        const mimeType = formato === 'jpeg' ? 'image/jpeg' : 'image/png';
        const extensao = formato === 'jpeg' ? 'jpg' : 'png';

        const link = document.createElement('a');
        link.download = `qrcode-${eventoQrSelecionado.slug}.${extensao}`;
        link.href = canvas.toDataURL(mimeType, 1);
        link.click();
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    <Card corBorda="#00A44B">
                        <Container fluid className="mb-5 px-4">
                            {/* Título */}
                            <Row className="pt-5 pb-2">
                                <Col className="d-flex align-items-center">
                                    <MdEvent color="#00A44B" size={35} />
                                    <h3
                                        className="fw-bold ms-2 mb-0"
                                        style={{ color: '#00A44B' }}
                                    >
                                        Eventos do Campus
                                    </h3>
                                </Col>
                            </Row>

                            <hr className="mb-4" />

                            {/* Loading */}
                            {carregando || carregandoUsuario ? (
                                <div className="text-center py-5">
                                    <Spinner
                                        animation="border"
                                        variant="success"
                                    />
                                    <p className="mt-2 text-muted">
                                        Buscando eventos no sistema...
                                    </p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {eventos?.length > 0 ? (
                                        eventos.map((evento, index) => (
                                            <ListGroup.Item
                                                key={evento.id || index}
                                                className="d-flex justify-content-between align-items-center mb-3 border rounded shadow-sm p-3"
                                                style={{
                                                    borderLeft:
                                                        '5px solid #00A44B',
                                                }}
                                            >
                                                {/* INFO */}
                                                <div className="d-flex flex-column">
                                                    <div className="fs-5 fw-bold text-dark mb-1">
                                                        {evento.nome}
                                                    </div>

                                                    <div className="d-flex flex-wrap gap-3 text-muted small">
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdInfoOutline />{' '}
                                                            <strong>
                                                                Tema:
                                                            </strong>{' '}
                                                            {evento.tema}
                                                        </span>

                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdAccessTime />{' '}
                                                            <strong>
                                                                Carga Horária:
                                                            </strong>{' '}
                                                            {
                                                                evento.carga_horaria
                                                            }
                                                            h
                                                        </span>

                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdBusiness />{' '}
                                                            <strong>
                                                                Setor:
                                                            </strong>{' '}
                                                            {evento.setor}
                                                        </span>

                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdLocationOn />{' '}
                                                            <strong>
                                                                Local:
                                                            </strong>{' '}
                                                            {evento.local
                                                                ?.nome ||
                                                                'Carregando...'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* AÇÕES */}
                                                <div className="text-end d-flex flex-column gap-2">
                                                    <Badge
                                                        pill
                                                        bg="success"
                                                        className="px-3 py-2"
                                                    >
                                                        {evento.status_evento?.toUpperCase() ||
                                                            'N/A'}
                                                    </Badge>

                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        as={Link}
                                                        to={`/dashboard/${evento.id}`}
                                                        onClick={() =>
                                                            registrarEventoSelecionado(
                                                                evento.id,
                                                            )
                                                        }
                                                    >
                                                        Dashboard
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        as={Link}
                                                        to={`/credenciamento/${evento.slug}`}
                                                        onClick={() =>
                                                            registrarEventoSelecionado(
                                                                evento.id,
                                                            )
                                                        }
                                                    >
                                                        Presença
                                                    </Button>
                                                    {podeVerQr && (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() =>
                                                                abrirQr(evento)
                                                            }
                                                        >
                                                            QR Code
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            confirmarExclusao(
                                                                evento,
                                                            )
                                                        }
                                                    >
                                                        <MdDelete size={22} />
                                                    </Button>

                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        onClick={() => {
                                                            registrarEventoSelecionado(
                                                                evento.id,
                                                            );
                                                            navigate(
                                                                `/editar_evento/${evento.id}`,
                                                            );
                                                        }}
                                                    >
                                                        <MdEdit size={22} />
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">
                                                Nenhum evento cadastrado até o
                                                momento.
                                            </p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}

                            {/* Botão Novo Evento */}
                            <div className="mt-4">
                                <Button
                                    as={Link}
                                    to="/adicionar_evento"
                                    variant="success"
                                    className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{
                                        backgroundColor: '#00A44B',
                                        border: 'none',
                                    }}
                                >
                                    <MdAddCircle size={20} /> Novo Evento
                                </Button>
                            </div>

                            {/* Botão voltar para home */}
                            <div className="mt-4">
                                <Button
                                    as={Link}
                                    to="/"
                                    variant="outline-secondary"
                                    className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                >
                                    Ir para página inicial
                                </Button>
                            </div>
                        </Container>
                    </Card>

                    {mensagem && (
                        <div>
                            <Alerta
                                mensagem={mensagem}
                                variacao={alerta}
                                duracao={5000}
                            />
                        </div>
                    )}
                </Container>
            </main>

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
            <ModalPopup
                show={showModal}
                titulo={`${eventoParaExcluir?.nome}` || 'Excluir Evento'}
                tituloSecundario=""
                texto="Quer realmente excluir o evento?"
                textoFechar="Voltar"
                onFechar={() => setShowModal(false)}
                textoAcao="excluir"
                onAcao={excluirEvento}
                variante="danger"
            />

            <Modal show={showQrModal} onHide={fecharQr} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>QR Code de presença</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    {eventoQrSelecionado && (
                        <>
                            <h5 className="fw-bold mb-2">
                                {eventoQrSelecionado.nome}
                            </h5>
                            <p className="text-muted mb-4">
                                Aponte a câmera para este QR code para abrir a
                                página de credenciamento.
                            </p>

                            <div
                                className="d-inline-flex flex-column align-items-center p-4 bg-white rounded shadow-sm mb-4 border"
                                ref={qrContainerRef}
                            >
                                <QRCodeCanvas
                                    value={urlCredenciamento}
                                    size={280}
                                    includeMargin
                                />
                            </div>

                            <Form.Control
                                readOnly
                                value={urlCredenciamento}
                                className="text-center mb-3"
                            />

                            {/* uma mão pra fazer isso, tá? n vai n */}
                            <div className="d-flex justify-content-center gap-2 mb-3">
                                <Button onClick={() => baixarQr('png')}>
                                    Baixar PNG
                                </Button>
                                <Button onClick={() => baixarQr('jpeg')}>
                                    Baixar JPEG
                                </Button>
                            </div>
                        </>
                    )}
                    {!carregandoUsuario && !podeVerQr && (
                        <p className="text-muted mb-0">
                            QR code disponível apenas para coordenadores e
                            administradores.
                        </p>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}
