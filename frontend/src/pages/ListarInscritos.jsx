import React from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { Container, Row, Col, Table, Badge, Button, Form, InputGroup, Card } from 'react-bootstrap';
import { MdSearch, MdDelete, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { BsPlusCircleFill } from 'react-icons/bs';

const inscritosEstaticos = [
    { id: 1, nome: 'Ana Clara Rodrigues', cpf: '123.456.789-00', email: 'ana.clara@email.com', tipo: 'Participante', status: 'Confirmado', dataInscricao: '10/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 2, nome: 'Bruno Silva Santos', cpf: '987.654.321-00', email: 'bruno.santos@email.com', tipo: 'Participante', status: 'Pendente', dataInscricao: '09/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 3, nome: 'Carlos Eduardo Oliveira', cpf: '456.123.789-00', email: 'carlos.oliveira@email.com', tipo: 'Avaliador', status: 'Confirmado', dataInscricao: '08/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 4, nome: 'Daniela Costa Lima', cpf: '789.123.456-00', email: 'daniela.costa@email.com', tipo: 'Participante', status: 'Confirmado', dataInscricao: '07/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 5, nome: 'Eduardo Ferreira Souza', cpf: '321.789.456-00', email: 'eduardo.souza@email.com', tipo: 'Organizador', status: 'Confirmado', dataInscricao: '05/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 6, nome: 'Fernanda Alves Pereira', cpf: '654.987.321-00', email: 'fernanda.alves@email.com', tipo: 'Participante', status: 'Confirmado', dataInscricao: '04/04/2026', evento: 'Feira de Ciencias 2026' },
];

export default function ListarInscritos() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="flex-fill bg-light py-4">
                <Container>
                    <Row className="mb-3 align-items-center">
                        <Col>
                            <h2 style={{ color: '#000000', fontWeight: 'bold', margin: 0 }}>
                                Lista de Inscritos
                            </h2>
                        </Col>
                        <Col xs="auto">
                            <Button 
                                variant="outline-secondary" 
                                className="d-flex align-items-center gap-2"
                                onClick={() => window.history.back()}
                            >
                                <MdChevronLeft /> Voltar
                            </Button>
                        </Col>
                    </Row>

                    <div className="mb-4 p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '12px' }}>
                        <div className="flex-fill me-4">
                            <InputGroup className="border rounded-3 overflow-hidden bg-white">
                                <InputGroup.Text className="bg-white border-0 pe-0 py-2 ps-3">
                                    <MdSearch size={22} color="#999" />
                                </InputGroup.Text>
                                <Form.Control 
                                    className="border-0 shadow-none ps-2 py-2"
                                    placeholder="Nome, CPF ou email..."
                                    style={{ fontSize: '0.95rem' }}
                                />
                            </InputGroup>
                        </div>
                        <div className="d-flex gap-3">
                            <Form.Select className="w-auto border fw-bold px-3 pe-5 py-2 ms-2 shadow-none" style={{ backgroundColor: '#fff', color: '#555', fontSize: '0.9rem', borderRadius: '8px' }}>
                                <option>Filtrar por Perfil</option>
                            </Form.Select>
                            <Form.Select className="w-auto border fw-bold px-3 pe-5 py-2 shadow-none" style={{ backgroundColor: '#fff', color: '#555', fontSize: '0.9rem', borderRadius: '8px' }}>
                                <option>Filtrar por Atração</option>
                            </Form.Select>
                        </div>
                    </div>

                    <div className="mb-4" style={{ borderRadius: '18px 18px 0 0', overflow: 'hidden' }}>
                        <Table responsive hover borderless className="mb-0 align-middle shadow-sm" style={{ backgroundColor: 'transparent' }}>
                            <thead style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                                <tr>
                                    <th className="py-3 px-4 fw-bold text-muted small" style={{ letterSpacing: '0.05em' }}>USUÁRIO</th>
                                    <th className="py-3 px-3 fw-bold text-muted small" style={{ letterSpacing: '0.05em' }}>Nº DE INSCRIÇÃO</th>
                                    <th className="py-3 px-3 fw-bold text-muted small" style={{ letterSpacing: '0.05em' }}>EMAIL</th>
                                    <th className="py-3 px-3 fw-bold text-muted small" style={{ letterSpacing: '0.05em' }}>ATRAÇÃO</th>
                                    <th className="py-3 px-3 fw-bold text-muted small" style={{ letterSpacing: '0.05em' }}>PERFIS NO EVENTO</th>
                                    <th className="py-3 px-4 fw-bold text-muted small text-center" style={{ letterSpacing: '0.05em' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscritosEstaticos.map((inscrito) => (
                                    <tr key={inscrito.id} style={{ borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
                                        <td className="px-4 py-3 text-dark fw-medium" style={{ fontSize: '0.95rem' }}>{inscrito.nome}</td>
                                        <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.9rem' }}>{inscrito.cpf.replace(/[^0-9]/g, '')}</td>
                                        <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.9rem' }}>{inscrito.email}</td>
                                        <td className="px-3 py-3 text-dark fw-bold" style={{ fontSize: '0.95rem' }}>Introdução a Analise de Dados</td>
                                        <td className="px-3 py-3">
                                            {(() => {
                                                const colors = {
                                                    'Organizador': '#38A149',
                                                    'Avaliador': '#FFC107',
                                                    'Participante': '#66D2ED'
                                                };
                                                return (
                                                    <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: colors[inscrito.tipo] || '#6c757d', color: 'white', fontSize: '0.8rem' }}>
                                                        {inscrito.tipo}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button 
                                                variant="light" 
                                                className="p-1 border-0" 
                                                style={{ color: 'white', backgroundColor: '#e24c4c', borderRadius: '4px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <MdDelete size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
                        <Button variant="link" className="text-decoration-none d-flex align-items-center gap-1 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>
                            <MdChevronLeft size={20} /> Anterior
                        </Button>
                        <div className="d-flex gap-2">
                            {[1, 2, 3].map(page => (
                                <Button 
                                    key={page}
                                    variant="link" 
                                    className={`text-decoration-none d-flex align-items-center justify-content-center fw-bold ${page === 1 ? 'text-white' : 'text-dark'}`}
                                    style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        borderRadius: '50%',
                                        backgroundColor: page === 1 ? '#38A149' : 'transparent',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {page}
                                </Button>
                            ))}
                            <span className="align-self-end mb-1">...</span>
                        </div>
                        <Button variant="link" className="text-decoration-none d-flex align-items-center gap-1 text-dark fw-bold" style={{ fontSize: '0.9rem' }}>
                            Próxima <MdChevronRight size={20} />
                        </Button>
                    </div>

                    <Row className="mt-4">
                        <Col>
                            <div className="d-flex gap-4" style={{ fontSize: '13px' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#198754' }}></div>
                                    <span className="text-muted fw-bold">Confirmados: 8</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffc107' }}></div>
                                    <span className="text-muted fw-bold">Pendentes: 2</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#dc3545' }}></div>
                                    <span className="text-muted fw-bold">Cancelados: 0</span>
                                </div>
                            </div>
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