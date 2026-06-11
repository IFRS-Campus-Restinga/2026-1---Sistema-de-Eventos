import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { MdSearch, MdCalendarToday, MdPlace, MdPeople, MdEvent, MdClose, MdInfoOutline } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';

// Hooks e Utilitários do ecossistema do seu app
import useSessoes from '../hooks/useSessoes';
import { obterCorPorTag } from '../utils/themeTags';

export default function ProgramacaoEvento() {
    const { id: eventoId } = useParams();
    const verdeIFRS = "#00A44B";
    
    // Estados de controle local
    const [termoBusca, setTermoBusca] = useState('');
    const [turnoAtivo, setTurnoAtivo] = useState('manhã');
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [sessoesFiltradas, setSessoesFiltradas] = useState([]);
    
    // ✅ Estado para controlar qual trabalho está selecionado no painel lateral
    const [trabalhoSelecionado, setTrabalhoSelecionado] = useState(null);

    // Consumindo a estrutura completa de sessões do seu banco de dados via hook
    const { sessoes, dias, loading, error, carregarEvento, fetchSessoes } = useSessoes();

    useEffect(() => {
        if (eventoId) {
            carregarEvento(eventoId);
            fetchSessoes(eventoId);
        }
    }, [eventoId]);

    // Define automaticamente a primeira data do evento como ativa ao carregar
    useEffect(() => {
        if (dias && dias.length > 0) {
            setDataSelecionada(formatarDataValue(dias[0]));
        }
    }, [dias]);

    // Funções auxiliares para formatação das datas
    function formatarDataValue(data) {
        return data.toISOString().split('T')[0];
    }

    function formatarDataLabel(data) {
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        });
    }

    // Processamento, Filtragem e Agrupamento dos dados reais vindos da API
    useEffect(() => {
        if (!sessoes || sessoes.length === 0) {
            setSessoesFiltradas([]);
            return;
        }

        const termo = termoBusca.toLowerCase().trim();
        const mapaAgrupamento = {};

        sessoes.forEach(sessaoBanco => {
            // Filtro por data
            const dataSessao = sessaoBanco.data_horario_inicio.split('T')[0];
            if (dataSelecionada && dataSessao !== dataSelecionada) return;

            // Extração de horários (Padrão ISO)
            const stringHorarioInicio = sessaoBanco.data_horario_inicio.split('T')[1] || '';
            const stringHorarioFim = sessaoBanco.data_horario_fim.split('T')[1] || '';
            
            const horaInicioLimpa = stringHorarioInicio.slice(0, 5);
            const horaFimLimpa = stringHorarioFim.slice(0, 5);
            const chaveBlocoHorario = `${horaInicioLimpa} - ${horaFimLimpa}`;

            // Determina o turno dinamicamente baseado na hora de início
            let turnoCalculado = 'manhã';
            const horaInteira = parseInt(horaInicioLimpa.split(':')[0], 10);
            if (horaInteira >= 12 && horaInteira < 18) {
                turnoCalculado = 'tarde';
            } else if (horaInteira >= 18) {
                turnoCalculado = 'noite';
            }

            if (turnoCalculado !== turnoAtivo) return;

            // Mapeamento das apresentações alocadas nesta sessão
            const apresentacoesOriginais = sessaoBanco.ordem_apresentacoes_display || [];
            
            const atividadesFiltradas = apresentacoesOriginais
                .map(itemOrdem => {
                    const atracao = itemOrdem.atracao_display || itemOrdem.atracao || {};
                    
                    let listaAutores = [];
                    if (atracao.equipe_json) {
                        try {
                            const equipe = typeof atracao.equipe_json === 'string' 
                                ? JSON.parse(atracao.equipe_json) 
                                : atracao.equipe_json;
                            listaAutores = equipe.map(m => m.nome || m.autor);
                        } catch (e) {
                            listaAutores = [atracao.autor || 'Autor Não Informado'];
                        }
                    } else if (atracao.autor) {
                        listaAutores = [atracao.autor];
                    }

                    const listaTags = [];
                    if (atracao.tipo) listaTags.push({ texto: atracao.tipo });
                    if (atracao.area_conhecimento?.area_conhecimento_display) {
                        listaTags.push({ texto: atracao.area_conhecimento.area_conhecimento_display });
                    } else if (atracao.area_conhecimento) {
                        listaTags.push({ texto: String(atracao.area_conhecimento) });
                    }

                    return {
                        hora: horaInicioLimpa,
                        titulo: atracao.titulo || 'Atração Sem Título',
                        descricao: atracao.resumo || 'Nenhum resumo disponível para esta atração.',
                        palavrasChave: atracao.palavras_chave || '',
                        nivelEnsino: atracao.nivel_ensino_display || atracao.nivel_ensino || '',
                        autores: listaAutores,
                        local: sessaoBanco.espaco_display?.nome || `Espaço #${sessaoBanco.espaco}`,
                        tags: listaTags.map(t => ({
                            texto: t.texto,
                            corFundo: obterCorPorTag(t.texto),
                            corTexto: '#FFFFFF'
                        })),
                        inscrito: false
                    };
                })
                .filter(ativ => {
                    const titulo = ativ.titulo.toLowerCase();
                    const autor = ativ.autores.join(' ').toLowerCase();
                    const bateuNaTag = ativ.tags.some(tag => tag.texto.toLowerCase().includes(termo));

                    return !termo || titulo.includes(termo) || autor.includes(termo) || bateuNaTag;
                });

            // Agrupamento por bloco de horário único
            if (atividadesFiltradas.length > 0) {
                if (!mapaAgrupamento[chaveBlocoHorario]) {
                    mapaAgrupamento[chaveBlocoHorario] = [];
                }
                mapaAgrupamento[chaveBlocoHorario].push(...atividadesFiltradas);
            }
        });

        const resultadoFinal = Object.keys(mapaAgrupamento).map(bloco => ({
            blocoHorario: bloco,
            atividades: mapaAgrupamento[bloco]
        })).sort((a, b) => a.blocoHorario.localeCompare(b.blocoHorario));

        setSessoesFiltradas(resultadoFinal);
    }, [sessoes, dataSelecionada, termoBusca, turnoAtivo]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />
            <main className="flex-fill">
                {/* Hero / Buscador Superior */}
                <section style={{ backgroundColor: verdeIFRS, color: 'white' }} className="py-5 text-center shadow-sm">
                    <Container>
                        <h1 className="display-5 fw-bold mb-2">Programação Oficial</h1>
                        <p className="mb-4 opacity-90">Explore as atividades e confira os detalhes em tempo real</p>
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

                <Container fluid="xl" className="py-4">
                    {/* Controles de Data */}
                    {dias && dias.length > 0 && (
                        <Row className="justify-content-center mb-4">
                            <Col xs={12} md={4} className="d-flex align-items-center gap-2">
                                <MdEvent size={24} className="text-secondary" />
                                <Form.Group className="w-100 m-0">
                                    <Form.Select
                                        value={dataSelecionada}
                                        onChange={(e) => setDataSelecionada(e.target.value)}
                                        className="fw-semibold border-secondary-subtle"
                                    >
                                        {dias.map((dia, index) => (
                                            <option key={index} value={formatarDataValue(dia)}>
                                                Dia do Evento: {formatarDataLabel(dia)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    {/* Filtros de Turnos */}
                    <div className="d-flex justify-content-center gap-3 mb-5">
                        {['manhã', 'tarde', 'noite'].map((turno) => (
                            <Button 
                                key={turno}
                                variant={turnoAtivo === turno ? 'dark' : 'outline-secondary'}
                                className="rounded-pill px-4 fw-bold text-uppercase"
                                onClick={() => setTurnoAtivo(turno)}
                                style={turnoAtivo === turno ? { backgroundColor: `${verdeIFRS}`, borderColor: '#111827' } : {}}
                            >
                                {turno}
                            </Button>
                        ))}
                    </div>

                    {/* ✅ GRID HÍBRIDO SPLIT-SCREEN (Unificação das duas Telas) */}
                    <Row className="g-4">
                        {/* COLUNHA DA PROGRAMAÇÃO: Encolhe dinamicamente para lg={7} se houver item aberto */}
                        <Col lg={trabalhoSelecionado ? 7 : 12} xs={12} style={{ transition: 'all 0.3s ease' }}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="text-muted mt-2 small">Sincronizando cronograma...</p>
                                </div>
                            ) : error ? (
                                <Alert variant="danger">Erro ao carregar a programação: {error}</Alert>
                            ) : sessoesFiltradas.length > 0 ? (
                                sessoesFiltradas.map((sessaoGlobal, idx) => (
                                    <div key={idx} className="card shadow-sm border-0 mb-4 overflow-hidden" style={{ borderRadius: '12px' }}>
                                        <div className="card-header bg-white text-dark py-3 px-4 d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2 m-0 fw-bold">
                                                <MdCalendarToday size={18} color={verdeIFRS} />
                                                <span>Sessão: {sessaoGlobal.blocoHorario}</span>
                                            </div>
                                            <span className="badge bg-secondary text-uppercase rounded-pill">
                                                {sessaoGlobal.atividades.length} {sessaoGlobal.atividades.length === 1 ? 'Trabalho' : 'Trabalhos'}
                                            </span>
                                        </div>
                                        
                                        <div className="card-body p-0">
                                            {sessaoGlobal.atividades.map((ativ, ativIdx) => {
                                                const estaAtivo = trabalhoSelecionado?.titulo === ativ.titulo;
                                                return (
                                                    <div 
                                                        key={ativIdx} 
                                                        className="p-3 border-bottom last-border-0 d-flex flex-md-row flex-column justify-content-between align-items-md-center gap-2"
                                                        style={{ 
                                                            borderLeft: `6px solid ${obterCorPorTag(ativ.tags[0]?.texto || '')}`,
                                                            backgroundColor: estaAtivo ? '#F0FDF4' : '#FFFFFF',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                    >
                                                        <div className="flex-grow-1" style={{ maxWidth: '80%' }}>
                                                            <div className="d-flex flex-wrap gap-1 mb-1">
                                                                <span className="badge bg-light text-dark border rounded-pill small">Horário: {ativ.hora}</span>
                                                                {ativ.tags.map((t, tIdx) => (
                                                                    <span key={tIdx} className="badge rounded-pill small" style={{ backgroundColor: t.corFundo, color: t.corTexto }}>
                                                                        {t.texto}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <h5 className="fw-bold text-dark text-truncate mb-1" style={{ fontSize: '1rem' }}>{ativ.titulo}</h5>
                                                            <div className="d-flex flex-wrap gap-2 text-muted small">
                                                                <span className="text-truncate" style={{ maxWidth: '250px' }}><MdPeople /> {ativ.autores.join(', ')}</span>
                                                                <span><MdPlace /> {ativ.local}</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2 align-items-center justify-content-md-end">
                                                            <Button 
                                                                variant={estaAtivo ? "dark" : "outline-dark"} 
                                                                size="sm" 
                                                                className="rounded-pill text-nowrap px-3" 
                                                                onClick={() => setTrabalhoSelecionado(ativ)}
                                                            >
                                                                Ver Detalhes
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5 bg-white rounded shadow-sm border">
                                    <h5 className="text-muted m-0">Nenhuma atividade programada para esta data.</h5>
                                </div>
                            )}
                        </Col>

                        {/* ✅ PAINEL LATERAL: TELA DE DETALHES COMPLETA INTEGRADA DINAMICAMENTE (Apenas renderiza se houver item selecionado) */}
                        {trabalhoSelecionado && (
                            <Col lg={5} xs={12} className="position-sticky" style={{ top: '20px', height: 'fit-content' }}>
                                <div className="card shadow-sm border-0 border-top border-4 overflow-hidden" style={{ borderRadius: '12px', borderColor: verdeIFRS }}>
                                    <div className="card-header bg-white d-flex justify-content-between align-items-center border-0 pt-3 px-4">
                                        <span className="text-uppercase fw-bold text-muted small d-flex align-items-center gap-1">
                                            <MdInfoOutline size={16} /> Ficha Técnica do Trabalho
                                        </span>
                                        <Button 
                                            variant="light" 
                                            className="rounded-circle p-1 d-flex align-items-center justify-content-center" 
                                            onClick={() => setTrabalhoSelecionado(null)}
                                        >
                                            <MdClose size={20} />
                                        </Button>
                                    </div>
                                    
                                    <div className="card-body px-4 pb-4">
                                        <h3 className="h4 fw-bold text-dark mb-3">{trabalhoSelecionado.titulo}</h3>
                                        
                                        <div className="d-flex flex-wrap gap-1 mb-4">
                                            {trabalhoSelecionado.tags.map((t, idx) => (
                                                <span key={idx} className="badge rounded-pill px-3 py-1" style={{ backgroundColor: t.corFundo, color: t.corTexto }}>
                                                    {t.texto}
                                                </span>
                                            ))}
                                            {trabalhoSelecionado.nivelEnsino && (
                                                <span className="badge bg-secondary rounded-pill px-3 py-1">{trabalhoSelecionado.nivelEnsino}</span>
                                            )}
                                        </div>

                                        <div className="mb-3 bg-light p-3 rounded" style={{ borderRadius: '8px' }}>
                                            <div className="mb-2">
                                                <strong className="text-secondary small d-block">AUTORES / APRESENTADORES</strong>
                                                <span className="text-dark fw-medium">{trabalhoSelecionado.autores.join(', ')}</span>
                                            </div>
                                            <div className="row g-2 mt-1 border-top pt-2">
                                                <div className="col-6">
                                                    <strong className="text-secondary small d-block">HORÁRIO DE INÍCIO</strong>
                                                    <span className="text-dark fw-medium">{trabalhoSelecionado.hora}</span>
                                                </div>
                                                <div className="col-6">
                                                    <strong className="text-secondary small d-block">ESPAÇO / SALA</strong>
                                                    <span className="text-dark fw-medium text-truncate d-block">{trabalhoSelecionado.local}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <strong className="text-secondary small d-block mb-1">RESUMO EXPANDIDO</strong>
                                            <p className="text-dark lh-base style-resumo m-0" style={{ fontSize: '0.95rem', textAlign: 'justify', maxHeight: '30vh', overflowY: 'auto' }}>
                                                {trabalhoSelecionado.descricao}
                                            </p>
                                        </div>

                                        {trabalhoSelecionado.palavrasChave && (
                                            <div className="mb-4">
                                                <strong className="text-secondary small d-block mb-1">PALAVRAS-CHAVE</strong>
                                                <span className="text-muted italic">{trabalhoSelecionado.palavrasChave}</span>
                                            </div>
                                        )}

                                        <Button 
                                            variant={trabalhoSelecionado.inscrito ? "success" : "primary"} 
                                            className="w-100 py-2 fw-bold rounded-pill shadow-sm"
                                            disabled={trabalhoSelecionado.inscrito}
                                            style={!trabalhoSelecionado.inscrito ? { backgroundColor: verdeIFRS, borderColor: verdeIFRS } : {}}
                                        >
                                            {trabalhoSelecionado.inscrito ? "Inscrição Confirmada" : "Me Inscrever na Atração"}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>
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