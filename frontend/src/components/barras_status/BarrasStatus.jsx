import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import ProgressBar from 'react-bootstrap/ProgressBar';

export default function BarrasStatus({
    titulo = 'Status',
    dados = [],
    paginacao = 3,
}) {
    const variacoes = [
        'success',
        'warning',
        'info',
        'danger',
        'primary',
        'secondary',
    ];

    const [page, setPage] = useState(0);
    const perPage = paginacao;
    const totalPages = Math.max(1, Math.ceil(dados.length / perPage));
    const pageData = dados.slice(page * perPage, page * perPage + perPage);

    return (
        <>
            <Container
                className="shadow rounded-3 px-4 py-4"
                style={{ minHeight: '440px' }}
            >
                <Row className="pb-4">
                    <Col>
                        <span className="fw-bold fs-5">{titulo}</span>
                    </Col>
                </Row>

                {dados.length === 0 ? (
                    <Row className="my-3">
                        <Col className="text-center text-muted">
                            Nenhum dado disponível.
                        </Col>
                    </Row>
                ) : (
                    pageData.map((d, i) => (
                        <Row className="my-3" key={page * perPage + i}>
                            <Col>
                                <Row>
                                    <Col className="fw-bold">{d?.titulo}</Col>
                                </Row>
                                <Row>
                                    <Col className="fw-lighter text-end mb-1">
                                        {d?.valorAtual}/{d?.total} {d?.textoFim}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <ProgressBar
                                            variant={
                                                variacoes[
                                                    (page * perPage + i) %
                                                        variacoes.length
                                                ]
                                            }
                                            now={d?.valorAtual}
                                            max={d?.total}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    ))
                )}

                {/* Páginação */}
                {totalPages > 1 && (
                    <Row className="mt-5">
                        <Col className="d-flex justify-content-center align-items-center pos">
                            <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() =>
                                    setPage((p) => Math.max(0, p - 1))
                                }
                                disabled={page === 0}
                            >
                                Anterior
                            </Button>

                            {[...Array(totalPages)].map((_, p) => (
                                <Button
                                    key={p}
                                    variant={
                                        p === page
                                            ? 'success'
                                            : 'outline-success'
                                    }
                                    size="sm"
                                    className="mx-1"
                                    onClick={() => setPage(p)}
                                >
                                    {p + 1}
                                </Button>
                            ))}
                            <Button
                                variant="success"
                                size="sm"
                                className="ms-2"
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(totalPages - 1, p + 1),
                                    )
                                }
                                disabled={page === totalPages - 1}
                            >
                                Próximo
                            </Button>
                        </Col>
                    </Row>
                )}
            </Container>
        </>
    );
}
