import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';

import { MdArrowBack, MdSave, MdPublish } from 'react-icons/md';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import Alerta from '../components/common/Alerta';

export default function SessaoBoard({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();

    // MOCK DE DADOS
    const [dataSelecionada, setDataSelecionada] = useState('2025-11-25');

    const salasMock = [
        {
            id: 1,
            nome: 'Sala 101 (Projetor)',
            tipo: 'Palestras',
            eventos: [
                {
                    id: 1,
                    horario: '08:00 - 08:30',
                    titulo: 'Abertura da Sessão',
                    autor: 'Diretoria',
                },
                {
                    id: 2,
                    horario: '09:00 - 10:00',
                    titulo: 'Uso de Python na Bio',
                    autor: 'João Silva',
                },
            ],
        },
        {
            id: 2,
            nome: 'Sala 102 (Lab. Info)',
            tipo: 'Oficinas',
            eventos: [
                {
                    id: 3,
                    horario: '08:00 - 09:00',
                    titulo: 'Oficina de Blender',
                    autor: 'Julia Silva',
                    erro: true, // simula conflito
                },
            ],
        },
        {
            id: 3,
            nome: 'Ginásio',
            tipo: 'Pôster / Feira',
            eventos: [],
        },
    ];

    // MOCK DE ALERTAS
    const [message] = useState(null);
    const [error] = useState(null);

    return (
        <>
            <NavBar />

            <main className="flex-fill">
                <Container className="mx-auto">
                    {/* HEADER */}
                    <Row className="mx-auto my-4 align-items-center">
                        <Col md={4}>
                            <Form.Select
                                value={dataSelecionada}
                                onChange={(e) =>
                                    setDataSelecionada(e.target.value)
                                }
                            >
                                <option value="2025-11-25">
                                    Dia 25/11 (Manhã)
                                </option>
                                <option value="2025-11-26">Dia 26/11</option>
                            </Form.Select>
                        </Col>

                        <Col className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" className="fw-bold">
                                Definição automática
                            </Button>

                            <Button
                                variant="outline-secondary"
                                className="fw-bold"
                            >
                                <MdSave className="me-1" />
                                Salvar rascunho
                            </Button>

                            <Button variant="primary" className="fw-bold">
                                <MdPublish className="me-1" />
                                Publicar Agenda
                            </Button>
                        </Col>
                    </Row>

                    {/* KANBAN */}
                    <Row className="g-3">
                        {salasMock.map((sala) => (
                            <Col key={sala.id} md={4}>
                                <div className="p-2 border rounded bg-light h-100">
                                    {/* HEADER DA SALA */}
                                    <div
                                        className="p-2 rounded text-white mb-2"
                                        style={{ backgroundColor: '#198754' }}
                                    >
                                        <strong>{sala.nome}</strong>
                                        <br />
                                        <small>{sala.tipo}</small>
                                    </div>

                                    {/* EVENTOS */}
                                    {sala.eventos.map((evento) => (
                                        <Card
                                            key={evento.id}
                                            className="mb-2"
                                            style={{
                                                border: evento.erro
                                                    ? '1px solid red'
                                                    : '',
                                                backgroundColor: evento.erro
                                                    ? '#ffe6e6'
                                                    : '',
                                            }}
                                        >
                                            <div>
                                                <small className="text-muted">
                                                    {evento.horario}
                                                </small>
                                                <h6 className="mb-1">
                                                    {evento.titulo}
                                                </h6>
                                                <small>{evento.autor}</small>
                                            </div>
                                        </Card>
                                    ))}

                                    {/* ÁREA DE DROP */}
                                    <div
                                        className="mt-2 text-center"
                                        style={{
                                            border: '2px dashed #ccc',
                                            padding: '10px',
                                            borderRadius: '5px',
                                        }}
                                    >
                                        Arraste aqui
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    {/* BOTÃO VOLTAR */}
                    <Row className="my-4">
                        <Col className="d-flex justify-content-end">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="fw-bold"
                                onClick={() => navigate(-1)}
                            >
                                <MdArrowBack className="me-2" />
                                Voltar
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>

            {/* ALERTAS MOCK */}
            {message && (
                <Alerta mensagem={message} variacao="success" duracao={5000} />
            )}

            {error && (
                <Alerta mensagem={error} variacao="danger" duracao={5000} />
            )}
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
