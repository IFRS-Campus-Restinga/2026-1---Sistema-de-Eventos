import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    Form,
    Spinner,
    Alert,
    Badge,
} from 'react-bootstrap';
import { MdGrade, MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import {
    buscarAtracaoDetalhe,
    buscarCriteriosPorModalidade,
    listarAvaliacoesSubmissao,
    criarAvaliacaoSubmissao,
    atualizarAvaliacaoSubmissao,
} from '../services/avaliacaoSubmissaoService';

const STATUS_OPCOES = [
    { value: 'EM_AVALIACAO', label: 'Em Avaliação' },
    { value: 'APROVADO', label: 'Aprovado' },
    { value: 'REPROVADO', label: 'Reprovado' },
    { value: 'APROVADO_COM_RESSALVAS', label: 'Aprovado com Ressalvas' },
];

export default function AvaliacaoSubmissao() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [atracao, setAtracao] = useState(null);
    const [criterios, setCriterios] = useState([]);
    const [avaliacaoExistente, setAvaliacaoExistente] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [alerta, setAlerta] = useState({ mensagem: '', variacao: 'danger' });

    const [notas, setNotas] = useState({});
    const [parecer, setParecer] = useState('');
    const [status, setStatus] = useState('EM_AVALIACAO');

    useEffect(() => {
        async function carregarDados() {
            try {
                const dadosAtracao = await buscarAtracaoDetalhe(id);
                setAtracao(dadosAtracao);

                const dadosCriterios = dadosAtracao.modalidade
                    ? await buscarCriteriosPorModalidade(dadosAtracao.modalidade)
                    : [];
                setCriterios(dadosCriterios);

                const avaliacoes = await listarAvaliacoesSubmissao(id);
                if (avaliacoes.length > 0) {
                    const aval = avaliacoes[0];
                    setAvaliacaoExistente(aval);
                    setParecer(aval.parecer || '');
                    setStatus(aval.status || 'EM_AVALIACAO');
                    const notasIniciais = {};
                    (aval.notas || []).forEach((n) => {
                        notasIniciais[n.criterio] = n.nota;
                    });
                    setNotas(notasIniciais);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setAlerta({
                    mensagem: 'Não foi possível carregar os dados da submissão.',
                    variacao: 'danger',
                });
            } finally {
                setCarregando(false);
            }
        }
        carregarDados();
    }, [id]);

    function handleNotaChange(criterioId, valor) {
        const nota = Math.max(0, Math.min(10, Number(valor)));
        setNotas((prev) => ({ ...prev, [criterioId]: nota }));
    }

    async function handleSubmeter(e) {
        e.preventDefault();
        setEnviando(true);
        setAlerta({ mensagem: '', variacao: 'danger' });

        const notasArray = criterios.map((c) => ({
            criterio: c.id,
            nota: notas[c.id] ?? 0,
        }));

        const payload = {
            atracao: Number(id),
            parecer,
            status,
            notas: notasArray,
        };

        try {
            if (avaliacaoExistente) {
                await atualizarAvaliacaoSubmissao(avaliacaoExistente.id, payload);
            } else {
                await criarAvaliacaoSubmissao(payload);
            }
            setAlerta({
                mensagem: 'Avaliação salva com sucesso!',
                variacao: 'success',
            });
        } catch (error) {
            console.error('Erro ao salvar avaliação:', error);
            setAlerta({
                mensagem: 'Não foi possível salvar a avaliação. Verifique os dados.',
                variacao: 'danger',
            });
        } finally {
            setEnviando(false);
        }
    }

    const mediaNotas =
        criterios.length > 0
            ? (
                  criterios.reduce((acc, c) => acc + (notas[c.id] ?? 0), 0) /
                  criterios.length
              ).toFixed(1)
            : null;

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    {carregando ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                            <p className="mt-2 text-muted">
                                Carregando dados da submissão...
                            </p>
                        </div>
                    ) : (
                        <>
                            {alerta.mensagem && (
                                <Alert
                                    variant={alerta.variacao}
                                    className="mb-3"
                                    dismissible
                                    onClose={() =>
                                        setAlerta({ mensagem: '', variacao: 'danger' })
                                    }
                                >
                                    {alerta.mensagem}
                                </Alert>
                            )}

                            {/* Detalhes da submissão */}
                            <Card corBorda="#003366">
                                <Container fluid className="px-4 pt-4 pb-3">
                                    <Row className="mb-2">
                                        <Col className="d-flex align-items-center">
                                            <MdGrade color="#003366" size={32} />
                                            <h4
                                                className="fw-bold ms-2 mb-0"
                                                style={{ color: '#003366' }}
                                            >
                                                Avaliação da Submissão
                                            </h4>
                                        </Col>
                                    </Row>
                                    <hr />
                                    {atracao ? (
                                        <Row>
                                            <Col md={8}>
                                                <p className="fw-semibold fs-5 mb-1">
                                                    {atracao.titulo}
                                                </p>
                                                {atracao.tipo && (
                                                    <p className="text-muted small mb-1">
                                                        <strong>Modalidade:</strong>{' '}
                                                        {atracao.tipo}
                                                    </p>
                                                )}
                                                {atracao.area_conhecimento && (
                                                    <p className="text-muted small mb-1">
                                                        <strong>Área:</strong>{' '}
                                                        {atracao.area_conhecimento}
                                                    </p>
                                                )}
                                                {atracao.palavras_chave && (
                                                    <p className="text-muted small mb-1">
                                                        <strong>Palavras-chave:</strong>{' '}
                                                        {atracao.palavras_chave}
                                                    </p>
                                                )}
                                                {atracao.resumo && (
                                                    <>
                                                        <p className="fw-semibold mt-3 mb-1">
                                                            Resumo
                                                        </p>
                                                        <p className="text-muted small">
                                                            {atracao.resumo}
                                                        </p>
                                                    </>
                                                )}
                                            </Col>
                                            <Col md={4} className="text-end">
                                                <Badge
                                                    bg={
                                                        atracao.status === 'CONFIRMADA'
                                                            ? 'success'
                                                            : atracao.status === 'CANCELADA'
                                                              ? 'danger'
                                                              : 'secondary'
                                                    }
                                                    className="px-3 py-2"
                                                >
                                                    {atracao.status || 'N/A'}
                                                </Badge>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <p className="text-muted">
                                            Submissão não encontrada.
                                        </p>
                                    )}
                                </Container>
                            </Card>

                            {/* Formulário de avaliação */}
                            <Card corBorda="#00A44B" className="mt-4">
                                <Container fluid className="px-4 pt-4 pb-3">
                                    <Row className="mb-2">
                                        <Col>
                                            <h5
                                                className="fw-bold"
                                                style={{ color: '#00A44B' }}
                                            >
                                                Formulário de Avaliação
                                            </h5>
                                        </Col>
                                        {mediaNotas !== null && (
                                            <Col className="text-end">
                                                <span className="fw-bold text-success fs-5">
                                                    Média: {mediaNotas}
                                                </span>
                                            </Col>
                                        )}
                                    </Row>
                                    <hr />

                                    <Form onSubmit={handleSubmeter}>
                                        {criterios.length > 0 ? (
                                            <>
                                                <p className="text-muted small mb-3">
                                                    Atribua uma nota de 0 a 10 para
                                                    cada critério de avaliação.
                                                </p>
                                                {criterios.map((criterio) => (
                                                    <Form.Group
                                                        key={criterio.id}
                                                        className="mb-4"
                                                    >
                                                        <Form.Label className="fw-semibold">
                                                            {criterio.nome}
                                                        </Form.Label>
                                                        {criterio.descricao && (
                                                            <p className="text-muted small mb-1">
                                                                {criterio.descricao}
                                                            </p>
                                                        )}
                                                        <Row className="align-items-center">
                                                            <Col xs={4} md={2}>
                                                                <Form.Control
                                                                    type="number"
                                                                    min={0}
                                                                    max={10}
                                                                    value={
                                                                        notas[criterio.id] ??
                                                                        ''
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleNotaChange(
                                                                            criterio.id,
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    placeholder="0-10"
                                                                />
                                                            </Col>
                                                            <Col>
                                                                <Form.Range
                                                                    min={0}
                                                                    max={10}
                                                                    step={1}
                                                                    value={
                                                                        notas[criterio.id] ??
                                                                        0
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleNotaChange(
                                                                            criterio.id,
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Form.Group>
                                                ))}
                                            </>
                                        ) : (
                                            <p className="text-muted small mb-3">
                                                Nenhum critério de avaliação cadastrado
                                                para esta modalidade.
                                            </p>
                                        )}

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">
                                                Parecer Geral
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                value={parecer}
                                                onChange={(e) =>
                                                    setParecer(e.target.value)
                                                }
                                                placeholder="Descreva seu parecer sobre a submissão..."
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">
                                                Resultado da Avaliação
                                            </Form.Label>
                                            <Form.Select
                                                value={status}
                                                onChange={(e) =>
                                                    setStatus(e.target.value)
                                                }
                                            >
                                                {STATUS_OPCOES.map((opt) => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <div className="d-flex gap-3 mt-3">
                                            <Button
                                                type="submit"
                                                disabled={enviando}
                                                style={{
                                                    backgroundColor: '#00A44B',
                                                    border: 'none',
                                                }}
                                                className="d-flex align-items-center gap-2 px-4 py-2"
                                            >
                                                {enviando ? (
                                                    <Spinner
                                                        animation="border"
                                                        size="sm"
                                                    />
                                                ) : (
                                                    <MdCheckCircle size={20} />
                                                )}
                                                {avaliacaoExistente
                                                    ? 'Atualizar Avaliação'
                                                    : 'Salvar Avaliação'}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => navigate(-1)}
                                                className="d-flex align-items-center gap-2 px-4 py-2"
                                            >
                                                <MdArrowBack /> Voltar
                                            </Button>
                                        </div>
                                    </Form>
                                </Container>
                            </Card>
                        </>
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
