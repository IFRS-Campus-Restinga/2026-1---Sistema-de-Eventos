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
} from 'react-icons/md';
import { useParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import ModalPopup from '../components/common/ModalPopup';

// Hooks e Utilitários do ecossistema do seu app
import useSessoes from '../hooks/useSessoes';
import { obterCorPorTag } from '../utils/themeTags';

export default function ProgramacaoEvento() {
    const { id: eventoId } = useParams();
    const verdeIFRS = '#00A44B';

    const [termoBusca, setTermoBusca] = useState('');
    const [turnoAtivo, setTurnoAtivo] = useState('manhã');
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [atracaoResumo, setAtracaoResumo] = useState(null);
    const [sessoesFiltradas, setSessoesFiltradas] = useState([]);

    const { sessoes, dias, loading, error, carregarEvento, fetchSessoes } =
        useSessoes();

    useEffect(() => {
        if (eventoId) {
            carregarEvento(eventoId);
            fetchSessoes(eventoId);
        }
    }, [eventoId]);

    useEffect(() => {
        if (dias && dias.length > 0) {
            setDataSelecionada(formatarDataValue(dias[0]));
        }
    }, [dias]);

    const selecionarAtracaoResumo = (atracao) => {
        setAtracaoResumo(atracao);
        setShowModal(true);
    };

    function formatarDataValue(data) {
        return data.toISOString().split('T')[0];
    }

    function formatarDataLabel(data) {
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        });
    }

    useEffect(() => {
        if (!sessoes || sessoes.length === 0) {
            setSessoesFiltradas([]);
            return;
        }

        const termo = termoBusca.toLowerCase().trim();
        const mapaAgrupamento = {};

        sessoes.forEach((sessaoBanco) => {
            const dataSessao = sessaoBanco.data_horario_inicio.split('T')[0];
            if (dataSelecionada && dataSessao !== dataSelecionada) return;
            const stringHorarioInicio =
                sessaoBanco.data_horario_inicio.split('T')[1] || '';
            const stringHorarioFim =
                sessaoBanco.data_horario_fim.split('T')[1] || '';

            const horaInicioLimpa = stringHorarioInicio.slice(0, 5);
            const horaFimLimpa = stringHorarioFim.slice(0, 5);
            const chaveBlocoHorario = `${horaInicioLimpa} - ${horaFimLimpa}`;
            let turnoCalculado = 'manhã';
            const horaInteira = parseInt(horaInicioLimpa.split(':')[0], 10);
            if (horaInteira >= 12 && horaInteira < 18) {
                turnoCalculado = 'tarde';
            } else if (horaInteira >= 18) {
                turnoCalculado = 'noite';
            }

            if (turnoCalculado !== turnoAtivo) return;

            const apresentacoesOriginais =
                sessaoBanco.ordem_apresentacoes_display || [];
            const atividadesFiltradas = apresentacoesOriginais
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
                    } else if (atracao.area_conhecimento) {
                        listaTags.push({
                            texto: String(atracao.area_conhecimento),
                        });
                    }

                    return {
                        hora: horaInicioLimpa,
                        titulo: atracao.titulo || 'Atração Sem Título',
                        descricao:
                            atracao.resumo ||
                            'Nenhum resumo disponível para esta atração.',
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
                    const bateuNaTag = ativ.tags.some((tag) =>
                        tag.texto.toLowerCase().includes(termo),
                    );

                    return (
                        !termo ||
                        titulo.includes(termo) ||
                        autor.includes(termo) ||
                        bateuNaTag
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
    }, [sessoes, dataSelecionada, termoBusca, turnoAtivo]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />
            <main className="flex-fill">
                <section
                    style={{ backgroundColor: verdeIFRS, color: 'white' }}
                    className="py-5 text-center shadow-sm"
                >
                    <Container>
                        <h1 className="display-5 fw-bold mb-2">
                            Programação Oficial
                        </h1>
                        <p className="mb-4 opacity-90">
                            Confira os horários e locais das atividades do
                            evento
                        </p>
                        <Row className="justify-content-center">
                            <Col md={8} lg={6}>
                                <InputGroup className="shadow-sm rounded-pill overflow-hidden bg-white p-1">
                                    <Form.Control
                                        placeholder="Pesquise por título, autor ou tag..."
                                        value={termoBusca}
                                        onChange={(e) =>
                                            setTermoBusca(e.target.value)
                                        }
                                        className="border-0 px-3 py-2"
                                        style={{
                                            outline: 'none',
                                            boxShadow: 'none',
                                        }}
                                    />
                                    <Button
                                        variant="dark"
                                        className="rounded-pill px-4 fw-bold d-flex align-items-center"
                                    >
                                        <MdSearch className="me-2" size={18} />{' '}
                                        Buscar
                                    </Button>
                                </InputGroup>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <Container className="py-4 mt-2">
                    {dias && dias.length > 0 && (
                        <Row className="justify-content-center mb-4">
                            <Col
                                xs={12}
                                md={4}
                                className="d-flex align-items-center gap-2"
                            >
                                <MdEvent size={24} className="text-secondary" />
                                <Form.Group className="w-100 m-0">
                                    <Form.Select
                                        value={dataSelecionada}
                                        onChange={(e) =>
                                            setDataSelecionada(e.target.value)
                                        }
                                        className="fw-semibold border-secondary-subtle"
                                    >
                                        {dias.map((dia, index) => (
                                            <option
                                                key={index}
                                                value={formatarDataValue(dia)}
                                            >
                                                Dia do Evento:{' '}
                                                {formatarDataLabel(dia)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    <div className="d-flex justify-content-center gap-3 mb-5">
                        {['manhã', 'tarde', 'noite'].map((turno) => (
                            <Button
                                key={turno}
                                variant={
                                    turnoAtivo === turno
                                        ? 'dark'
                                        : 'outline-secondary'
                                }
                                className="rounded-pill px-4 fw-bold text-uppercase"
                                onClick={() => setTurnoAtivo(turno)}
                                style={
                                    turnoAtivo === turno
                                        ? {
                                              backgroundColor: `${verdeIFRS}`,
                                              borderColor: '#111827',
                                          }
                                        : {}
                                }
                            >
                                {turno}
                            </Button>
                        ))}
                    </div>

                    <Row className="justify-content-center">
                        <Col lg={10}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner
                                        animation="border"
                                        variant="success"
                                    />
                                    <p className="text-muted mt-2 small">
                                        Buscando cronograma no servidor...
                                    </p>
                                </div>
                            ) : error ? (
                                <Alert variant="danger">
                                    Não foi possível carregar a programação.
                                    Erro: {error}
                                </Alert>
                            ) : sessoesFiltradas.length > 0 ? (
                                sessoesFiltradas.map((sessaoGlobal, idx) => (
                                    <div
                                        key={idx}
                                        className="card shadow-sm border-0 mb-4 overflow-hidden"
                                        style={{ borderRadius: '16px' }}
                                    >
                                        <div className="card-header bg-white text-dark py-3 px-4 d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2 m-0 fw-bold">
                                                <MdCalendarToday
                                                    size={20}
                                                    color={verdeIFRS}
                                                />
                                                <span className="fs-5">
                                                    Sessão:{' '}
                                                    {sessaoGlobal.blocoHorario}
                                                </span>
                                            </div>
                                            <span className="badge bg-secondary text-uppercase px-3 py-2 rounded-pill">
                                                {sessaoGlobal.atividades.length}{' '}
                                                {sessaoGlobal.atividades
                                                    .length === 1
                                                    ? 'Trabalho'
                                                    : 'Trabalhos'}
                                            </span>
                                        </div>

                                        <div className="card-body p-0">
                                            {sessaoGlobal.atividades.map(
                                                (ativ, ativIdx) => (
                                                    <div
                                                        key={ativIdx}
                                                        className="p-4 border-bottom last-border-0 d-flex flex-md-row flex-column justify-content-between align-items-md-center gap-3 bg-white"
                                                        style={{
                                                            borderLeft: `6px solid ${obterCorPorTag(
                                                                ativ.tags[0]
                                                                    ?.texto ||
                                                                    '',
                                                            )}`,
                                                        }}
                                                    >
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                                <span className="badge bg-light text-dark border rounded-pill">
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
                                                                            className="badge rounded-pill"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    t.corFundo,
                                                                                color: t.corTexto,
                                                                            }}
                                                                        >
                                                                            {
                                                                                t.texto
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                            <h4 className="h5 fw-bold text-dark mb-2">
                                                                {ativ.titulo}
                                                            </h4>
                                                            <div className="d-flex flex-wrap gap-3 text-muted small">
                                                                <span className="d-flex align-items-center gap-1">
                                                                    <MdPeople
                                                                        size={
                                                                            16
                                                                        }
                                                                    />{' '}
                                                                    {ativ.autores.join(
                                                                        ', ',
                                                                    )}
                                                                </span>
                                                                <span className="d-flex align-items-center gap-1">
                                                                    <MdPlace
                                                                        size={
                                                                            16
                                                                        }
                                                                    />{' '}
                                                                    {ativ.local}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2 align-items-center justify-content-md-end">
                                                            <Button
                                                                variant="outline-dark"
                                                                size="sm"
                                                                className="rounded-pill px-3"
                                                                onClick={() =>
                                                                    selecionarAtracaoResumo(
                                                                        ativ,
                                                                    )
                                                                }
                                                            >
                                                                Ver Resumo
                                                            </Button>
                                                            <Button
                                                                variant={
                                                                    ativ.inscrito
                                                                        ? 'success'
                                                                        : 'primary'
                                                                }
                                                                size="sm"
                                                                className="rounded-pill px-3"
                                                                disabled={
                                                                    ativ.inscrito
                                                                }
                                                            >
                                                                {ativ.inscrito
                                                                    ? 'Inscrito'
                                                                    : 'Inscrever-se'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5 bg-white rounded shadow-sm border">
                                    <h5 className="text-muted m-0">
                                        Nenhuma atividade programada para esta
                                        data neste turno.
                                    </h5>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>

                {atracaoResumo && (
                    <ModalPopup
                        show={showModal}
                        titulo={atracaoResumo.titulo}
                        tituloSecundario={`Autores: ${atracaoResumo.autores.join(
                            ', ',
                        )}`}
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
