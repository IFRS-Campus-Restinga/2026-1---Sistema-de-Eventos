import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { 
    MdCalendarToday, MdSend, MdSearch, 
    MdDescription, MdAssignment, MdFactCheck, 
    MdEmojiEvents, MdArrowForward, MdScience,
    MdSettings, MdPublic, MdMenuBook
} from 'react-icons/md';
import { useParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { buscarEventoPorId } from '../services/eventoService';

export default function DetalheEvento() {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregarDados() {
            try {
                setLoading(true);
                // Faz a chamada ao backend (Django) passando o ID
                const dados = await buscarEventoPorId(id);
                setEvento(dados);
            } catch (error) {
                console.error("Erro ao buscar detalhes do evento:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            carregarDados();
        }
    }, [id]);

    if (loading) return <p>Carregando detalhes do evento...</p>;
    if (!evento) return <p>Evento não encontrado.</p>;

    // Cores padrão do IFRS Campus Restinga
    const verdeIFRS = "#00A44B";

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />

            <main className="flex-fill">
                {/* HERO SECTION */}
                <section style={{ backgroundColor: verdeIFRS, color: 'white' }} className="py-5 text-center shadow-sm">
                    <Container>
                        <div className="d-inline-flex align-items-center bg-white text-dark px-3 py-1 rounded-pill mb-4 shadow-sm">
                            <MdCalendarToday className="me-2" color={verdeIFRS} />
                            <small className="fw-bold">20 a 22 de Outubro de 2025</small>
                        </div>
                        <h1 className="display-4 fw-bold mb-3">{evento.nome}</h1>
                        <p className="lead mx-auto mb-4" style={{ maxWidth: '800px', opacity: 0.9 }}>
                           {evento.descricao}
                        </p>
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            <Button variant="light" className="rounded-pill px-4 py-2 d-flex align-items-center fw-bold" style={{ color: verdeIFRS }}>
                                <MdSend className="me-2" /> Submeter Trabalho
                            </Button>
                            <Button variant="outline-light" className="rounded-pill px-4 py-2 d-flex align-items-center fw-bold">
                                <MdSearch className="me-2" /> Consultar Programação
                            </Button>
                        </div>
                    </Container>
                </section>

                {/* CRONOGRAMA */}
                <Container className="py-5">
                    <div className="text-center mb-5">
                        <small className="text-uppercase tracking-wider fw-bold text-muted">Fique Atento</small>
                        <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Cronograma do Evento</h2>
                    </div>

                    <Row className="text-center g-4">
                        {[
                            { label: 'Submissões', date: 'Até 15/Set', icon: <MdAssignment size={30} />, badge: 'Aberta Agora' },
                            { label: 'Avaliação', date: '16/Set a 10/Out', icon: <MdFactCheck size={30} /> },
                            { label: 'Resultados', date: '12/Out', icon: <MdEmojiEvents size={30} /> },
                            { label: 'Eventos', date: '20/Out a 22/Out', icon: <MdCalendarToday size={30} /> },
                        ].map((item, idx) => (
                            <Col key={idx} xs={6} md={3}>
                                <div className="p-3">
                                    <div className="mb-3" style={{ color: verdeIFRS }}>{item.icon}</div>
                                    <h6 className="fw-bold mb-1">{item.label}</h6>
                                    <p className="text-muted small mb-2">{item.date}</p>
                                    {item.badge && <Badge bg="success" className="px-3">{item.badge}</Badge>}
                                </div>
                            </Col>
                        ))}
                    </Row>
                    <hr className="my-5 opacity-10" />
                </Container>

                {/* ÁREAS TEMÁTICAS */}
                <Container className="pb-5">
                    <div className="d-flex justify-content-between align-items-end mb-4">
                        <div>
                            <h3 className="fw-bold" style={{ color: verdeIFRS }}>Áreas Temáticas</h3>
                            <p className="text-muted mb-0">Aceitamos submissões de trabalhos nas seguintes grandes áreas do conhecimento.</p>
                        </div>
                        <Button variant="link" className="text-decoration-none d-flex align-items-center fw-bold p-0" style={{ color: verdeIFRS }}>
                            Ver regulamento completo <MdArrowForward className="ms-2" />
                        </Button>
                    </div>

                    <Row className="g-4">
                        {[
                            { title: 'Ciências Exatas e da Terra', icon: <MdScience size={24} /> },
                            { title: 'Engenharias', icon: <MdSettings size={24} /> },
                            { title: 'Ciências Humanas', icon: <MdPublic size={24} /> },
                            { title: 'Linguística, Letras e Artes', icon: <MdMenuBook size={24} /> },
                        ].map((area, idx) => (
                            <Col key={idx} md={3}>
                                <div className="h-100 p-4 border rounded-3 shadow-sm bg-light-subtle d-flex flex-column align-items-start">
                                    <div className="p-2 bg-white rounded shadow-sm mb-3" style={{ color: verdeIFRS }}>
                                        {area.icon}
                                    </div>
                                    <h5 className="fw-bold">{area.title}</h5>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>

                {/* DESCRIÇÃO */}
                <section className="py-5 bg-light">
                    <Container>
                        <div className="text-center mb-4">
                            <h3 className="fw-bold" style={{ color: verdeIFRS }}>Descrição do Evento</h3>
                        </div>
                        <p className="text-center mx-auto text-muted" style={{ maxWidth: '900px', lineHeight: '1.8', textAlign: 'justify' }}>
                            {evento.descricao}
                        </p>
                    </Container>
                </section>
            </main>

            <Footer 
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}