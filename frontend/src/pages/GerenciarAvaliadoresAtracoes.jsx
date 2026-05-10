import { Container, Row, Col, Button, Placeholder } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { FaPenNib } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';
import Tabela from '../components/common/Tabela';
import { useState } from 'react';
import Tag from '../components/common/Tag';
import Filtro from '../components/common/Filtro';

function AvaliadorChip({ nome, onRemove }) {
    return (
        <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border shadow-sm"
            style={{ background: '#E9ECEF' }}
        >
            <span className="small fw-semibold ">{nome}</span>
            <button
                type="button"
                className="btn p-0 border-0 text-danger fw-bold lh-1"
                aria-label={`Remover ${nome}`}
                onClick={onRemove}
            >
                x
            </button>
        </div>
    );
}

export default function GerenciarAvaliacoesAtracoes({}) {
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
                            <h1 className="fw-bold">Painel do Organizador</h1>
                            <span>
                                Gerencie trabalhos submetidos e distribua
                                avaliadores
                            </span>
                        </Col>
                    </Row>
                    <Row className="w-75">
                        <Col>
                            <Filtro
                                filtros={[
                                    {
                                        id: 'area',
                                        tipo: 'select',
                                        placeholder: 'Todas as areas',
                                        opcoes: [
                                            'Engenharias',
                                            'Linguistica',
                                            'Artes',
                                        ],
                                    },
                                    {
                                        id: 'area',
                                        tipo: 'select',
                                        placeholder: 'Todas as areas',
                                        opcoes: [
                                            'Engenharias',
                                            'Linguistica',
                                            'Artes',
                                        ],
                                    },
                                    {
                                        id: 'busca',
                                        tipo: 'text',
                                        placeholder:
                                            'Buscar por titulo ou autor...',
                                        lg: 4,
                                    },
                                ]}
                            ></Filtro>
                        </Col>
                    </Row>
                    <Row className="w-75">
                        <Col>
                            <Tabela
                                className="rounded-4 "
                                style={{
                                    overflow: 'hidden',
                                }}
                                cabecarios={[
                                    'Status',
                                    'Trabalho/Autores',
                                    'Área',
                                    'Avaliadores',
                                    'Ações',
                                ]}
                                dados={[
                                    [
                                        {
                                            value: (
                                                <div
                                                    className="rounded-circle"
                                                    style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        backgroundColor: 'red',
                                                    }}
                                                ></div>
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                        {
                                            value: (
                                                <div className="d-flex flex-column">
                                                    <span>
                                                        Sistemas de irrigacao
                                                        automatizados com IoT
                                                    </span>
                                                    <span>
                                                        Joao Silva • Oriantador
                                                        x
                                                    </span>
                                                </div>
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                        {
                                            value: (
                                                <Tag
                                                    texto="Engenharias"
                                                    corFundo="blue"
                                                    corTexto="#fff"
                                                />
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                        {
                                            value: (
                                                <div className="d-flex flex-wrap gap-2 justify-content-start">
                                                    <AvaliadorChip nome="Jorge" />
                                                    <AvaliadorChip nome="Jorge" />
                                                </div>
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                        <div className="d-flex gap-3">
                                            <button className="btn btn-primary">
                                                Acao
                                            </button>
                                            <button className="btn btn-danger">
                                                Acao
                                            </button>
                                        </div>,
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
