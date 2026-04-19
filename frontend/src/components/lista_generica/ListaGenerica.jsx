import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MdBook, MdEdit, MdDelete, MdAddCircle } from 'react-icons/md';

export default function ListaGenerica({
    corBorda = '#00A44B',
    titulo = 'Itens cadastrados',
    itens = [],
    loading = false,
    error = null,
    rotaAdicionar = '/',
    rotaEditarBase = '/',
    onDeletar,
    textoAdicionar = 'Adicionar',
    paginacao = 3,
}) {
    const [page, setPage] = useState(0);
    const perPage = paginacao;
    const itensLength = (itens || []).length;
    const totalPages = Math.max(1, Math.ceil(itensLength / perPage));
    const pageData = (itens || []).slice(
        page * perPage,
        page * perPage + perPage,
    );

    useEffect(() => {
        const newTotal = Math.max(1, Math.ceil(itensLength / perPage));
        if (page > newTotal - 1) {
            const t = setTimeout(() => {
                setPage(Math.max(0, newTotal - 1));
            }, 0);
            return () => clearTimeout(t);
        }
        return undefined;
    }, [itensLength, perPage, page]);
    const navigate = useNavigate();

    return (
        <Card corBorda={corBorda} className="mb-4">
            <Container fluid className="mb-5">
                {/* linha título */}
                <Row className="d-flex flex-column px-5">
                    <Col className="d-flex  mt-5 align-items-center">
                        <MdBook color={corBorda} size={35} />
                        <h3
                            className="fw-bold ms-1 mb-0"
                            style={{ color: corBorda }}
                        >
                            {titulo}
                        </h3>
                    </Col>
                    <Col className="d-flex justify-content-center ">
                        <hr className="w-100" style={{ border: '1px solid' }} />
                    </Col>
                </Row>

                {loading && <p>Carregando {titulo.toLowerCase()}...</p>}

                {error && (
                    <p className="text-danger">
                        {typeof error === 'string'
                            ? error
                            : 'Erro ao carregar itens'}
                    </p>
                )}

                {/* Lista de itens */}
                <Row className="mb-3 px-5">
                    <Col>
                        <ListGroup variant="flush">
                            {pageData?.map((item, index) => (
                                <ListGroup.Item
                                    key={item.id}
                                    className="d-flex justify-content-between align-items-center mb-2 border rounded shadow-sm py-3"
                                    style={{ backgroundColor: '#fff' }}
                                >
                                    <div className="fs-5 text-muted">
                                        <span className="me-2">
                                            {page * perPage + index + 1}.
                                        </span>
                                        {item.nome}
                                    </div>
                                    <div className="d-flex gap-3">
                                        <MdEdit
                                            onClick={() =>
                                                navigate(
                                                    `${rotaEditarBase}/${item.id}`,
                                                )
                                            }
                                            size={22}
                                            className="text-secondary cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <MdDelete
                                            size={22}
                                            className="text-danger cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                if (onDeletar)
                                                    onDeletar(item.id);
                                                else
                                                    console.log(
                                                        'Deletar',
                                                        item.id,
                                                    );
                                            }}
                                        />
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>
                </Row>

                <Row className="px-5">
                    <Col>
                        <Button
                            as={Link}
                            to={rotaAdicionar}
                            variant="primary"
                            size="sm"
                            className="d-inline-flex align-items-center gap-1 mt-2 px-3 py-2 shadow-sm"
                        >
                            <MdAddCircle size={18} /> {textoAdicionar}
                        </Button>
                    </Col>
                </Row>

                {totalPages > 1 && (
                    <Row className="mt-3">
                        <Col className="d-flex justify-content-center align-items-center">
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
        </Card>
    );
}
