import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import {
    MdCalendarToday,
    MdSend,
    MdSearch,
    MdAssignment,
    MdArrowForward,
    MdScience,
    MdSettings,
    MdPublic,
    MdMenuBook,
    MdFactCheck,
    MdEmojiEvents,
} from 'react-icons/md';
import { useParams, Link } from 'react-router-dom';
import { setSelectedEventoId } from '../utils/selectedEvento';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { buscarEventoPorId } from '../services/eventoService';
import { listarMinhasInscricoesEventos } from '../services/inscricaoEventoService';
import { getCurrentUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { podeAcessarSubmissao } from '../utils/submissaoAcesso';

export default function DetalheEvento() {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [estaInscritoEvento, setEstaInscritoEvento] = useState(false);
    const [submissaoHabilitada, setSubmissaoHabilitada] = useState(true);
    const navigate = useNavigate();
    const verdeIFRS = '#00A44B';

    // Função para mapear ícones baseados no nome da área (opcional, para ficar igual ao Figma)
    const getIconArea = (nome) => {
        const n = nome.toLowerCase();
        if (n.includes('exatas')) return <MdScience size={24} />;
        if (n.includes('engenharias')) return <MdSettings size={24} />;
        if (n.includes('humanas')) return <MdPublic size={24} />;
        return <MdMenuBook size={24} />;
    };

    useEffect(() => {
        async function carregarDados() {
            try {
                setLoading(true);
                const [dados, minhas, usuarioAtual] = await Promise.all([
                    buscarEventoPorId(id),
                    listarMinhasInscricoesEventos(),
                    getCurrentUser(),
                ]);

                setEvento(dados);
                setSubmissaoHabilitada(
                    podeAcessarSubmissao({
                        evento: dados,
                        usuario: usuarioAtual,
                    }),
                );

                // ve se o usuário está inscrito no evento pra disponibilizar o botão de inscrição em atrações
                try {
                    const inscrito = Array.isArray(minhas)
                        ? minhas.some((i) => Number(i.evento_id) === Number(id))
                        : false;
                    setEstaInscritoEvento(inscrito);
                } catch (err) {
                    console.debug(
                        'Não foi possível verificar inscrições do usuário:',
                        err,
                    );
                    setEstaInscritoEvento(false);
                }
            } catch (error) {
                console.error('Erro ao buscar detalhes do evento:', error);
            } finally {
                setLoading(false);
            }
        }
        if (id) carregarDados();
    }, [id]);

    if (loading)
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="success" />
            </div>
        );

    if (!evento)
        return <p className="text-center mt-5">Evento não encontrado.</p>;

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />

            <main className="flex-fill">
                {/* HERO SECTION - Fundo Verde sólido como no Figma */}
                <section
                    style={{
                        backgroundImage:
                            'linear-gradient(to right,#17882c 0,#00510f 100%)',
                        color: 'white',
                    }}
                    className="py-5 text-center shadow-sm"
                >
                    <Container>
                        <div className="d-inline-flex align-items-center bg-white text-dark px-3 py-1 rounded-pill mb-4 shadow-sm">
                            <MdCalendarToday
                                className="me-2"
                                color={verdeIFRS}
                            />
                            <small className="fw-bold">
                                {evento.etapas?.[0]
                                    ? `${new Date(
                                          evento.etapas[0].data_inicio,
                                      ).toLocaleDateString('pt-BR')} em diante`
                                    : 'Data a definir'}
                            </small>
                        </div>
                        <h1 className="display-4 fw-bold mb-3 text-capitalize">
                            {evento.nome}
                        </h1>
                        <p
                            className="lead mx-auto mb-4"
                            style={{ maxWidth: '800px', opacity: 0.9 }}
                        >
                            {evento.descricao?.substring(0, 150)}...
                        </p>
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            {submissaoHabilitada && (
                                <Button
                                    variant="light"
                                    as={Link}
                                    to="/adicionar_submissao"
                                    onClick={() => setSelectedEventoId(id)}
                                    className="rounded-pill px-4 py-2 d-flex align-items-center fw-bold shadow-sm"
                                    style={{ color: verdeIFRS }}
                                >
                                    <MdSend className="me-2" /> Submeter
                                    Trabalho
                                </Button>
                            )}

                            <Button
                                variant="outline-light"
                                as={Link}
                                to={`/inscrever_atracoes/${evento.id}`}
                                onClick={() => setSelectedEventoId(evento.id)}
                                className="rounded-pill px-4 py-2 d-flex align-items-center fw-bold border-2"
                            >
                                <MdFactCheck className="me-2" /> Inscrever em
                                Atrações
                            </Button>

                            <Button
                                variant="outline-light"
                                className="rounded-pill px-4 py-2 d-flex align-items-center fw-bold border-2"
                                onClick={() =>
                                    navigate(`/programacao_evento/${evento.id}`)
                                }
                            >
                                <MdSearch className="me-2" /> Consultar
                                Programação
                            </Button>
                        </div>
                    </Container>
                </section>

                {/* CRONOGRAMA - Estilo Cards do Figma */}
                <Container className="py-5">
                    <div className="text-center mb-5">
                        <small
                            className="text-uppercase fw-bold text-muted"
                            style={{ letterSpacing: '2px' }}
                        >
                            Fique Atento
                        </small>
                        <h2
                            className="fw-bold mt-2"
                            style={{ color: '#1a2a3a' }}
                        >
                            Cronograma do Evento
                        </h2>
                    </div>

                    <Row className="justify-content-center g-4">
                        {evento.etapas?.map((etapa, idx) => (
                            <Col key={idx} xs={12} sm={6} md={3}>
                                <div
                                    className="h-100 p-4 border-0 rounded-4 bg-white shadow-sm text-center d-flex flex-column align-items-center justify-content-center"
                                    style={{ transition: 'transform 0.2s' }}
                                >
                                    <div
                                        className="p-3 rounded-circle mb-3"
                                        style={{
                                            backgroundColor: '#f0fff4',
                                            color: verdeIFRS,
                                        }}
                                    >
                                        <MdAssignment size={32} />
                                    </div>
                                    <h6
                                        className="fw-bold mb-1 text-uppercase"
                                        style={{
                                            fontSize: '0.85rem',
                                            color: '#4a5568',
                                        }}
                                    >
                                        {etapa.tipo_etapa_display ||
                                            etapa.tipo_etapa}
                                    </h6>
                                    <p
                                        className="fw-bold mb-0"
                                        style={{ color: '#2d3748' }}
                                    >
                                        {new Date(
                                            etapa.data_inicio,
                                        ).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'long',
                                        })}
                                        /
                                        {new Date(
                                            etapa.data_fim,
                                        ).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'long',
                                        })}
                                    </p>
                                    <Badge
                                        bg="success"
                                        className="mt-2 px-3 rounded-pill"
                                        style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Ativo
                                    </Badge>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
                <hr className="my-5 mx-auto w-50 opacity-25" />

                {/* ÁREAS TEMÁTICAS - Cards horizontais com ícones à esquerda */}
                <div className="bg-light py-5">
                    <Container>
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                            <h3
                                className="fw-bold mb-0"
                                style={{ color: verdeIFRS }}
                            >
                                Áreas do Evento
                            </h3>
                            <Button
                                as="a"
                                href={evento.link_edital}
                                target="_blank"
                                variant="link"
                                className="text-decoration-none fw-bold p-0 d-flex align-items-center"
                                style={{ color: verdeIFRS }}
                            >
                                Ver regulamento completo{' '}
                                <MdArrowForward className="ms-2" />
                            </Button>
                        </div>

                        <div>
                            <p>
                                Aceitamos submissões de trabalhos nas seguintes
                                grandes áreas do conhecimento.
                            </p>
                        </div>

                        {/* ÁREAS TEMÁTICAS REAIS */}
                        <Row className="g-4">
                            {/* Tentamos buscar em 'area_conhecimento_detalhes', se não existir, tentamos em 'area_conhecimento' */}
                            {(
                                evento.area_conhecimento_detalhes ||
                                evento.area_conhecimento
                            )?.map((area, idx) => (
                                <Col key={idx} md={6} lg={3}>
                                    <div
                                        className="p-4 bg-white rounded-3 shadow-sm d-flex align-items-center h-100 border-start border-4"
                                        style={{ borderColor: verdeIFRS }}
                                    >
                                        <div
                                            className="p-2 rounded bg-light me-3"
                                            style={{ color: verdeIFRS }}
                                        >
                                            {getIconArea(
                                                area.nome ||
                                                    area.area_conhecimento ||
                                                    'Área',
                                            )}
                                        </div>
                                        <h6
                                            className="fw-bold mb-0"
                                            style={{
                                                fontSize: '0.95rem',
                                                color: '#2d3748',
                                            }}
                                        >
                                            {/* Exibe o nome da área. O '||' serve de fallback caso o nome não exista */}
                                            {area.nome ||
                                                area.area_conhecimento_display ||
                                                `Área ${area}`}
                                        </h6>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </div>

                {/* SOBRE O EVENTO - Centralizado e espaçado */}
                <section className="py-5 bg-white">
                    <Container>
                        <div className="text-center mb-4">
                            <h3
                                className="fw-bold text-uppercase"
                                style={{
                                    color: verdeIFRS,
                                    fontSize: '1.2rem',
                                    letterSpacing: '1px',
                                }}
                            >
                                Sobre o Evento
                            </h3>
                        </div>
                        <div
                            className="mx-auto"
                            style={{
                                maxWidth: '900px',
                                fontSize: '1.05rem',
                                color: '#4a5568',
                                lineHeight: '1.8',
                            }}
                        >
                            <p
                                className="text-center"
                                style={{ whiteSpace: 'pre-line' }}
                            >
                                {evento.descricao}
                            </p>
                        </div>
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
