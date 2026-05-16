import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Pagination } from 'react-bootstrap';
import { MdSearch, MdCalendarToday } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import AtracaoCard from '../components/common/AtracaoCard';

export default function ProgramacaoEvento() {
    const { id } = useParams();
    const verdeIFRS = "#00A44B";
    const [termoBusca, setTermoBusca] = useState('');
    const [turnoAtivo, setTurnoAtivo] = useState('manha');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 3;

    const obterCorPorTag = (texto) => {
        const t = texto.toLowerCase();
        if (t.includes('oficina')) return '#EAB308';
        if (t.includes('engenharia')) return '#EF4444';
        if (t.includes('apresentação')) return '#3B82F6';
        if (t.includes('exatas')) return '#212529';
        if (t.includes('performance')) return '#DB2777';
        if (t.includes('artes') || t.includes('letras')) return '#8B5CF6';
        if (t.includes('informatica')) return '#06B6D4';
        if (t.includes('tecnologia')) return '#111827';
        return '#6B7280';
    };

    const sessoesMockadas = [
        {
            blocoHorario: "08:30 - 10:00",
            atividades: [
                {
                    hora: "08:30",
                    sessao: "Sessão 1",
                    turno: "manha",
                    corCard: "#3B82F6",
                    titulo: "Desenvolvimento de Concreto Sustentável com Resíduos",
                    tags: [{ texto: "Apresentação Oral" }, { texto: "Engenharias" }],
                    autores: ["Carlos Lima", "Ana Souza"],
                    local: "Sala 304 - Bloco 3",
                    inscrito: true
                },
                {
                    hora: "09:00",
                    sessao: "Sessão 2",
                    turno: "manha",
                    corCard: "#EAB308",
                    titulo: "Introdução ao Arduino: Construindo seu primeiro robô",
                    tags: [{ texto: "Oficina" }, { texto: "Ciências Exatas" }],
                    autores: ["Jaqueline Costa"],
                    local: "Sala 302 - Bloco 3",
                    inscrito: false
                },
                {
                    hora: "09:30",
                    sessao: "Sessão 3",
                    turno: "manha",
                    corCard: "#06B6D4",
                    titulo: "Segurança de Dados em Redes Locais",
                    tags: [{ texto: "Apresentação Oral" }, { texto: "Informatica" }],
                    autores: ["Roberto Silveira"],
                    local: "Sala 101 - Bloco 1",
                    inscrito: false
                }
            ]
        },
        {
            blocoHorario: "10:30 - 12:00",
            atividades: [
                {
                    hora: "10:30",
                    sessao: "Sessão 1",
                    turno: "manha",
                    corCard: "#DB2777",
                    titulo: "Intervenção Teatral: O Homem e a Ciência",
                    tags: [{ texto: "Performance Artística" }, { texto: "Letras e Artes" }],
                    autores: ["Jose Silva", "Ana Terra"],
                    local: "Auditório Mirele",
                    inscrito: false
                },
                {
                    hora: "11:15",
                    sessao: "Sessão 2",
                    turno: "manha",
                    corCard: "#111827",
                    titulo: "Aplicações de IA na Agricultura Familiar",
                    tags: [{ texto: "Tecnologia" }, { texto: "Engenharias" }],
                    autores: ["Marcos Nunes", "Lucas Rocha"],
                    local: "Laboratório 2 - Bloco 1",
                    inscrito: false
                }
            ]
        },
        {
            blocoHorario: "14:00 - 15:30",
            atividades: [
                {
                    hora: "14:00",
                    sessao: "Sessão 1",
                    turno: "tarde",
                    corCard: "#EAB308",
                    titulo: "Oficina Avançada de Django Rest Framework",
                    tags: [{ texto: "Oficina" }, { texto: "Tecnologia" }],
                    autores: ["Pedro Henrique", "Maria Eduarda"],
                    local: "Mini Auditório - Bloco 4",
                    inscrito: true
                },
                {
                    hora: "14:45",
                    sessao: "Sessão 2",
                    turno: "tarde",
                    corCard: "#8B5CF6",
                    titulo: "Mini-curso de Criação de Interfaces com Figma",
                    tags: [{ texto: "Oficina" }, { texto: "Letras e Artes" }],
                    autores: ["Maria Eduarda"],
                    local: "Sala 202 - Bloco 2",
                    inscrito: false
                }
            ]
        },
        {
            blocoHorario: "19:00 - 20:30",
            atividades: [
                {
                    hora: "19:00",
                    sessao: "Sessão 1",
                    turno: "noite",
                    corCard: "#212529",
                    titulo: "Mesa Redonda: O Futuro da Computação e do ADS na Região",
                    tags: [{ texto: "Apresentação Oral" }, { texto: "Tecnologia" }],
                    autores: ["Professor IFRS", "Convidado MPRS"],
                    local: "Auditório Principal",
                    inscrito: false
                }
            ]
        }
    ];

    const [sessoesFiltradas, setSessoesFiltradas] = useState([]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [termoBusca, turnoAtivo]);

    useEffect(() => {
        const termo = termoBusca.toLowerCase().trim();
        let listaTotal = [];

        sessoesMockadas.forEach(bloco => {
            bloco.atividades.forEach(ativ => {
                const bateuTurno = ativ.turno === turnoAtivo;

                const titulo = ativ.titulo ? ativ.titulo.toLowerCase() : '';
                const autor = ativ.autores ? ativ.autores.join(' ').toLowerCase() : '';
                const bateuNaTag = ativ.tags ? ativ.tags.some(tag => 
                    tag.texto ? tag.texto.toLowerCase().includes(termo) : false
                ) : false;

                const bateuBusca = !termo || titulo.includes(termo) || autor.includes(termo) || bateuNaTag;

                if (bateuTurno && bateuBusca) {
                    listaTotal.push({
                        blocoHorario: bloco.blocoHorario,
                        ...ativ,
                        tags: ativ.tags.map(t => ({
                            texto: t.texto,
                            corFundo: obterCorPorTag(t.texto),
                            corTexto: '#FFFFFF'
                        }))
                    });
                }
            });
        });

        const indiceUltimoItem = paginaAtual * itensPorPagina;
        const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
        const itensPaginados = listaTotal.slice(indicePrimeiroItem, indiceUltimoItem);

        const agrupado = [];
        itensPaginados.forEach(item => {
            let bloco = agrupado.find(b => b.blocoHorario === item.blocoHorario);
            if (!bloco) {
                bloco = { blocoHorario: item.blocoHorario, atividades: [] };
                agrupado.push(bloco);
            }
            const { blocoHorario, ...dados } = item;
            bloco.atividades.push(dados);
        });

        setSessoesFiltradas(agrupado);
    }, [termoBusca, turnoAtivo, paginaAtual]);

    const totalItens = () => {
        const termo = termoBusca.toLowerCase().trim();
        let count = 0;
        sessoesMockadas.forEach(b => {
            b.atividades.forEach(a => {
                const bateuTurno = a.turno === turnoAtivo;
                const titulo = a.titulo.toLowerCase();
                const autor = a.autores.join(' ').toLowerCase();
                const tag = a.tags.some(t => t.texto.toLowerCase().includes(termo));
                const bateuBusca = !termo || titulo.includes(termo) || autor.includes(termo) || tag;
                
                if (bateuTurno && bateuBusca) count++;
            });
        });
        return count;
    };

    const numeroPaginas = Math.ceil(totalItens() / itensPorPagina);

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />
            <main className="flex-fill">
                <section style={{ backgroundColor: verdeIFRS, color: 'white' }} className="py-5 text-center shadow-sm">
                    <Container>
                        <h1 className="display-5 fw-bold mb-2">Programação Oficial</h1>
                        <p className="mb-4 opacity-90">Confira os horários e locais das apresentações do evento #{id}</p>
                        <Row className="justify-content-center">
                            <Col md={8} lg={6}>
                                <InputGroup className="shadow-sm rounded-pill overflow-hidden bg-white p-1">
                                    <Form.Control
                                        placeholder="Pesquise por título, autor ou tag..."
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

                <Container className="py-4 mt-2">
                    <div className="d-flex justify-content-center gap-3 mb-5">
                        {['manha', 'tarde', 'noite'].map((turno) => (
                            <Button 
                                key={turno}
                                variant={turnoAtivo === turno ? 'dark' : 'outline-secondary'}
                                className="rounded-pill px-4 fw-bold text-uppercase"
                                onClick={() => setTurnoAtivo(turno)}
                                style={turnoAtivo === turno ? { backgroundColor: `${verdeIFRS}`, borderColor: '#111827' } : {}}
                            >
                                25/OUT ({turno})
                            </Button>
                        ))}
                    </div>

                    <Row className="justify-content-center">
                        <Col lg={10}>
                            {sessoesFiltradas.length > 0 ? (
                                sessoesFiltradas.map((bloco, idx) => (
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
                                                    {...ativ}
                                                    onInscrever={() => console.log(ativ.titulo)}
                                                    onVerResumo={() => console.log(ativ.titulo)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <h5 className="text-muted">Nenhuma atividade encontrada neste turno para "{termoBusca}".</h5>
                                </div>
                            )}
                        </Col>
                    </Row>

                    {numeroPaginas > 1 && (
                        <div className="d-flex justify-content-center mt-5 mb-4">
                            <Pagination className="custom-pagination">
                                <Pagination.Prev 
                                    onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                                    disabled={paginaAtual === 1}
                                />
                                {[...Array(numeroPaginas)].map((_, i) => (
                                    <Pagination.Item 
                                        key={i + 1} 
                                        active={i + 1 === paginaAtual}
                                        onClick={() => setPaginaAtual(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    onClick={() => setPaginaAtual(prev => Math.min(prev + 1, numeroPaginas))}
                                    disabled={paginaAtual === numeroPaginas}
                                />
                            </Pagination>
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
        </div>
    );
}