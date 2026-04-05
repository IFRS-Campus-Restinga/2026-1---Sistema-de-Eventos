import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { MdEvent, MdAddCircle, MdArrowBack, MdAccessTime, MdBusiness, MdInfoOutline } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { listarEventos } from '../services/eventoService';

export default function EventosListar() {
    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const carregarEventos = async () => {
            try {
                const dados = await listarEventos();
                setEventos(dados);
            } catch (error) {
                console.error('Erro ao buscar eventos:', error);
            } finally {
                setCarregando(false);
            }
        };
        carregarEventos();
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    <Card corBorda="#00A44B">
                        <Container fluid className="mb-5 px-4">
                            {/* Título da Página */}
                            <Row className="pt-5 pb-2">
                                <Col className="d-flex align-items-center">
                                    <MdEvent color="#00A44B" size={35} />
                                    <h3 className="fw-bold ms-2 mb-0" style={{ color: "#00A44B" }}>
                                        Eventos do Campus
                                    </h3>
                                </Col>
                            </Row>
                            <hr className="mb-4" />

                            {/* Estado de Carregamento */}
                            {carregando ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="mt-2 text-muted">Buscando eventos no sistema...</p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {eventos?.length > 0 ? (
                                        eventos.map((evento, index) => (
                                            <ListGroup.Item
                                                key={evento.id || index}
                                                className="d-flex justify-content-between align-items-center mb-3 border rounded shadow-sm p-3"
                                                style={{ borderLeft: '5px solid #00A44B' }}
                                            >
                                                <div className="d-flex flex-column">
                                                    <div className="fs-5 fw-bold text-dark mb-1">
                                                        {evento.nome}
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-3 text-muted small">
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdInfoOutline /> <strong>Tema:</strong> {evento.tema}
                                                        </span>
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdAccessTime /> <strong>Carga:</strong> {evento.carga_horaria}h
                                                        </span>
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdBusiness /> <strong>Setor:</strong> {evento.setor}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-end">
                                                    <Badge pill bg="success" className="px-3 py-2">
                                                        {evento.status_evento?.toUpperCase() || 'N/A'}
                                                    </Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">Nenhum evento cadastrado até o momento.</p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}

                            {/* Botão de Ação Principal */}
                            <div className="mt-4">
                                <Button
                                    as={Link}
                                    to="/adicionarEvento"
                                    variant="success"
                                    className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{ backgroundColor: '#00A44B', border: 'none' }}
                                >
                                    <MdAddCircle size={20} /> Novo Evento
                                </Button>
                            </div>
                        </Container>
                    </Card>

                    {/* Botão Voltar */}
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

            <Footer telefone="(51) 3333-1234" endereco="Rua Alberto Hoffmann, 285" ano={2026} campus="Campus Restinga" />
        </div>
    );
}