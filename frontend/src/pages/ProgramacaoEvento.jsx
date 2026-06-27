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
    MdEvent,
    MdClose,
    MdInfoOutline,
    MdChevronRight,
    MdAccessTime,
} from 'react-icons/md';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { setSelectedEventoId } from '../utils/selectedEvento';

// Importação dos seus services nativos
import { buscarEventoPorId } from '../services/eventoService';
import { pegarSessoes } from '../services/sessoesService';
import { obterCorPorTag } from '../utils/themeTags';

export default function ProgramacaoEvento() {
    const { id: eventoId } = useParams();

    const prepararEventoSelecionado = () => {
        setSelectedEventoId(evento?.id || eventoId);
    };

    const verdeIFRSOficial = '#004F2F';
    const verdeDestaque = '#008B47';

    // Estados dos dados dinâmicos do banco
    const [evento, setEvento] = useState(null);
    const [sessoesRaw, setSessoesRaw] = useState([]);
    const [diasDoEvento, setDiasDoEvento] = useState([]);

    // Estados mapeados das etapas e áreas de conhecimento
    const [datasRealizacao, setDatasRealizacao] = useState({
        inicio: '',
        fim: '',
    });
    const [datasInscricao, setDatasInscricao] = useState({
        inicio: '',
        fim: '',
    });
    const [areasDoEvento, setAreasDoEvento] = useState([]);

    // Estados de controle de renderização e busca
    const [carregando, setCarregando] = useState(true);
    const [erroMensagem, setErroMensagem] = useState(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [turnoAtivo, setTurnoAtivo] = useState('manhã');
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [sessoesFiltradas, setSessoesFiltradas] = useState([]);
    const [trabalhoSelecionado, setTrabalhoSelecionado] = useState(null);

    useEffect(() => {
        async function carregarDadosIniciais() {
            if (!eventoId) return;
            try {
                setCarregando(true);
                setErroMensagem(null);

                // 1. Busca dados do evento no Django
                const dadosEvento = await buscarEventoPorId(eventoId);
                setEvento(dadosEvento);

                // 2. Busca todas as sessões vinculadas
                const listaSessoes = await pegarSessoes(eventoId);
                setSessoesRaw(listaSessoes || []);

                // 3. MAP/FIND para extrair os dados das etapas (prazos)
                if (dadosEvento?.etapas && Array.isArray(dadosEvento.etapas)) {
                    const etapaRealizacao = dadosEvento.etapas.find((e) =>
                        e.tipo_etapa
                            ?.toLowerCase()
                            .includes('realizacao_evento'),
                    );
                    const etapaInscricao = dadosEvento.etapas.find((e) =>
                        e.tipo_etapa?.includes('inscricao_publico'),
                    );

                    const dataInicioRealizacao =
                        etapaRealizacao?.data_inicio || dadosEvento.data_inicio;
                    const dataFimRealizacao =
                        etapaRealizacao?.data_fim || dadosEvento.data_fim;

                    setDatasRealizacao({
                        inicio: dataInicioRealizacao,
                        fim: dataFimRealizacao,
                    });

                    setDatasInscricao({
                        inicio: etapaInscricao?.data_inicio || '',
                        fim: etapaInscricao?.data_fim || '',
                    });

                    if (dataInicioRealizacao && dataFimRealizacao) {
                        const listaDias = gerarIntervaloDeDias(
                            dataInicioRealizacao,
                            dataFimRealizacao,
                        );
                        setDiasDoEvento(listaDias);
                        if (listaDias.length > 0) {
                            setDataSelecionada(listaDias[0].value);
                        }
                    }
                }

                // 4. MAP para extrair as áreas de conhecimento
                let areasMapeadas = [];
                const campoArea = dadosEvento?.area_conhecimento_detalhes;
                console.log(campoArea);

                if (campoArea && Array.isArray(campoArea)) {
                    areasMapeadas = campoArea.map((area) => {
                        return area.area_conhecimento_display;
                    });
                }
                console.log(areasMapeadas);
                setAreasDoEvento(areasMapeadas);
            } catch (err) {
                console.error('Erro ao integrar com os services:', err);
                setErroMensagem(
                    'Não foi possível carregar o cronograma do evento.',
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosIniciais();
    }, [eventoId]);

    // Quebra o intervalo de datas em um array legível para o dropdown do select
    function gerarIntervaloDeDias(inicioStr, fimStr) {
        if (!inicioStr || !fimStr) return [];
        const dataInicio = new Date(inicioStr + 'T00:00:00');
        const dataFim = new Date(fimStr + 'T00:00:00');
        const resultado = [];

        let atual = new Date(dataInicio);
        while (atual <= dataFim) {
            const iso = atual.toISOString().split('T')[0];
            const label = atual.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });
            resultado.push({ value: iso, label: label });
            atual.setDate(atual.getDate() + 1);
        }
        return resultado;
    }

    // Formata strings de datas ("YYYY-MM-DD") para o formato pt-BR de forma segura
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
            console.error('Erro ao formatar data:', e);
            return '—';
        }
    }

    // useEffect: Apenas filtra e agrupa na tela. (Sem mexer em estados de áreas, livre de loops!)
    useEffect(() => {
        if (!sessoesRaw || sessoesRaw.length === 0) {
            setSessoesFiltradas([]);
            return;
        }

        const termo = termoBusca.toLowerCase().trim();
        const mapaAgrupamento = {};

        sessoesRaw.forEach((sessaoBanco) => {
            const apresentacoes = sessaoBanco.ordem_apresentacoes_display || [];

            // Filtro por data selecionada
            const dataSessao = sessaoBanco.data_horario_inicio
                ? sessaoBanco.data_horario_inicio.split('T')[0]
                : '';
            if (dataSelecionada && dataSessao !== dataSelecionada) return;

            // Extração de horários
            const stringHorarioInicio = sessaoBanco.data_horario_inicio
                ? sessaoBanco.data_horario_inicio.split('T')[1]
                : '';
            const stringHorarioFim = sessaoBanco.data_horario_fim
                ? sessaoBanco.data_horario_fim.split('T')[1]
                : '';

            const horaInicioLimpa = stringHorarioInicio
                ? stringHorarioInicio.slice(0, 5)
                : '--:--';
            const horaFimLimpa = stringHorarioFim
                ? stringHorarioFim.slice(0, 5)
                : '--:--';
            const chaveBlocoHorario = `${horaInicioLimpa} - ${horaFimLimpa}`;

            // Turno baseado na hora
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
                    const atracao =
                        itemOrdem.atracao_display || itemOrdem.atracao || {};

                    let listaAutores = [];
                    if (atracao.equipe_json) {
                        try {
                            const equipe =
                                typeof atracao.equipe_json === 'string'
                                    ? JSON.parse(atracao.equipe_json)
                                    : atracao.equipe_json;
                            listaAutores = equipe.map((m) => m.nome || m.autor);
                        } catch (e) {
                            listaAutores = [
                                atracao.autor || 'Autor Não Informado',
                            ];
                        }
                    } else if (atracao.autor) {
                        listaAutores = [atracao.autor];
                    }

                    const listaTags = [];
                    if (atracao.tipo) listaTags.push({ texto: atracao.tipo });
                    if (atracao.area_conhecimento?.area_conhecimento_display) {
                        listaTags.push({
                            texto: atracao.area_conhecimento
                                .area_conhecimento_display,
                        });
                    }

                    return {
                        hora: horaInicioLimpa,
                        titulo: atracao.titulo || 'Atração Sem Título',
                        descricao:
                            atracao.resumo || 'Nenhum resumo disponível.',
                        palavrasChave: atracao.palavras_chave || '',
                        nivelEnsino:
                            atracao.nivel_ensino_display ||
                            atracao.nivel_ensino ||
                            '',
                        autores: listaAutores,
                        local:
                            sessaoBanco.espaco_display?.nome ||
                            `Espaço #${sessaoBanco.espaco}`,
                        tags: listaTags.map((t) => ({
                            texto: t.texto,
                            corFundo: obterCorPorTag(t.texto),
                            corTexto: '#FFFFFF',
                        })),
                        inscrito: false,
                    };
                })
                .filter((ativ) => {
                    const titulo = ativ.titulo.toLowerCase();
                    const autor = ativ.autores.join(' ').toLowerCase();
                    return (
                        !termo ||
                        titulo.includes(termo) ||
                        autor.includes(termo)
                    );
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
    }, [sessoesRaw, dataSelecionada, termoBusca, turnoAtivo]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />

            <section
                style={{
                    backgroundImage:
                        'linear-gradient(to right, #17882c 0%, #00510f 100%)',
                    color: 'white',
                }}
                className="py-4 shadow-sm"
            >
                <Container fluid="xl">
                    <Row className="align-items-center justify-content-between g-3">
                        <Col md={7}>
                            <h1 className="h2 fw-bold mb-1">
                                {carregando
                                    ? 'Buscando evento...'
                                    : evento?.nome || 'Programação do Evento'}
                            </h1>
                            <div className="d-flex flex-wrap gap-3 text-white opacity-90 small">
                                <span className="d-flex align-items-center gap-1">
                                    <MdCalendarToday />
                                    Realização:{' '}
                                    {datasRealizacao.inicio
                                        ? exibirDataPorExtenso(
                                              datasRealizacao.inicio,
                                          )
                                        : '—'}{' '}
                                    até{' '}
                                    {datasRealizacao.fim
                                        ? exibirDataPorExtenso(
                                              datasRealizacao.fim,
                                          )
                                        : '—'}
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    <MdPlace />
                                    {evento?.local_display?.nome ||
                                        evento?.local?.nome ||
                                        'IFRS Campus Restinga'}
                                </span>
                                {evento?.link_edital && (
                                    <a
                                        href={evento.link_edital}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white text-decoration-none d-flex align-items-center gap-1 px-2 py-1 rounded fw-semibold transition-all"
                                        style={{
                                            fontSize: '0.82rem',
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.15)',
                                            border: '1px solid rgba(255, 255, 255, 0.25)',
                                            backdropFilter: 'blur(4px)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                'rgba(255, 255, 255, 0.25)';
                                            e.currentTarget.style.borderColor =
                                                'rgba(255, 255, 255, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                'rgba(255, 255, 255, 0.15)';
                                            e.currentTarget.style.borderColor =
                                                'rgba(255, 255, 255, 0.25)';
                                        }}
                                    >
                                        <MdInfoOutline
                                            size={15}
                                            className="text-warning"
                                        />{' '}
                                        Ver Regulamento
                                    </a>
                                )}
                            </div>
                        </Col>

                        <Col
                            md={5}
                            className="text-md-end d-flex gap-2 justify-content-md-end"
                        >
                            <Button
                                as={Link}
                                to={`/inscrever_atracoes/${evento?.id}`}
                                variant="outline-light"
                                className="fw-bold px-3 py-2 small"
                                onClick={prepararEventoSelecionado}
                            >
                                Me Inscrever nas atrações
                            </Button>

                            <Button
                                as={Link}
                                to="/adicionar_submissao"
                                variant="outline-light"
                                className="fw-bold px-3 py-2 small"
                                onClick={prepararEventoSelecionado}
                            >
                                Submeter trabalho
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* FAIXA DE PRAZOS E ÁREAS */}
            <section className="bg-light border-bottom py-3">
                <Container fluid="xl">
                    <Row className="g-3 text-dark small">
                        <Col
                            xs={12}
                            sm={4}
                            className="border-end border-2 px-3"
                        >
                            <span
                                className="text-muted fw-bold d-block text-uppercase"
                                style={{ fontSize: '0.75rem' }}
                            >
                                Realização do Evento
                            </span>
                            <span className="fw-semibold text-dark">
                                {datasRealizacao.inicio
                                    ? exibirDataPorExtenso(
                                          datasRealizacao.inicio,
                                      )
                                    : '—'}{' '}
                                —{' '}
                                {datasRealizacao.fim
                                    ? exibirDataPorExtenso(datasRealizacao.fim)
                                    : '—'}
                            </span>
                            <span className="badge bg-success-subtle text-success d-block w-fit mt-1 px-2 py-1 rounded">
                                Ativo
                            </span>
                        </Col>
                        <Col xs={12} sm={4} className="px-3">
                            <span
                                className="text-muted fw-bold d-block text-uppercase mb-1"
                                style={{ fontSize: '0.75rem' }}
                            >
                                Áreas do Evento
                            </span>
                            <div className="d-flex flex-wrap gap-1">
                                {areasDoEvento.length > 0 ? (
                                    areasDoEvento.map((area, i) => (
                                        <span
                                            key={i}
                                            className="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1 border rounded"
                                        >
                                            {area}
                                        </span>
                                    ))
                                ) : (
                                    <span className="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1 border rounded">
                                        Geral
                                    </span>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* BUSCA E SELETORES */}
            <section className="bg-white border-bottom py-3">
                <Container fluid="xl">
                    <Row className="align-items-center g-3">
                        <Col md={5}>
                            <InputGroup className="bg-white border rounded">
                                <Form.Control
                                    placeholder="Pesquise por título ou autor..."
                                    value={termoBusca}
                                    onChange={(e) =>
                                        setTermoBusca(e.target.value)
                                    }
                                    className="border-0 px-3"
                                    style={{ boxShadow: 'none' }}
                                />
                                <Button
                                    variant="link"
                                    className="text-secondary p-2"
                                >
                                    <MdSearch size={20} />
                                </Button>
                            </InputGroup>
                        </Col>

                        {diasDoEvento && diasDoEvento.length > 0 && (
                            <Col md={3}>
                                <Form.Select
                                    value={dataSelecionada}
                                    onChange={(e) =>
                                        setDataSelecionada(e.target.value)
                                    }
                                    className="fw-medium border"
                                >
                                    {diasDoEvento.map((dia, index) => (
                                        <option key={index} value={dia.value}>
                                            Dia do evento: {dia.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        )}

                        <Col
                            md={4}
                            className="d-flex gap-2 justify-content-md-end"
                        >
                            {['manhã', 'tarde', 'noite'].map((turno) => (
                                <Button
                                    key={turno}
                                    variant={
                                        turnoAtivo === turno
                                            ? 'dark'
                                            : 'outline-secondary'
                                    }
                                    className="rounded-pill px-3 py-1 fw-bold text-uppercase small"
                                    onClick={() => setTurnoAtivo(turno)}
                                    style={
                                        turnoAtivo === turno
                                            ? {
                                                  backgroundColor:
                                                      verdeDestaque,
                                                  borderColor: verdeDestaque,
                                              }
                                            : {}
                                    }
                                >
                                    {turno}
                                </Button>
                            ))}
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CORPO DE SEÇÃO DO SPLIT SCREEN */}
            <Container fluid="xl" className="py-4">
                <Row className="g-4">
                    {/* COLUNA ESQUERDA: LISTAGEM */}
                    <Col
                        lg={trabalhoSelecionado ? 7 : 12}
                        xs={12}
                        style={{ transition: 'all 0.3s ease' }}
                    >
                        <h3 className="h6 fw-bold text-secondary text-uppercase mb-3 tracking-wider">
                            Programação oficial
                        </h3>

                        {carregando ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="success" />
                            </div>
                        ) : erroMensagem ? (
                            <Alert variant="danger">{erroMensagem}</Alert>
                        ) : sessoesFiltradas.length > 0 ? (
                            sessoesFiltradas.map((sessaoGlobal, idx) => (
                                <div
                                    key={idx}
                                    className="card mb-4 border shadow-sm"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <div className="card-header bg-white border-bottom py-2 px-3 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                                            <MdAccessTime
                                                size={18}
                                                className="text-success"
                                            />
                                            <span>
                                                Sessão:{' '}
                                                {sessaoGlobal.blocoHorario}
                                            </span>
                                        </div>
                                        <span
                                            className="badge bg-light text-dark border rounded-pill text-lowercase px-2 py-1"
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            {sessaoGlobal.atividades.length}{' '}
                                            {sessaoGlobal.atividades.length ===
                                            1
                                                ? 'trabalho'
                                                : 'trabalhos'}
                                        </span>
                                    </div>

                                    <div className="card-body p-2 bg-light-subtle">
                                        {sessaoGlobal.atividades.map(
                                            (ativ, ativIdx) => {
                                                const estaAtivo =
                                                    trabalhoSelecionado?.titulo ===
                                                    ativ.titulo;
                                                const corBordaAlvo = estaAtivo
                                                    ? verdeDestaque
                                                    : '#E5E7EB';
                                                return (
                                                    <div
                                                        key={ativIdx}
                                                        className="p-3 mb-2 bg-white rounded shadow-xs"
                                                        style={{
                                                            borderTop: `1px solid ${corBordaAlvo}`,
                                                            borderRight: `1px solid ${corBordaAlvo}`,
                                                            borderBottom: `1px solid ${corBordaAlvo}`,
                                                            borderLeft: `5px solid ${obterCorPorTag(
                                                                ativ.tags[0]
                                                                    ?.texto ||
                                                                    '',
                                                            )}`,
                                                            backgroundColor:
                                                                estaAtivo
                                                                    ? '#F4FBF7'
                                                                    : '#FFFFFF',
                                                        }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
                                                            <div className="d-flex flex-wrap gap-1">
                                                                <span
                                                                    className="text-muted small fw-bold me-2"
                                                                    style={{
                                                                        fontSize:
                                                                            '0.8rem',
                                                                    }}
                                                                >
                                                                    Horário:{' '}
                                                                    {ativ.hora}
                                                                </span>
                                                                {ativ.tags.map(
                                                                    (
                                                                        t,
                                                                        tIdx,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tIdx
                                                                            }
                                                                            className="badge rounded px-2 py-0.5"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    t.corFundo,
                                                                                color: t.corTexto,
                                                                                fontSize:
                                                                                    '0.68rem',
                                                                            }}
                                                                        >
                                                                            {
                                                                                t.texto
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>

                                                            <Button
                                                                variant={
                                                                    estaAtivo
                                                                        ? 'dark'
                                                                        : 'outline-secondary'
                                                                }
                                                                size="sm"
                                                                className="rounded px-2 py-0.5 d-flex align-items-center gap-1 fw-semibold"
                                                                style={{
                                                                    fontSize:
                                                                        '0.75rem',
                                                                }}
                                                                onClick={() =>
                                                                    setTrabalhoSelecionado(
                                                                        ativ,
                                                                    )
                                                                }
                                                            >
                                                                Ver Detalhes{' '}
                                                                <MdChevronRight
                                                                    size={14}
                                                                />
                                                            </Button>
                                                        </div>
                                                        <h5
                                                            className="fw-bold text-dark mb-1 mt-1"
                                                            style={{
                                                                fontSize:
                                                                    '0.95rem',
                                                            }}
                                                        >
                                                            {ativ.titulo}
                                                        </h5>
                                                        <div
                                                            className="d-flex flex-wrap gap-3 text-muted font-monospace mt-1"
                                                            style={{
                                                                fontSize:
                                                                    '0.78rem',
                                                            }}
                                                        >
                                                            <span>
                                                                <MdPeople />{' '}
                                                                {ativ.autores.join(
                                                                    ', ',
                                                                )}
                                                            </span>
                                                            <span>
                                                                <MdPlace />{' '}
                                                                {ativ.local}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 border rounded bg-light">
                                <p className="text-muted m-0">
                                    Nenhuma atividade localizada para este
                                    filtro.
                                </p>
                            </div>
                        )}
                    </Col>

                    {/* COLUNA DIREITA: DETALHES (Ficha Técnica) */}
                    {trabalhoSelecionado && (
                        <Col
                            lg={5}
                            xs={12}
                            className="position-sticky"
                            style={{ top: '20px', height: 'fit-content' }}
                        >
                            <div
                                className="card shadow-sm border"
                                style={{ borderRadius: '8px' }}
                            >
                                <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom pt-3 px-3 pb-2">
                                    <span
                                        className="text-uppercase fw-bold text-muted small d-flex align-items-center gap-1"
                                        style={{
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        <MdInfoOutline size={16} /> Ficha
                                        Técnica do Trabalho
                                    </span>
                                    <Button
                                        variant="light"
                                        className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                                        onClick={() =>
                                            setTrabalhoSelecionado(null)
                                        }
                                    >
                                        <MdClose size={18} />
                                    </Button>
                                </div>

                                <div className="card-body px-3 pb-3">
                                    <h4
                                        className="fw-bold text-dark mb-2"
                                        style={{
                                            fontSize: '1.15rem',
                                            lineHeight: '1.3',
                                        }}
                                    >
                                        {trabalhoSelecionado.titulo}
                                    </h4>

                                    <div className="d-flex flex-wrap gap-1 mb-3">
                                        {trabalhoSelecionado.tags.map(
                                            (t, idx) => (
                                                <span
                                                    key={idx}
                                                    className="badge rounded px-2 py-1"
                                                    style={{
                                                        backgroundColor:
                                                            t.corFundo,
                                                        color: t.corTexto,
                                                        fontSize: '0.7rem',
                                                    }}
                                                >
                                                    {t.texto}
                                                </span>
                                            ),
                                        )}
                                        {trabalhoSelecionado.nivelEnsino && (
                                            <span
                                                className="badge bg-light text-dark border rounded px-2 py-1"
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                {
                                                    trabalhoSelecionado.nivelEnsino
                                                }
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <span
                                            className="text-muted d-block fw-bold tracking-wider"
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            AUTORES / APRESENTADORES
                                        </span>
                                        <span
                                            className="text-dark fw-medium"
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            {trabalhoSelecionado.autores.join(
                                                ', ',
                                            ) || '—'}
                                        </span>
                                    </div>

                                    <div className="row g-2 border-top border-bottom py-2 mb-3">
                                        <div className="col-6">
                                            <span
                                                className="text-muted d-block fw-bold"
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                HORÁRIO DE INÍCIO
                                            </span>
                                            <span
                                                className="text-dark fw-bold"
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                {trabalhoSelecionado.hora}
                                            </span>
                                        </div>
                                        <div className="col-6">
                                            <span
                                                className="text-muted d-block fw-bold"
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                ESPAÇO / SALA
                                            </span>
                                            <span
                                                className="text-dark fw-bold text-truncate d-block"
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                {trabalhoSelecionado.local}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <span
                                            className="text-muted d-block fw-bold mb-1"
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            RESUMO EXPANDIDO
                                        </span>
                                        <p
                                            className="text-dark lh-base m-0 border-0 p-0"
                                            style={{
                                                fontSize: '0.88rem',
                                                textAlign: 'justify',
                                                maxHeight: '18vh',
                                                overflowY: 'auto',
                                            }}
                                        >
                                            {trabalhoSelecionado.descricao}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
