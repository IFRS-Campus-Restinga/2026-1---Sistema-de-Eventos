import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { MdEvent, MdAddCircle, MdArrowBack, MdAccessTime, MdInfoOutline, MdPlace, MdGrade } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { listarAtracoes } from '../services/atracaoService';

export default function ListarAtracoes() {
    const [atracoes, setAtracoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const carregarAtracoes = async () => {
            try {
                const dados = await listarAtracoes();
                setAtracoes(dados);
            } catch (error) {
                console.error('Erro ao buscar atrações:', error);
            } finally {
                setCarregando(false);
            }
        };
        carregarAtracoes();
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    <Card corBorda="#00A44B">
                        <Container fluid className="mb-5 px-4">
                            <Row className="pt-5 pb-2">
                                <Col className="d-flex align-items-center">
                                    <MdEvent color="#00A44B" size={35} />
                                    <h3 className="fw-bold ms-2 mb-0" style={{ color: "#00A44B" }}>
                                        Atrações Cadastradas
                                    </h3>
                                </Col>
                            </Row>
                            <hr className="mb-4" />

                            {carregando ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="mt-2 text-muted">Buscando atrações no sistema...</p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {atracoes?.length > 0 ? (
                                        atracoes.map((atracao, index) => (
                                            <ListGroup.Item
                                                key={atracao.id || index}
                                                className="d-flex justify-content-between align-items-center mb-3 border rounded shadow-sm p-3"
                                                style={{ borderLeft: '5px solid #00A44B' }}
                                            >
                                                <div className="d-flex flex-column">
                                                    <div className="fs-5 fw-bold text-dark mb-1">
                                                        {atracao.titulo}
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-3 text-muted small">
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdInfoOutline /> <strong>Tipo:</strong> {atracao.tipo}
                                                        </span>
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdPlace /> <strong>Local:</strong> {atracao.local_atracao}
                                                        </span>
                                                        <span className="d-flex align-items-center gap-1">
                                                            <MdAccessTime /> <strong>Início:</strong> {new Date(atracao.data_hora_inicio).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-end d-flex flex-column align-items-end gap-2">
                                                    <Badge pill bg="success" className="px-3 py-2">
                                                        {atracao.status?.toUpperCase() || 'N/A'}
                                                    </Badge>
                                                    <Button
                                                        as={Link}
                                                        to={`/avaliarSubmissao/${atracao.id}`}
                                                        size="sm"
                                                        style={{ backgroundColor: '#003366', border: 'none' }}
                                                        className="d-flex align-items-center gap-1"
                                                    >
                                                        <MdGrade size={16} /> Avaliar
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">Nenhuma atração cadastrada até o momento.</p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}

                            <div className="mt-4">
                                <Button
                                    as={Link}
                                    to="/adicionarAtracao"
                                    variant="success"
                                    className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{ backgroundColor: '#00A44B', border: 'none' }}
                                >
                                    <MdAddCircle size={20} /> Nova Atração
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
            </main>

            <Footer telefone="(51) 3333-1234" endereco="Rua Alberto Hoffmann, 285" ano={2026} campus="Campus Restinga" />
        </div>
    );
}
