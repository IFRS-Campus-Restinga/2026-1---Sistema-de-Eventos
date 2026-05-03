import React from 'react';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Card from '../common/Card';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';

export default function EventoCard({
    corCard = '#016B3F',
    titulo,
    data,
    faseAtual,
    corFase = '#106D47',
    descricao,
    statusInscricao = null,
    textoBotao1 = 'Ver Detalhes',
    textoBotao2 = 'Ver Detalhes',
    onClick1,
    onClick2,
    icon1,
    corBotao1 = '#00a44b',
    varianteBotao2 = 'outline-success',
    desabilitarBotao2 = false,
}) {
    const IconeBotao1 = icon1;

    return (
        <Card corBorda={corCard}>
            <Container fluid>
                <Row>
                    <Col>
                        <Row>
                            <Col className="d-flex d-md-flex flex-column ms-md-5 mt-5 align-items-center">
                                <div className="d-flex w-100  justify-content-md-start">
                                    <h3 className="fw-bold">{titulo}</h3>
                                </div>
                                <div className="w-100 my-1">
                                    {statusInscricao === 'CANCELADA' ? (
                                        <Badge
                                            bg="danger"
                                            className="align-self-start"
                                        >
                                            Inscrição cancelada
                                        </Badge>
                                    ) : null}
                                </div>
                                <div className="d-flex w-100  justify-content-md-start">
                                    <span className="ms-0 fw-bold">
                                        Realização: {data}
                                    </span>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col
                                xs={9}
                                className="d-flex align-items-center mt-md-2 "
                            >
                                <span className="fw-bold ms-md-5">
                                    Fase atual:{' '}
                                    <span
                                        className="fw-bold"
                                        style={{ color: corFase }}
                                    >
                                        {faseAtual}
                                    </span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex ms-md-5 m-0 mt-2">
                                <span className="fw-bold">Descrição:</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex ms-md-5 m-0 mt-2">
                                <span className="d-none d-md-flex fw-light text-break ">
                                    {descricao}
                                </span>
                                <span className="d-flex d-md-none fw-light text-break w-100">
                                    {descricao}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                    <Col className="d-none d-md-flex justify-content-end">
                        <Row className="d-flex flex-column gap-3 justify-content-center">
                            <Col
                                md={12}
                                className="d-none d-md-flex justify-content-end "
                            >
                                <Button
                                    variant="success"
                                    className="fw-bold rounded-5 px-3 py-2 me-lg-5"
                                    style={{
                                        background: corBotao1,
                                        border: corBotao1,
                                    }}
                                    onClick={onClick1}
                                >
                                    {icon1 ? <IconeBotao1 size={20} /> : null}
                                    {textoBotao1}
                                </Button>
                            </Col>
                            <Col
                                md={12}
                                className="d-none d-md-flex justify-content-end "
                            >
                                {textoBotao2 ? (
                                    <Button
                                        variant={varianteBotao2}
                                        className="fw-bold rounded-5 px-3 py-2 me-lg-5 w-100"
                                        onClick={onClick2}
                                        disabled={desabilitarBotao2}
                                    >
                                        {textoBotao2}
                                    </Button>
                                ) : null}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="d-md-none mt-3 ">
                    <Col className="d-flex flex-column gap-2 justify-content-center px-4 ">
                        <Button
                            variant="success"
                            className="fw-bold rounded-5 px-3 py-2"
                            style={{
                                background: '#00A44B',
                                border: '#00A44B',
                            }}
                            onClick={onClick1}
                        >
                            {IconeBotao1 ? <IconeBotao1 size={20} /> : null}
                            {textoBotao1}
                        </Button>
                        {textoBotao2 ? (
                            <Button
                                variant={varianteBotao2}
                                className="fw-bold rounded-5 px-3 py-2 me-lg-5 w-100"
                                onClick={onClick2}
                                disabled={desabilitarBotao2}
                            >
                                {textoBotao2}
                            </Button>
                        ) : null}
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}
