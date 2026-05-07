import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    ListGroup,
    Badge,
    Spinner,
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
    deletarEvento,
    atualizarEvento,
} from '../services/eventoService';
import { API_URL } from '../config';
import eArray from '../utils/eArray';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';

export default function EventosListar() {
    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState(''); // ✅ TASK 78
    const [alerta, setAlerta] = useState('');
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [eventoParaExcluir, setEventoParaExcluir] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        carregarEventos();
    }, []);

    const carregarEventos = async () => {
        try {
            const dados = await listarEventos();
            eArray(dados) ? setEventos(dados) : setEventos([]);
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
        } finally {
            setCarregando(false);
        }
    };

    const confirmarExclusao = (evento) => {
        setEventoParaExcluir(evento);
        setShowModal(true);
    };

    const excluirEvento = async () => {
        if (!eventoParaExcluir?.id) return;

        try {
            const data = await deletarEvento(eventoParaExcluir.id);
            setShowModal(false);
            setEventos((prev) =>
                prev.filter((e) => e.id !== eventoParaExcluir.id),
            );
            setAlerta('success');
            setMensagem(data.msg || 'Evento excluído!');

            // 4. POR ÚLTIMO: Limpa o evento selecionado (após o modal já estar fechado)
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

    const editarEvento = async (id, dados) => {
        setMensagem('');
        try {
            const eventoAtualizado = await atualizarEvento(id, dados);

            // atualiza lista
            setEventos((prev) =>
                prev.map((evento) =>
                    evento.id === id ? eventoAtualizado : evento,
                ),
            );

            setMensagem('evento atualizado com sucesso!');
            return true;
        } catch (erro) {
            console.error('Erro ao atualizar local:', erro);

            setError(erro.response?.data || 'Erro ao atualizar local');
            return false;
        } finally {
            setLoading(false);
        }
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
                            {carregando ? (
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
                                                    >
                                                        Dashboard
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        as={Link}
                                                        to={`/credenciamento/${evento.id}`}
                                                    >
                                                        Presença
                                                    </Button>
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
                                                        onClick={() =>
                                                            navigate(
                                                                `/editar_evento/${evento.id}`,
                                                            )
                                                        }
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
        </div>
    );
}
