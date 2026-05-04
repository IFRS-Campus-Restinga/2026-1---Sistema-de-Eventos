import { useEffect, useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Alerta from '../components/common/Alerta';
import { useNavigate } from 'react-router-dom';

import { useEventos } from '../hooks/useEventos';
import { useAtracoesMock } from '../hooks/useAtracoesMock';
import { useAvaliacaoSubmissao } from '../hooks/useAvaliacaoSubmissao';

const statusBadgeVariant = {
    EM_AVALIACAO: 'warning',
    APROVADO: 'success',
    REPROVADO: 'danger',
    APROVADO_COM_RESSALVAS: 'info',
};

const statusLabels = {
    EM_AVALIACAO: 'Em Avaliação',
    APROVADO: 'Aprovado',
    REPROVADO: 'Reprovado',
    APROVADO_COM_RESSALVAS: 'Aprovado com Ressalvas',
};

export default function AvaliarSubmissao({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();
    const { eventos } = useEventos();
    const { atracoes } = useAtracoesMock();
    const {
        handleCriarAvaliacao,
        carregarAvaliacoesPorSubmissao,
        avaliacoes,
        loading,
        message,
    } = useAvaliacaoSubmissao();

    const [selectedEventoId, setSelectedEventoId] = useState('');
    const [selectedAtracaoId, setSelectedAtracaoId] = useState('');
    const [avaliacaoForm, setAvaliacaoForm] = useState({
        nota: '',
        status_aprovacao: 'EM_AVALIACAO',
        comentarios: '',
    });

    const atracoesPorEvento = atracoes.filter(
        (a) => String(a.evento) === String(selectedEventoId)
    );
    const atracaoSelecionada = selectedAtracaoId
        ? atracoesPorEvento.find(
              (a) => String(a.id) === String(selectedAtracaoId)
          )
        : null;
    const eventoSelecionado = eventos.find(
        (ev) => String(ev.id) === String(selectedEventoId)
    );

    const handleChangeForm = (campo, valor) => {
        setAvaliacaoForm((prev) => ({
            ...prev,
            [campo]: valor,
        }));
    };

    const handleSubmitAvaliacao = async (event) => {
        event?.preventDefault();

        if (loading) {
            return;
        }

        const dadosAvaliacao = {
            submissao: parseInt(selectedAtracaoId),
            nota: parseFloat(avaliacaoForm.nota),
            status_aprovacao: avaliacaoForm.status_aprovacao,
            comentarios: avaliacaoForm.comentarios,
        };

        console.log('Enviando dados:', dadosAvaliacao);

        await handleCriarAvaliacao(dadosAvaliacao);
        setAvaliacaoForm({
            nota: '',
            status_aprovacao: 'EM_AVALIACAO',
            comentarios: '',
        });
        setSelectedAtracaoId('');
    };

    useEffect(() => {
        if (selectedAtracaoId) {
            carregarAvaliacoesPorSubmissao(selectedAtracaoId);
        }
    }, [selectedAtracaoId, carregarAvaliacoesPorSubmissao]);

    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container fluid className="px-5">
                    <Row>
                        <Col className="text-center my-5">
                            <h1 className="fw-bold text-success">
                                Avaliar Submissões de Trabalhos
                            </h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={10} className="mx-auto">
                            {/* SELEÇÃO */}
                            <Card className="mb-4">
                                <Card.Header className="bg-success text-white">
                                    <Card.Title className="mb-0">
                                        Selecione uma Submissão
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmitAvaliacao}>
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Label className="fw-bold">
                                                    Evento
                                                </Form.Label>
                                                <Form.Select
                                                    value={selectedEventoId}
                                                    onChange={(e) => {
                                                        setSelectedEventoId(e.target.value);
                                                        setSelectedAtracaoId('');
                                                    }}
                                                >
                                                    <option value="">
                                                        Selecione um evento
                                                    </option>
                                                    {eventos.map((ev) => (
                                                        <option key={ev.id} value={ev.id}>
                                                            {ev.nome}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>

                                            <Col md={6} className="mb-3">
                                                <Form.Label className="fw-bold">
                                                    Atracao/Trabalho
                                                </Form.Label>
                                                <Form.Select
                                                    value={selectedAtracaoId}
                                                    onChange={(e) =>
                                                        setSelectedAtracaoId(
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={!selectedEventoId}
                                                >
                                                    <option value="">
                                                        {!selectedEventoId
                                                            ? 'Selecione um evento'
                                                            : 'Selecione uma atracao'}
                                                    </option>
                                                    {atracoesPorEvento.map((atr) => (
                                                        <option key={atr.id} value={atr.id}>
                                                            {atr.titulo}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>

                            {/* DADOS DA ATRACAO */}
                            {atracaoSelecionada && (
                                <Card className="mb-4">
                                    <Card.Header className="bg-info text-white">
                                        <Card.Title className="mb-0">
                                            {atracaoSelecionada.titulo}
                                        </Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="mb-3">
                                            <Col md={6} className="mb-3">
                                                <strong>ID:</strong>
                                                <p className="mb-0 text-muted">
                                                    {atracaoSelecionada.id}
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <strong>Evento:</strong>
                                                <p className="mb-0 text-muted">
                                                    {eventoSelecionado?.nome || '-'}
                                                </p>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={6} className="mb-3">
                                                <strong>Modalidade:</strong>
                                                <p className="mb-0 text-muted">
                                                    {atracaoSelecionada.modalidade || '-'}
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <strong>Status:</strong>
                                                <p className="mb-0 text-muted">
                                                    {atracaoSelecionada.status || '-'}
                                                </p>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={6} className="mb-3">
                                                <strong>Área de Conhecimento:</strong>
                                                <p className="mb-0 text-muted">
                                                    {atracaoSelecionada.areaConhecimento ||
                                                        atracaoSelecionada.area_conhecimento ||
                                                        '-'}
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <strong>Nível de Ensino:</strong>
                                                <p className="mb-0 text-muted">
                                                    {atracaoSelecionada.nivelEnsino ||
                                                        atracaoSelecionada.nivel_ensino ||
                                                        '-'}
                                                </p>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col className="mb-3">
                                                <strong>Resumo:</strong>
                                                <p className="mb-0 text-muted">
                                                    {atracaoSelecionada.resumo || '-'}
                                                </p>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* FORMULÁRIO DE AVALIAÇÃO */}
                            {atracaoSelecionada && (
                                <Card className="mb-4 border-warning">
                                    <Card.Header className="bg-warning">
                                        <Card.Title className="mb-0">
                                            Registrar Avaliação
                                        </Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form>
                                            <Row>
                                                <Col md={4} className="mb-3">
                                                    <Form.Label className="fw-bold">
                                                        Nota (0.0 - 10.0) *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        placeholder="0"
                                                        value={avaliacaoForm.nota}
                                                        onChange={(e) =>
                                                            handleChangeForm(
                                                                'nota',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </Col>

                                                <Col md={8} className="mb-3">
                                                    <Form.Label className="fw-bold">
                                                        Status *
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={
                                                            avaliacaoForm.status_aprovacao
                                                        }
                                                        onChange={(e) =>
                                                            handleChangeForm(
                                                                'status_aprovacao',
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="EM_AVALIACAO">
                                                            Em Avaliação
                                                        </option>
                                                        <option value="APROVADO">
                                                            Aprovado
                                                        </option>
                                                        <option value="REPROVADO">
                                                            Reprovado
                                                        </option>
                                                        <option value="APROVADO_COM_RESSALVAS">
                                                            Aprovado com Ressalvas
                                                        </option>
                                                    </Form.Select>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">
                                                    Comentários
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Deixe suas observações..."
                                                    value={avaliacaoForm.comentarios}
                                                    onChange={(e) =>
                                                        handleChangeForm(
                                                            'comentarios',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Form.Group>

                                            <div className="d-flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="success"
                                                    className="fw-bold"
                                                    onClick={handleSubmitAvaliacao}
                                                    disabled={
                                                        loading ||
                                                        !avaliacaoForm.nota ||
                                                        !selectedAtracaoId
                                                    }
                                                >
                                                    {loading
                                                        ? 'Salvando...'
                                                        : 'Enviar Avaliação'}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="fw-bold"
                                                    onClick={() => navigate(-1)}
                                                >
                                                    Voltar
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* HISTÓRICO DE AVALIAÇÕES */}
                            {avaliacoes.length > 0 && (
                                <Card>
                                    <Card.Header className="bg-secondary text-white">
                                        <Card.Title className="mb-0">
                                            Avaliações Registradas
                                        </Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="table-responsive">
                                            <Table striped bordered hover>
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Nota</th>
                                                        <th>Status</th>
                                                        <th>Data/Hora</th>
                                                        <th>Comentários</th>
                                                        <th>Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {avaliacoes.map((av) => (
                                                        <tr key={av.id}>
                                                            <td className="fw-bold">
                                                                {av.nota}
                                                            </td>
                                                            <td>
                                                                <Badge
                                                                    bg={
                                                                        statusBadgeVariant[
                                                                            av.status_aprovacao
                                                                        ]
                                                                    }
                                                                >
                                                                    {
                                                                        statusLabels[
                                                                            av.status_aprovacao
                                                                        ]
                                                                    }
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {av.data_avaliacao
                                                                    ? new Date(
                                                                          av.data_avaliacao
                                                                      ).toLocaleString(
                                                                          'pt-BR'
                                                                      )
                                                                    : '-'}
                                                            </td>
                                                            <td>{av.comentarios}</td>
                                                            <td>
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    disabled
                                                                >
                                                                    Editar
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Container>
            </main>

            {message && (
                <Alerta
                    mensagem={message.text}
                    variacao={message.type}
                    duracao={5000}
                />
            )}

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus={campus}
            />
        </>
    );
}
