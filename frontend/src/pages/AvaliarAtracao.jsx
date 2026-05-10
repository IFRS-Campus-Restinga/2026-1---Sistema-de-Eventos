import { Container, Row, Col, Button } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { useState } from 'react';
import Tag from '../components/common/Tag';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

export default function AvaliarAtracao({}) {
    const navigate = useNavigate();

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className=" py-4 px-3 ">
                <Container className="px-5 py-4  d-flex flex-column gap-3 shadow rounded-4 gap-3">
                    <Row>
                        <Col className="px-0">
                            <h1>Titulo</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="px-0">
                            <Tag
                                corTexto="#fff"
                                corFundo="#000"
                                texto="Nivel Superior"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col
                            className="rounded-2 fw-semibold  p-3"
                            style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                            }}
                        >
                            Atribua notas de 0 a 10 utilizando ponto para
                            decimais (ex: 8.5)
                        </Col>
                    </Row>
                    {/* Cards */}
                    <Row className="p-3 rounded-4 avaliar-criterio-card">
                        <Col className="d-md-flex justify-content-between ">
                            <Row className="d-flex flex-column gap-3">
                                <Col>
                                    <span className="fw-bold fs-4">
                                        1. Relevancia e pertinenca do tema
                                    </span>
                                </Col>
                                <Col>
                                    <span>
                                        O tema é atual e relevante para a área
                                        do conhecimento?
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <input
                                        max={10}
                                        min={0}
                                        type="number"
                                        className="score-input fs-4 fw-bold w-100 mt-3 mt-md-0"
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="d-flex flex-column gap-2">
                        <Col className="px-0">
                            <label htmlFor="parecer" className="fw-bold fs-5">
                                Parecer Descritivo
                            </label>
                        </Col>
                        <Col className="w-100 px-0">
                            <textarea
                                name="parecer"
                                id="parecer"
                                placeholder="Escreva seus comentários sobre o trabalho..."
                                rows={5}
                                className="avaliar-criterio-card w-100 px-3"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex justify-content-start px-0 fw-semibold">
                            <div
                                className="p-2 rounded-3"
                                style={{
                                    background: '#fffbeb',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                }}
                            >
                                <Form.Switch
                                    label="Indicar trabalho como destaque?"
                                    reverse
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row className="d-flex flex-column justify-content-center text-center">
                        <Col>NOTA FINAL CALCULADA</Col>
                        <Col className="fw-bold fs-1 text-primary">8.7</Col>
                    </Row>
                    <Row className="d-flex flex-md-row flex-column gap-3">
                        <Col>
                            <Button variant="primary" className="w-100 py-3">
                                Finalizar Avaliação
                            </Button>
                        </Col>
                        <Col className="">
                            <Button
                                onClick={() => navigate(`/dashboard`)}
                                variant="secondary"
                                className="d-flex text-center justify-content-center align-items-center gap-2 px-4 py-3 w-100"
                            >
                                <MdArrowBack /> Voltar
                            </Button>
                        </Col>
                    </Row>
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
