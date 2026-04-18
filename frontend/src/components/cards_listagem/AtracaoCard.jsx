import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from '../common/Card';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Tag from '../common/Tag';
import { RiTeamFill } from 'react-icons/ri';
import { TbMapPinFilled } from 'react-icons/tb';

export default function AtracaoCard({
    corCard = '#016B3F',
    hora = '',
    sessao = '',
    titulo = '',
    tags = [],
    autores = [],
    local = '',
    inscrito = false,
    onInscrever,
    onVerResumo,
}) {
    return (
        <Card corBorda={corCard}>
            <Container fluid>
                {/* Esse componente está dividido em 3 colunas (Cols) */}
                {/* A primeira contém o horario e sessão */}
                {/* A segunda contém tags, título, autores e local */}
                {/* A terceira contém os botões */}
                <Row>
                    {/* 1 coluna hora e sessão */}
                    <Col
                        className="ms-4 mt-5 d-flex flex-column align-items-center justify-content-center p-0"
                        xs={2}
                    >
                        <span className="fw-bold fs-3">{hora}</span>
                        {sessao && (
                            <span className="fw-bold fs-4">{sessao}</span>
                        )}
                    </Col>
                    {/* 2 coluna tags título autores local */}
                    <Col xs={6}>
                        <Row>
                            <Col className="mt-4 d-flex gap-3">
                                {tags.map((tag, i) => (
                                    <Tag key={i} {...tag} />
                                ))}
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p
                                    className="fw-semibold mt-2 fs-5 mb-0"
                                    style={{ color: '#003366' }}
                                >
                                    {titulo}
                                </p>
                                <p className="d-flex align-items-end text-secondary">
                                    <RiTeamFill
                                        size={25}
                                        className="me-2 text-black"
                                    />
                                    Autores: {autores.join(', ')}
                                </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div
                                    className="p-2 d-flex rounded-2"
                                    style={{
                                        background: '#E9ECEF',
                                        width: '230px',
                                    }}
                                >
                                    <TbMapPinFilled
                                        size={20}
                                        className="ms-2"
                                    />
                                    <span className="ms-2 fw-semibold">
                                        {local}
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    {/* 3 coluna botões */}
                    <Col className="d-flex flex-column justify-content-center gap-4">
                        <Row>
                            <Col className="text-center">
                                <Button
                                    variant="outline-secondary"
                                    className="rounded-5"
                                    style={{ width: '120px' }}
                                    onClick={onVerResumo}
                                >
                                    Ver Resumo
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center">
                                {inscrito ? (
                                    <Button
                                        variant="outline-secondary"
                                        className="rounded-5"
                                        style={{ width: '120px' }}
                                    >
                                        Inscrito
                                    </Button>
                                ) : (
                                    <Button
                                        className="rounded-5"
                                        onClick={onInscrever}
                                        style={{
                                            width: '120px',
                                            background: '#2F9E41',
                                            border: 'none',
                                        }}
                                    >
                                        Inscrever
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}
