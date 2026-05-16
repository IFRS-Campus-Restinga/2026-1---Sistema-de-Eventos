import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Pagination, Spinner } from 'react-bootstrap';
import { MdSearch, MdCalendarToday } from 'react-icons/md';
import { useParams } from 'react-router-dom'; // ✅ Importando useParams
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import AtracaoCard from '../components/common/AtracaoCard';
import { useNavigate } from 'react-router-dom';

// import { buscarProgramacaoPorEventoId } from '../services/programacaoService'; // Exemplo de serviço futuro

export default function ProgramacaoEvento() {
    const { id } = useParams(); // ✅ Capturando o id do evento pela URL
    const verdeIFRS = "#00A44B";
    const [termoBusca, setTermoBusca] = useState('');
    const [turnoAtivo, setTurnoAtivo] = useState('manha');
    const [loading, setLoading] = useState(false);
    const [programacao, setProgramacao] = useState([]); // ✅ Estado para os dados reais futuros

    // Simulando que buscamos do banco com base no ID recebido
    useEffect(() => {
        async function carregarProgramacao() {
            try {
                setLoading(true);
                console.log(`Buscando no Django a programação do evento ID: ${id}`);
                // const dados = await buscarProgramacaoPorEventoId(id);
                // setProgramacao(dados);
            } catch (error) {
                console.error("Erro ao carregar programação:", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) carregarProgramacao();
    }, [id]);

    // Mantendo os dados mockados estruturados por enquanto (estruturados com o ID do evento contextual)
    const sessoesMockadas = [
        {
            blocoHorario: "08:30 - 10:00",
            atividades: [
                {
                    hora: "08:30",
                    sessao: "Sessão 1",
                    corCard: "#3b82f6",
                    titulo: `Desenvolvimento Sustentável - Evento #${id}`,
                    tags: [
                        { texto: "Apresentação Oral", corFundo: "#3b82f6" },
                        { texto: "Engenharias", corFundo: "#06b6d4" }
                    ],
                    autores: ["Carlos Lima", "Ana Souza"],
                    local: "Sala 304 - Bloco 3",
                    inscrito: true
                },
                {
                    hora: "09:00",
                    sessao: "Sessão 2",
                    corCard: "#eab308",
                    titulo: "Introdução ao Arduino",
                    tags: [
                        { texto: "Oficina", corFundo: "#eab308" },
                        { texto: "Ciências Exatas", corFundo: "#212529" }
                    ],
                    autores: ["Jaqueline Costa"],
                    local: "Sala 302 - Bloco 3",
                    inscrito: false
                }
            ]
        }
    ];

    const handleInscrever = (titulo) => console.log(`Inscrito em: ${titulo}`);
    const handleVerResumo = (titulo) => console.log(`Resumo de: ${titulo}`);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <Spinner animation="border" variant="success" />
        </div>
    );

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />

            <main className="flex-fill">
                {/* HERO SECTION COM BUSCA */}
                <section style={{ backgroundColor: verdeIFRS, color: 'white' }} className="py-5 text-center shadow-sm">
                    <Container>
                        <h1 className="display-5 fw-bold mb-2">Programação Oficial</h1>
                        <p className="mb-4 opacity-90">Confira os horários e locais das apresentações do evento</p>
                        
                        <Row className="justify-content-center">
                            <Col md={8} lg={6}>
                                <InputGroup className="shadow-sm rounded-pill overflow-hidden bg-white p-1">
                                    <Form.Control
                                        placeholder="Pesquise por título, autor ou área..."
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="border-0 px-3 py-2"
                                        style={{ outline: 'none', boxShadow: 'none' }}
                                    />
                                    <Button variant="dark" className="rounded-pill px-4 fw-bold d-flex align-items-center">
                                        <MdSearch className="me-2" size={18} /> Buscar
                                    </Button>
                                </InputGroup>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* FILTROS DE TURNO */}
                <Container className="py-4 mt-2">
                    <div className="d-flex justify-content-center gap-3 mb-5">
                        {['manha', 'tarde', 'noite'].map((turno) => (
                            <Button 
                                key={turno}
                                variant={turnoAtivo === turno ? 'dark' : 'outline-secondary'}
                                className="rounded-pill px-4 fw-bold text-uppercase"
                                onClick={() => setTurnoAtivo(turno)}
                                style={turnoAtivo === turno ? { backgroundColor: '#111827', borderColor: '#111827' } : {}}
                            >
                                25/OUT ({turno})
                            </Button>
                        ))}
                    </div>

                    {/* LISTA DA LINHA DO TEMPO */}
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            {sessoesMockadas.map((bloco, idx) => (
                                <div key={idx} className="mb-5">
                                    <div className="d-flex align-items-center text-muted fw-bold mb-4 small" style={{ letterSpacing: '1px' }}>
                                        <MdCalendarToday className="me-2" color={verdeIFRS} />
                                        <span>{bloco.blocoHorario}</span>
                                        <div className="flex-grow-1 border-bottom ms-3 opacity-25"></div>
                                    </div>

                                    <div className="d-flex flex-column gap-3">
                                        {bloco.atividades.map((ativ, ativIdx) => (
                                            <AtracaoCard 
                                                key={ativIdx} 
                                                corCard={ativ.corCard}
                                                hora={ativ.hora}
                                                sessao={ativ.sessao}
                                                titulo={ativ.titulo}
                                                tags={ativ.tags}
                                                autores={ativ.autores}
                                                local={ativ.local}
                                                inscrito={ativ.inscrito}
                                                onInscrever={() => handleInscrever(ativ.titulo)}
                                                onVerResumo={() => handleVerResumo(ativ.titulo)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Col>
                    </Row>

                    {/* PAGINAÇÃO */}
                    <div className="d-flex justify-content-center mt-5 mb-4">
                        <Pagination className="custom-pagination">
                            <Pagination.Prev>← Anterior</Pagination.Prev>
                            <Pagination.Item active>{1}</Pagination.Item>
                            <Pagination.Item>{2}</Pagination.Item>
                            <Pagination.Item>{3}</Pagination.Item>
                            <Pagination.Ellipsis />
                            <Pagination.Next>Próxima →</Pagination.Next>
                        </Pagination>
                    </div>
                </Container>
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