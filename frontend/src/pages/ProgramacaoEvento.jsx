import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { MdSearch, MdCalendarToday, MdPlace, MdPeople } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import ModalPopup from '../components/common/ModalPopup';

export default function ProgramacaoEvento() {
    const { id } = useParams();
    const verdeIFRS = "#00A44B";
    const [termoBusca, setTermoBusca] = useState('');
    const [turnoAtivo, setTurnoAtivo] = useState('manhã');
    const [showModal, setShowModal] = useState(false);
    const [atracaoResumo, setAtracaoResumo] = useState(null);

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
            turno: "manhã",
            atividades: [
                {
                    hora: "08:30",
                    corCard: "#3B82F6",
                    titulo: "Desenvolvimento de Concreto Sustentável com Resíduos",
                    descricao: "Este trabalho apresenta o estudo de misturas de concreto utilizando resíduos de demolição civil como agregados substitutos, visando a redução do impacto ambiental na construção civil.",
                    tags: [{ texto: "Apresentação Oral" }, { texto: "Engenharias" }],
                    autores: ["Carlos Lima", "Ana Souza"],
                    local: "Sala 304 - Bloco 3",
                    inscrito: true
                },
                {
                    hora: "09:00",
                    corCard: "#EAB308",
                    titulo: "Introdução ao Arduino: Construindo seu primeiro robô",
                    descricao: "Oficina prática voltada para iniciantes. Serão abordados os conceitos fundamentais de eletrônica digital, portas lógicas e programação aplicada à robótica educacional.",
                    tags: [{ texto: "Oficina" }, { texto: "Ciências Exatas" }],
                    autores: ["Jaqueline Costa"],
                    local: "Sala 302 - Bloco 3",
                    inscrito: false
                },
                {
                    hora: "09:30",
                    corCard: "#06B6D4",
                    titulo: "Segurança de Dados em Redes Locais",
                    descricao: "Discussão técnica sobre as principais vulnerabilidades em infraestruturas de redes locais e roteamento, abordando táticas preventivas e ferramentas de monitoramento de tráfego com Wireshark.",
                    tags: [{ texto: "Apresentação Oral" }, { texto: "Informatica" }],
                    autores: ["Roberto Silveira"],
                    local: "Sala 101 - Bloco 1",
                    inscrito: false
                }
            ]
        },
        {
            blocoHorario: "10:30 - 12:00",
            turno: "manhã",
            atividades: [
                {
                    hora: "10:30",
                    corCard: "#DB2777",
                    titulo: "Intervenção Teatral: O Homem e a Ciência",
                    descricao: "Performance artística que reflete sobre o papel do cientista na sociedade moderna, os limites éticos do avanço computacional e a desmistificação da tecnologia na periferia.",
                    tags: [{ texto: "Performance Artística" }, { texto: "Letras e Artes" }],
                    autores: ["Jose Silva", "Ana Terra"],
                    local: "Auditório Mirele",
                    inscrito: false
                },
                {
                    hora: "11:15",
                    corCard: "#111827",
                    titulo: "Aplicações de IA na Agricultura Familiar",
                    descricao: "Apresentação de projeto que utiliza visão computacional simples para identificação de pragas comuns em hortaliças, otimizando o manejo agrícola sem o uso de defensivos pesados.",
                    tags: [{ texto: "Tecnologia" }, { texto: "Engenharias" }],
                    autores: ["Marcos Nunes", "Lucas Rocha"],
                    local: "Laboratório 2 - Bloco 1",
                    inscrito: false
                }
            ]
        },
        {
            blocoHorario: "14:00 - 15:30",
            turno: "tarde",
            atividades: [
                {
                    hora: "14:00",
                    corCard: "#EAB308",
                    titulo: "Oficina Avançada de Django Rest Framework",
                    descricao: "Construção passo a passo de uma API REST robusta, abordando autenticação baseada em JWT, customização de querysets com managers e boas práticas de arquitetura de software.",
                    tags: [{ texto: "Oficina" }, { texto: "Tecnologia" }],
                    autores: ["Pedro Henrique", "Maria Eduarda"],
                    local: "Mini Auditório - Bloco 4",
                    inscrito: true
                },
                {
                    hora: "14:45",
                    corCard: "#8B5CF6",
                    titulo: "Mini-curso de Criação de Interfaces com Figma",
                    descricao: "Abordagem prática de UI/UX design. Os participantes aprenderão a criar componentes dinâmicos, auto-layout responsivo e protótipos navegáveis prontos para validação de produto.",
                    tags: [{ texto: "Oficina" }, { texto: "Letras e Artes" }],
                    autores: ["Maria Eduarda"],
                    local: "Sala 202 - Bloco 2",
                    inscrito: false
                }
            ]
        },
        {
            blocoHorario: "19:00 - 20:30",
            turno: "noite",
            atividades: [
                {
                    hora: "19:00",
                    corCard: "#212529",
                    titulo: "Mesa Redonda: O Futuro da Computação e do ADS na Região",
                    descricao: "Profissionais do mercado e do setor público debatem as demandas atuais de TI, o mercado para desenvolvedores juniores e os rumos das tecnologias web e mobile na Zona Sul.",
                    tags: [{ texto: "Apresentação Oral" }, { texto: "Tecnologia" }],
                    autores: ["Professor IFRS", "Convidado MPRS"],
                    local: "Auditório Principal",
                    inscrito: false
                }
            ]
        }
    ];

    const [sessoesFiltradas, setSessoesFiltradas] = useState([]);

    const selecionarAtracaoResumo = (atracao) => {
        setAtracaoResumo(atracao);
        setShowModal(true);
    };

    useEffect(() => {
        const termo = termoBusca.toLowerCase().trim();
        let blocosProcessados = [];

        sessoesMockadas.forEach(bloco => {
            if (bloco.turno === turnoAtivo) {
                const atividadesFiltradas = bloco.atividades.filter(ativ => {
                    const titulo = ativ.titulo ? ativ.titulo.toLowerCase() : '';
                    const autor = ativ.autores ? ativ.autores.join(' ').toLowerCase() : '';
                    const bateuNaTag = ativ.tags ? ativ.tags.some(tag => 
                        tag.texto ? tag.texto.toLowerCase().includes(termo) : false
                    ) : false;

                    return !termo || titulo.includes(termo) || autor.includes(termo) || bateuNaTag;
                });

                if (atividadesFiltradas.length > 0) {
                    blocosProcessados.push({
                        blocoHorario: bloco.blocoHorario,
                        atividades: atividadesFiltradas.map(ativ => ({
                            ...ativ,
                            tags: ativ.tags.map(t => ({
                                texto: t.texto,
                                corFundo: obterCorPorTag(t.texto),
                                corTexto: '#FFFFFF'
                            }))
                        }))
                    });
                }
            }
        });

        setSessoesFiltradas(blocosProcessados);
    }, [termoBusca, turnoAtivo]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />
            <main className="flex-fill">
                <section style={{ backgroundColor: verdeIFRS, color: 'white' }} className="py-5 text-center shadow-sm">
                    <Container>
                        <h1 className="display-5 fw-bold mb-2">Programação Oficial</h1>
                        <p className="mb-4 opacity-90">Confira os horários e locais das atividades do evento</p>
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
                        {['manhã', 'tarde', 'noite'].map((turno) => (
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
                                sessoesFiltradas.map((sessaoGlobal, idx) => (
                                    <div key={idx} className="card shadow-sm border-0 mb-4 overflow-hidden" style={{ borderRadius: '16px' }}>
                                        {/* Cabeçalho unificado do bloco de horário (Sessão Única) */}
                                        <div className="card-header bg-white text-dark py-3 px-4 d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2 m-0 fw-bold">
                                                <MdCalendarToday size={20} color={verdeIFRS} />
                                                <span className="fs-5">Sessão: {sessaoGlobal.blocoHorario}</span>
                                            </div>
                                            <span className="badge bg-secondary text-uppercase px-3 py-2 rounded-pill">
                                                {sessaoGlobal.atividades.length} {sessaoGlobal.atividades.length === 1 ? 'Trabalho' : 'Trabalhos'}
                                            </span>
                                        </div>
                                        
                                        {/* Lista corrida e sem paginação de todas as apresentações do período */}
                                        <div className="card-body p-0">
                                            {sessaoGlobal.atividades.map((ativ, ativIdx) => (
                                                <div 
                                                    key={ativIdx} 
                                                    className="p-4 border-bottom last-border-0 d-flex flex-md-row flex-column justify-content-between align-items-md-center gap-3 bg-white"
                                                    style={{ borderLeft: `6px solid ${ativ.corCard || '#6B7280'}` }}
                                                >
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                                            <span className="badge bg-light text-dark border rounded-pill">Horário: {ativ.hora}</span>
                                                            {ativ.tags.map((t, tIdx) => (
                                                                <span key={tIdx} className="badge rounded-pill" style={{ backgroundColor: t.corFundo, color: t.corTexto }}>
                                                                    {t.texto}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <h4 className="h5 fw-bold text-dark mb-2">{ativ.titulo}</h4>
                                                        <div className="d-flex flex-wrap gap-3 text-muted small">
                                                            <span className="d-flex align-items-center gap-1"><MdPeople size={16} /> {ativ.autores.join(', ')}</span>
                                                            <span className="d-flex align-items-center gap-1"><MdPlace size={16} /> {ativ.local}</span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2 align-items-center justify-content-md-end">
                                                        <Button variant="outline-dark" size="sm" className="rounded-pill px-3" onClick={() => selecionarAtracaoResumo(ativ)}>
                                                            Ver Resumo
                                                        </Button>
                                                        <Button variant={ativ.inscrito ? "success" : "primary"} size="sm" className="rounded-pill px-3" disabled={ativ.inscrito}>
                                                            {ativ.inscrito ? "Inscrito" : "Inscrever-se"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5 bg-white rounded shadow-sm">
                                    <h5 className="text-muted m-0">Nenhuma atividade programada para este turno.</h5>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>

                {atracaoResumo && (
                    <ModalPopup
                        show={showModal}
                        titulo={atracaoResumo.titulo}
                        tituloSecundario={`Autores: ${atracaoResumo.autores.join(', ')}`}
                        texto={atracaoResumo.descricao}
                        textoFechar="Voltar"
                        onFechar={() => setShowModal(false)}
                    />
                )}
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