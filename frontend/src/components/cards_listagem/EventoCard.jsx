import React from 'react';
import Button from 'react-bootstrap/Button';
import { MdOutlineSearch } from 'react-icons/md';
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
    textoBotao = 'Ver Detalhes',
    onDetailsClick,
    Icon,
}) {
    return (
        <Card corBorda={corCard}>
            {/* Esse componente está dividido em 4 linhas (Rows) */}
            {/* A primeira contém a título e data de realização */}
            {/* A segunda contém a fase atual  e botão*/}
            {/* A terceira contém um label para Descrição */}
            {/* A quarta contém a descrição */}
            <Container fluid>
                {/* 1 linha título e data */}
                <Row>
                    <Col className="d-flex ms-5 mt-5 align-items-center">
                        <h3 className="fw-bold">{titulo}</h3>
                        <span className="ms-3 fw-bold">Realização: {data}</span>
                    </Col>
                </Row>
                {/* 2 linha fase atual*/}
                <Row>
                    <Col
                        xs={9}
                        className="d-flex ms-5  align-items-center mt-2"
                    >
                        <span className="fw-bold">
                            Fase atual:{' '}
                            <span
                                className="fw-bold"
                                style={{ color: corFase }}
                            >
                                {faseAtual}
                            </span>
                        </span>
                    </Col>
                    <Col className="d-flex justify-content-end me-5">
                        <Button
                            variant="success"
                            className="fw-bold rounded-5 px-3 py-2"
                            style={{
                                background: '#00A44B',
                                border: '#00A44B',
                            }}
                            onClick={onDetailsClick}
                        >
                            {Icon ? (
                                <Icon size={20} />
                            ) : (
                                <MdOutlineSearch size={20} />
                            )}
                            {textoBotao}
                        </Button>
                    </Col>
                </Row>
                {/* 3 linha Descrição */}
                <Row>
                    <Col className="d-flex ms-5  align-items-center mt-2">
                        <span className="fw-bold">Descrição:</span>
                    </Col>
                </Row>
                {/* 4 linha descrição */}
                <Row>
                    <Col className="d-flex ms-5  align-items-center mt-2">
                        <span className="fw-light text-break w-50">
                            {descricao}
                        </span>
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}
