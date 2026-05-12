import { Container, Row, Col, Button } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { FaPenNib } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';
import { BsEyeFill } from 'react-icons/bs';
import Tabela from '../components/common/Tabela';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Tag from '../components/common/Tag';

export default function AvaliacoesAtracoes({}) {
    const personalizarInformacoes = (d) => (
        <>
            <Row className="p-0 m-0">
                <Col className="p-0 m-0 fw-bold">{d?.titulo}</Col>
            </Row>
            <Row className="p-0 m-0">
                <Col className="p-0 m-0">
                    ID #{d?.id} | {d?.nivel}
                </Col>
                <Col className="p-0 m-0">
                    <Link className="text-decoration-none d-flex align-items-center">
                        <BsEyeFill />
                        <span className="ms-2">Ler resumo completo</span>
                    </Link>
                </Col>
            </Row>
        </>
    );

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className=" py-4 ">
                <Container
                    fluid
                    className="d-md-flex flex-md-column align-items-md-center gap-3"
                >
                    <Row>
                        <Col>
                            <h1
                                className="fw-bold mt-3 text-center"
                                style={{ color: '#059547' }}
                            >
                                Avaliações
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-md-flex gap-5">
                            <Card corBorda="#003366" largura={400} altura={110}>
                                <Container className="d-flex justify-content-evenly mt-3">
                                    <Row className="d-md-flex flex-md-column">
                                        <Col>
                                            <span>PARA AVALIAR</span>
                                        </Col>
                                        <Col>
                                            <span className="fw-bold fs-1">
                                                0
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="d-flex align-items-center">
                                            <FaPenNib
                                                size={45}
                                                color="#003366"
                                            />
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                            <Card corBorda="#059547" largura={400} altura={110}>
                                <Container className="d-flex justify-content-evenly mt-3">
                                    <Row className="d-md-flex flex-md-column">
                                        <Col>
                                            <span className="">
                                                AVALIAÇÕES CONCLUÍDAS
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="fw-bold fs-1">
                                                0
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="">
                                        <Col className="d-flex align-items-center">
                                            <MdCheckCircle
                                                size={50}
                                                color="#059547"
                                            />
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="w-75 mt-4 ps-4">
                        <Col>
                            <span className="text-start fw-bold fs-4">
                                Minhas Avaliações
                            </span>
                        </Col>
                    </Row>
                    <Row className="w-75 px-4">
                        <Col>
                            <Tabela
                                className="rounded-4 "
                                cabecarioCor={'#E9ECEF'}
                                style={{
                                    overflow: 'hidden',
                                }}
                                cabecarios={[
                                    'Título do Trabalho',
                                    'Prazo',
                                    'Status',
                                    'Ação',
                                ]}
                                dados={[
                                    [
                                        {
                                            value: personalizarInformacoes({
                                                titulo: 'Impacto da robotica educacional',
                                                id: '123',
                                                nivel: 'Superior',
                                            }),
                                            style: { width: '35%' },
                                        },
                                        {
                                            value: (
                                                <span className="text-danger fw-bold">
                                                    2 dias restantes
                                                </span>
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                        {
                                            value: (
                                                <Tag
                                                    corFundo={'#444'}
                                                    corTexto={'#fff'}
                                                    texto={'Não iniciado'}
                                                />
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                        <button className="btn btn-primary">
                                            Acao
                                        </button>,
                                    ],
                                ]}
                            />
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
