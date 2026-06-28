import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    InputGroup,
    Spinner,
    Alert,
} from 'react-bootstrap';
import {
    MdSearch,
    MdCalendarToday,
    MdPlace,
    MdPeople,
    MdClose,
    MdInfoOutline,
    MdChevronRight,
    MdAccessTime,
} from 'react-icons/md';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { setSelectedEventoId } from '../utils/selectedEvento';

// Importação dos seus hooks e services nativos idênticos ao Board
import { buscarEventoPorId } from '../services/eventoService';
import { pegarSessoes } from '../services/sessoesService';
import { getCurrentUser } from '../services/authService';
import { obterCorPorTag } from '../utils/themeTags';
import useSessoes from '../hooks/useSessoes'; 
// ✅ ADICIONADO: Importando a função de verificação que faltava no topo
import { podeAcessarSubmissao } from '../utils/submissaoAcesso'; 

export default function ProgramacaoEvento() {
    const { id: eventoId } = useParams();

    const prepararEventoSelecionado = () => {
        setSelectedEventoId(evento?.id || eventoId);
    };

    const verdeDestaque = '#008B47';

    // Inicialização nativa do seu hook de sessões
    const { dias, carregarEvento, fetchSessoes } = useSessoes();

    // Estados dos dados dinâmicos do banco
    const [evento, setEvento] = useState(null);
    const [sessoesRaw, setSessoesRaw] = useState([]);
    const [listaDiasSelect, setListaDiasSelect] = useState([]); 
    
    // Estados mapeados das etapas e áreas de conhecimento
    const [datasRealizacao, setDatasRealizacao] = useState({
        inicio: '',
        fim: '',
    });
    const [areasDoEvento, setAreasDoEvento] = useState([]);

    // Estados de controle de renderização e busca
    const [carregando, setCarregando] = useState(true);
    const [erroMensagem, setErroMensagem] = useState(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [submissaoHabilitada, setSubmissaoHabilitada] = useState(false);
    const [submissaoVerificada, setSubmissaoVerificada] = useState(false);
    const [turnoAtivo, setTurnoAtivo] = useState('manhã');
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [areaAtiva, setAreaAtiva] = useState(null); 
    const [sessoesFiltradas, setSessoesFiltradas] = useState([]);
    const [trabalhoSelecionado, setTrabalhoSelecionado] = useState(null);

    // Sincronização estrita de inicialização do Hook (IDÊNTICO AO BOARD)
    useEffect(() => {
        if (eventoId) {
            carregarEvento(eventoId);
            fetchSessoes(eventoId);
        }
    }, [eventoId]);

    // Carrega dados complementares do evento de forma assíncrona
    useEffect(() => {
        if (!eventoId) return;
        
        async function carregarDadosComplementares() {
            try {
                setCarregando(true);
                const dadosEvento = await buscarEventoPorId(eventoId);
                setEvento(dadosEvento);

                const listaSessoes = await pegarSessoes(eventoId);
                setSessoesRaw(listaSessoes || []);

                // ✅ CORREÇÃO: Busca o usuário logado usando a função nativa importada do authService
                const dadosUsuario = await getCurrentUser();
                setUsuario(dadosUsuario);

                // ✅ CORREÇÃO: Passa a variável de escopo correta para validar a submissão
                const podeAcessar = podeAcessarSubmissao({
                    evento: dadosEvento,
                    usuario: dadosUsuario,
                });

                setSubmissaoHabilitada(podeAcessar);
                setSubmissaoVerificada(true);

                if (dadosEvento?.etapas && Array.isArray(dadosEvento.etapas)) {
                    const etapaRealizacao = dadosEvento.etapas.find((e) =>
                        e.tipo_etapa?.toLowerCase().includes('realizacao_evento'),
                    );
                    
                    setDatasRealizacao({
                        inicio: etapaRealizacao?.data_inicio || dadosEvento.data_inicio || '',
                        fim: etapaRealizacao?.data_fim || dadosEvento.data_fim || '',
                    });
                } else {
                    setDatasRealizacao({
                        inicio: dadosEvento.data_inicio || '',
                        fim: dadosEvento.data_fim || '',
                    });
                }

                const campoArea = dadosEvento?.area_conhecimento_detalhes;
                if (campoArea && Array.isArray(campoArea)) {
                    setAreasDoEvento(campoArea.map((a) => a.area_conhecimento_display || a.nome || a));
                }
            } catch (err) {
                console.error('Erro ao buscar dados complementares:', err);
                setErroMensagem('Não foi possível carregar o cronograma.');
            } finally {
                setCarregando(false);
            }
        }
        carregarDadosComplementares();
    }, [eventoId]);

    // Lógica de segurança (Fallback Multi-dias)
    useEffect(() => {
        if (dias && dias.length > 0) {
            const mapeados = dias.map(dia => {
                const d = typeof dia === 'string' ? new Date(dia + 'T00:00:00') : dia;
                return {
                    value: d.toISOString().split('T')[0],
                    label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                };
            });
            setListaDiasSelect(mapeados);
            setDataSelecionada(mapeados[0].value);
        } 
        else if (datasRealizacao.inicio && datasRealizacao.fim) {
            const dataInicio = new Date(datasRealizacao.inicio + 'T00:00:00');
            const dataFim = new Date(datasRealizacao.fim + 'T00:00:00');
            const resultado = [];

            let atual = new Date(dataInicio);
            while (atual <= dataFim) {
                const iso = atual.toISOString().split('T')[0];
                const label = atual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                resultado.push({ value: iso, label: label });
                atual.setDate(atual.getDate() + 1);
            }
            setListaDiasSelect(resultado);
            if (resultado.length > 0 && !dataSelecionada) {
                setDataSelecionada(resultado[0].value);
            }
        }
    }, [dias, datasRealizacao]);

    function exibirDataPorExtenso(dataString) {
        if (!dataString) return '—';
        try {
            const apenasData = dataString.split('T')[0];
            const partes = apenasData.split('-');
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
            return '—';
        } catch (e) {
            return '—';
        }
    }

    const normalizarAreaConhecimento = (texto) => {
        if (!texto) return '';
        return texto
            .normalize("NFD")                  
            .replace(/[\u0300-\u036f]/g, "")   
            .toUpperCase()                     
            .replace(/\s+/g, "_")              
            .replace(/[^A-Z0-9_]/g, "");       
    };

    const alternarFiltroArea = (nomeArea) => {
        if (areaAtiva === nomeArea) {
            setAreaAtiva(null);
        } else {
            setAreaAtiva(nomeArea);
        }
    };

    // Filtra e agrupa na tela as apresentações
    useEffect(() => {
        if (!sessoesRaw || sessoesRaw.length === 0) {
            setSessoesFiltradas([]);
            return;
        }

        const termo = termoBusca.toLowerCase().trim();
        const mapaAgrupamento = {};

        sessoesRaw.forEach((sessaoBanco) => {
            const apresentacoes = sessaoBanco.ordem_apresentacoes_display || [];

            const dataSessao = sessaoBanco.data_horario_inicio
                ? sessaoBanco.data_horario_inicio.split('T')[0]
                : '';
            if (dataSelecionada && dataSessao !== dataSelecionada) return;

            const stringHorarioInicio = sessaoBanco.data_horario_inicio ? sessaoBanco.data_horario_inicio.split('T')[1] : '';
            const stringHorarioFim = sessaoBanco.data_horario_fim ? sessaoBanco.data_horario_fim.split('T')[1] : '';

            const horaInicioLimpa = stringHorarioInicio ? stringHorarioInicio.slice(0, 5) : '--:--';
            const horaFimLimpa = stringHorarioFim ? stringHorarioFim.slice(0, 5) : '--:--';
            const chaveBlocoHorario = `${horaInicioLimpa} - ${horaFimLimpa}`;

            let turnoCalculado = 'manhã';
            const horaInteira = parseInt(horaInicioLimpa.split(':')[0], 10);
            if (horaInteira >= 12 && horaInteira < 18) {
                turnoCalculado = 'tarde';
            } else if (horaInteira >= 18) {
                turnoCalculado = 'noite';
            }

            if (turnoCalculado !== turnoAtivo) return;

            const atividadesFiltradas = apresentacoes
                .map((itemOrdem) => {
                    const atracao = itemOrdem.atracao_display || itemOrdem.atracao || {};

                    let listaAutores = [];
                    if (atracao.equipe_json) {
                        try {
                            const equipe = typeof atracao.equipe_json === 'string' ? JSON.parse(atracao.equipe_json) : atracao.equipe_json;
                            listaAutores = equipe.map((m) => m.nome || m.autor);
                        } catch (e) {
                            listaAutores = [atracao.autor || 'Autor Não Informado'];
                        }
                    } else if (atracao.autor) {
                        listaAutores = [atracao.autor];
                    }

                    const areaTrabalhoBruta = atracao.area_conhecimento?.area_conhecimento_display || 
                                              atracao.area_conhecimento?.nome || atracao.area_conhecimento || '';

                    const listaTags = [];
                    if (atracao.tipo) listaTags.push({ texto: atracao.tipo });
                    if (areaTrabalhoBruta) listaTags.push({ texto: areaTrabalhoBruta });

                    return {
                        hora: horaInicioLimpa,
                        titulo: atracao.titulo || 'Atração Sem Título',
                        descricao: atracao.resumo || 'Nenhum resumo disponível.',
                        palavrasChave: atracao.palavras_chave || '',
                        nivelEnsino: atracao.nivel_ensino_display || atracao.nivel_ensino || '',
                        autores: listaAutores,
                        areaConhecimentoRaw: areaTrabalhoBruta, 
                        local: sessaoBanco.espaco_display?.nome || `Espaço #${sessaoBanco.espaco}`,
                        tags: listaTags.map((t) => ({
                            texto: t.texto,
                            corFundo: obterCorPorTag(t.texto),
                            corTexto: '#FFFFFF',
                        })),
                    };
                })
                .filter((ativ) => {
                    if (areaAtiva) {
                        const areaAtivaNormalizada = normalizarAreaConhecimento(areaAtiva);
                        const areaAtivacaoTrabalhoNormalizada = normalizarAreaConhecimento(ativ.areaConhecimentoRaw);
                        
                        if (areaAtivacaoTrabalhoNormalizada !== areaAtivaNormalizada) {
                            return false;
                        }
                    }

                    const titulo = ativ.titulo.toLowerCase();
                    const autor = ativ.autores.join(' ').toLowerCase();
                    return !termo || titulo.includes(termo) || autor.includes(termo);
                });

            if (atividadesFiltradas.length > 0) {
                if (!mapaAgrupamento[chaveBlocoHorario]) {
                    mapaAgrupamento[chaveBlocoHorario] = [];
                }
                mapaAgrupamento[chaveBlocoHorario].push(...atividadesFiltradas);
            }
        });

        const resultadoFinal = Object.keys(mapaAgrupamento)
            .map((bloco) => ({
                blocoHorario: bloco,
                atividades: mapaAgrupamento[bloco],
            }))
            .sort((a, b) => a.blocoHorario.localeCompare(b.blocoHorario));

        setSessoesFiltradas(resultadoFinal);
    }, [sessoesRaw, dataSelecionada, termoBusca, turnoAtivo, areaAtiva]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />

            <section style={{ backgroundImage: 'linear-gradient(to right, #17882c 0%, #00510f 100%)', color: 'white' }} className="py-4 shadow-sm">
                <Container fluid="xl">
                    <Row className="align-items-center g-3">
                        <Col lg={7} md={6} xs={12}>
                            <h1 className="h2 fw-bold mb-1">
                                {carregando ? 'Buscando evento...' : evento?.nome || 'Programação do Evento'}
                            </h1>
                            <div className="d-flex flex-wrap gap-3 text-white opacity-90 small mt-2">
                                <span className="d-flex align-items-center gap-1">
                                    <MdCalendarToday />
                                    Realização: {exibirDataPorExtenso(datasRealizacao.inicio)} até {exibirDataPorExtenso(datasRealizacao.fim)}
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    <MdPlace />
                                    {evento?.local_display?.nome || evento?.local?.nome || 'IFRS Campus Restinga'}
                                </span>
                            </div>
                        </Col>
                        <Col lg={5} md={6} xs={12} className="text-md-end d-flex gap-2 justify-content-md-end justify-content-start flex-wrap mt-2 mt-md-0">
                            {evento?.link_edital && (
                                <Button 
                                    href={evento.link_edital} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    variant="outline-light" 
                                    className="fw-bold px-3 py-2 small d-flex align-items-center gap-1"
                                >
                                    <MdInfoOutline size={16} /> Ver Regulamento
                                </Button>
                            )}
                            <Button as={Link} to={`/inscrever_atracoes/${evento?.id}`} variant="outline-light" className="fw-bold px-3 py-2 small d-flex align-items-center gap-1" onClick={prepararEventoSelecionado}>
                                Me Inscrever nas atrações
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* FAIXA DE FILTRAGEM POR BADGES DE ÁREA DE CONHECIMENTO */}
            <section className="bg-light border-bottom py-3">
                <Container fluid="xl">
                    <Row className="g-3 text-dark small">
                        <Col xs={12}>
                            <span className="text-muted fw-bold d-block text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>
                                Filtrar por Área de Conhecimento {areaAtiva && <span className="text-success fw-normal text-lowercase">(Clique na área ativa para limpar)</span>}
                            </span>
                            <div className="d-flex flex-wrap gap-1">
                                {areasDoEvento.length > 0 ? (
                                    areasDoEvento.map((area, i) => {
                                        const ehAtivo = areaAtiva === area;
                                        return (
                                            <span
                                                key={i}
                                                onClick={() => alternarFiltroArea(area)}
                                                className="badge px-2 py-1.5 border rounded transition-all"
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: ehAtivo ? verdeDestaque : '#FFFFFF',
                                                    color: ehAtivo ? '#FFFFFF' : '#4B5563',
                                                    borderColor: ehAtivo ? verdeDestaque : '#D1D5DB',
                                                }}
                                            >
                                                {area} {ehAtivo && ' ✕'}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1 border rounded">Geral</span>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* BARRA DE BUSCA E SELECT DINÂMICO DOS DIAS */}
            <section className="bg-white border-bottom py-3">
                <Container fluid="xl">
                    <Row className="align-items-center g-3">
                        <Col md={5}>
                            <InputGroup className="bg-white border rounded">
                                <Form.Control
                                    placeholder="Pesquise por título ou autor..."
                                    value={termoBusca}
                                    onChange={(e) => setTermoBusca(e.target.value)}
                                    className="border-0 px-3"
                                    style={{ boxShadow: 'none' }}
                                />
                                <Button variant="link" className="text-secondary p-2">
                                    <MdSearch size={20} />
                                </Button>
                            </InputGroup>
                        </Col>

                        <Col md={3}>
                            <Form.Select
                                value={dataSelecionada}
                                onChange={(e) => setDataSelecionada(e.target.value)}
                                className="fw-medium border"
                                style={{ cursor: 'pointer' }}
                            >
                                {listaDiasSelect.length > 0 ? (
                                    listaDiasSelect.map((dia, index) => (
                                        <option key={index} value={dia.value}>
                                            Dia do evento: {dia.label}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Carregando calendário...</option>
                                )}
                            </Form.Select>
                        </Col>

                        <Col md={4} className="d-flex gap-2 justify-content-md-end">
                            {['manhã', 'tarde', 'noite'].map((turno) => (
                                <Button
                                    key={turno}
                                    variant={turnoAtivo === turno ? 'dark' : 'outline-secondary'}
                                    className="rounded-pill px-3 py-1 fw-bold text-uppercase small"
                                    onClick={() => setTurnoAtivo(turno)}
                                    style={turnoAtivo === turno ? { backgroundColor: verdeDestaque, borderColor: verdeDestaque } : {}}
                                >
                                    {turno}
                                </Button>
                            ))}
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CONTEÚDO DA GRADE HORÁRIA */}
            <Container fluid="xl" className="py-4">
                <Row className="g-4">
                    <Col lg={trabalhoSelecionado ? 7 : 12} xs={12} style={{ transition: 'all 0.3s ease' }}>
                        <h3 className="h6 fw-bold text-secondary text-uppercase mb-3 tracking-wider">Programação oficial</h3>

                        {carregando ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="success" />
                            </div>
                        ) : erroMensagem ? (
                            <Alert variant="danger">{erroMensagem}</Alert>
                        ) : sessoesFiltradas.length > 0 ? (
                            sessoesFiltradas.map((sessaoGlobal, idx) => (
                                <div key={idx} className="card mb-4 border shadow-sm" style={{ borderRadius: '8px' }}>
                                    <div className="card-header bg-white border-bottom py-2 px-3 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                                            <MdAccessTime size={18} className="text-success" />
                                            <span>Sessão: {sessaoGlobal.blocoHorario}</span>
                                        </div>
                                        <span className="badge bg-light text-dark border rounded-pill text-lowercase px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                            {sessaoGlobal.atividades.length} {sessaoGlobal.atividades.length === 1 ? 'trabalho' : 'trabalhos'}
                                        </span>
                                    </div>

                                    <div className="card-body p-2 bg-light-subtle">
                                        {sessaoGlobal.atividades.map((ativ, ativIdx) => {
                                            const estaAtivo = trabalhoSelecionado?.titulo === ativ.titulo;
                                            const corBordaAlvo = estaAtivo ? verdeDestaque : '#E5E7EB';
                                            return (
                                                <div
                                                    key={ativIdx}
                                                    className="p-3 mb-2 bg-white rounded shadow-xs"
                                                    style={{
                                                        borderTop: `1px solid ${corBordaAlvo}`,
                                                        borderRight: `1px solid ${corBordaAlvo}`,
                                                        borderBottom: `1px solid ${corBordaAlvo}`,
                                                        borderLeft: `5px solid ${obterCorPorTag(ativ.tags[0]?.texto || '')}`,
                                                        backgroundColor: estaAtivo ? '#F4FBF7' : '#FFFFFF',
                                                    }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
                                                        <div className="d-flex flex-wrap gap-1">
                                                            <span className="text-muted small fw-bold me-2" style={{ fontSize: '0.8rem' }}>Horário: {ativ.hora}</span>
                                                            {ativ.tags.map((t, tIdx) => (
                                                                <span key={tIdx} className="badge rounded px-2 py-0.5" style={{ backgroundColor: t.corFundo, color: t.corTexto, fontSize: '0.68rem' }}>{t.texto}</span>
                                                            ))}
                                                        </div>
                                                        <Button variant={estaAtivo ? 'dark' : 'outline-secondary'} size="sm" className="rounded px-2 py-0.5 d-flex align-items-center gap-1 fw-semibold" style={{ fontSize: '0.75rem' }} onClick={() => setTrabalhoSelecionado(ativ)}>
                                                            Ver Detalhes <MdChevronRight size={14} />
                                                        </Button>
                                                    </div>
                                                    <h5 className="fw-bold text-dark mb-1 mt-1" style={{ fontSize: '0.95rem' }}>{ativ.titulo}</h5>
                                                    <div className="d-flex flex-wrap gap-3 text-muted font-monospace mt-1" style={{ fontSize: '0.78rem' }}>
                                                        <span><MdPeople /> {ativ.autores.join(', ')}</span>
                                                        <span><MdPlace /> {ativ.local}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 border rounded bg-light">
                                <p className="text-muted m-0">Nenhuma atividade localizada para este filtro.</p>
                            </div>
                        )}
                    </Col>

                    {/* COLUNA DIREITA: DETALHES DE FICHA TÉCNICA */}
                    {trabalhoSelecionado && (
                        <Col lg={5} xs={12} className="position-sticky" style={{ top: '20px', height: 'fit-content' }}>
                            <div className="card shadow-sm border" style={{ borderRadius: '8px' }}>
                                <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom pt-3 px-3 pb-2">
                                    <span className="text-uppercase fw-bold text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        <MdInfoOutline size={16} /> Ficha Técnica do Trabalho
                                    </span>
                                    <Button variant="light" className="rounded-circle p-1 d-flex align-items-center justify-content-center" onClick={() => setTrabalhoSelecionado(null)}>
                                        <MdClose size={18} />
                                    </Button>
                                </div>

                                <div className="card-body px-3 pb-3">
                                    <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '1.15rem', lineHeight: '1.3' }}>{trabalhoSelecionado.titulo}</h4>
                                    <div className="d-flex flex-wrap gap-1 mb-3">
                                        {trabalhoSelecionado.tags.map((t, idx) => (
                                            <span key={idx} className="badge rounded px-2 py-1" style={{ backgroundColor: t.corFundo, color: t.corTexto, fontSize: '0.7rem' }}>{t.texto}</span>
                                        ))}
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-muted d-block fw-bold tracking-wider" style={{ fontSize: '0.7rem' }}>AUTORES / APRESENTADORES</span>
                                        <span className="text-dark fw-medium" style={{ fontSize: '0.9rem' }}>{trabalhoSelecionado.autores.join(', ') || '—'}</span>
                                    </div>
                                    <div className="row g-2 border-top border-bottom py-2 mb-3">
                                        <div className="col-6">
                                            <span className="text-muted d-block fw-bold" style={{ fontSize: '0.7rem' }}>HORÁRIO DE INÍCIO</span>
                                            <span className="text-dark fw-bold" style={{ fontSize: '0.9rem' }}>{trabalhoSelecionado.hora}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fw-bold" style={{ fontSize: '0.7rem' }}>ESPAÇO / SALA</span>
                                            <span className="text-dark fw-bold text-truncate d-block" style={{ fontSize: '0.9rem' }}>{trabalhoSelecionado.local}</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-muted d-block fw-bold mb-1" style={{ fontSize: '0.7rem' }}>RESUMO EXPANDIDO</span>
                                        <p className="text-dark lh-base m-0 border-0 p-0" style={{ fontSize: '0.88rem', textAlign: 'justify', maxHeight: '18vh', overflowY: 'auto' }}>
                                            {trabalhoSelecionado.descricao}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>

            <Footer telefone="(51) 3333-1234" endereco="Rua Alberto Hoffmann, 285" ano={2026} campus="Campus Restinga" />
        </div>
    );
}