import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ListGroup, Dropdown } from 'react-bootstrap';
import { MdEdit, MdDelete, MdArrowBack, MdLocationOn, MdBook, MdAddCircle } from 'react-icons/md';
import { Link } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { useLocais } from '../hooks/useLocais';
import Card from '../components/common/Card';

export default function LocaisListar() {
    const { locais } = useLocais();
    const [idLocalSelecionado, setIdLocalSelecionado] = useState(null);     //pega o idlocal selecionado no dropdown 
    const localSelecionado = locais.find(local => String(local.id) === String(idLocalSelecionado));        //pega o objeto local selecionado a partir do id

    const handleSelect = (id) => {
        console.log('ID selecionado, captura do handleSelect:', id); // Para você debugar no console
        setIdLocalSelecionado(id);
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>


                    <Card corBorda="#00A44B">
                        <Container fluid className="mb-5">
                            {/* linha título */}
                            <Row className="d-flex flex-column">
                                <Col className="d-flex ms-5 mt-5 align-items-center">
                                    <MdBook color="#00A44B" size={35} />
                                    <h3
                                        className="fw-bold ms-1 mb-0"
                                        style={{ color: "#00A44B" }}
                                    >
                                        Locais cadastrados
                                    </h3>
                                </Col>
                                <Col className="d-flex justify-content-center">
                                    <hr
                                        className=""
                                        style={{ border: '1px solid', width: '100%' }}
                                    />
                                </Col>
                            </Row>


                            {/* Lista de locais */}
                            <ListGroup variant="flush" className="mb-3">
                                {locais?.map((local, index) => (
                                    <ListGroup.Item
                                        key={local.id}
                                        className="d-flex justify-content-between align-items-center mb-2 border rounded shadow-sm py-3"
                                        style={{ backgroundColor: '#fff' }}
                                    >
                                        <div className="fs-5 text-muted">
                                            <span className="me-2">{index + 1}.</span>
                                            {local.nome}
                                        </div>
                                        <div className="d-flex gap-3">
                                            <MdEdit
                                                as={Link} // Faz o botão se comportar como um Link do Router
                                                to={`/editarLocal/${local.id}`} // Define a rota de destino
                                                size={22}
                                                className="text-secondary cursor-pointer"
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <MdDelete
                                                size={22}
                                                className="text-danger cursor-pointer"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => console.log("Deletar", local.id)}
                                            />
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <Button
                                as={Link} // Faz o botão se comportar como um Link do Router
                                to="/adicionarLocal" // Define a rota de destino
                                variant="primary"
                                size="sm"
                                className="d-flex align-items-center gap-1 mt-2 px-3 py-2 shadow-sm w-auto"

                            >
                                <MdAddCircle size={18} /> Adicionar Local
                            </Button>

                        </Container>
                    </Card>



                    {/* Botão Voltar Inferior */}                  {/*implementar rota para voltar*/}
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            as={Link} // Faz o botão se comportar como um Link do Router
                            to="/" // Define a rota de destino
                            variant="secondary"
                            className="d-flex align-items-center gap-2 px-4 py-2">
                            <MdArrowBack /> Voltar
                        </Button>
                    </div>
                </Container>
            </main>

            <Footer telefone="(51) 3333-1234" endereco="Rua Alberto Hoffmann, 285" ano={2026} campus="Campus Restinga" />
        </div >
    );
}