import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    ListGroup,
    Dropdown,
} from 'react-bootstrap';
import {
    MdEdit,
    MdDelete,
    MdArrowBack,
    MdLocationOn,
    MdBook,
    MdAddCircle,
} from 'react-icons/md';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import useLocais from '../hooks/useLocais';
import Card from '../components/common/Card';
import eArray from '../utils/eArray';

export default function LocaisEspacosListar() {
    const { locais } = useLocais();
    const [idLocalSelecionado, setIdLocalSelecionado] = useState(null); //pega o idlocal selecionado no dropdown
    const listaLocais = eArray(locais) ? locais : [];
    const localSelecionado = listaLocais.find(
        (local) => String(local.id) === String(idLocalSelecionado),
    ); //pega o objeto local selecionado a partir do id
    const espacosExemplo = ['sala 401', 'sala 402', 'sala 403', 'auditório']; // Exemplo de espaços, substituir pelos dados reais do local selecionado

    const handleSelect = (id) => {
        console.log('ID selecionado, captura do handleSelect:', id); // Para você debugar no console
        setIdLocalSelecionado(id);
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    {/* Cabeçalho superior com filtro e botão adicionar */}
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="light"
                                className="border shadow-sm"
                            >
                                {localSelecionado
                                    ? localSelecionado.nome
                                    : 'Selecionar Campus'}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {listaLocais.length > 0 ? (
                                    listaLocais.map((local) => (
                                        <Dropdown.Item
                                            key={`local-key-${local.id}`}
                                            onClick={() =>
                                                handleSelect(local.id)
                                            }
                                        >
                                            {local.nome}
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <Dropdown.Item key="empty" disabled>
                                        Nenhum local encontrado
                                    </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button
                            href="adicionarLocal"
                            variant="primary"
                            className="d-flex align-items-center gap-1 shadow-sm"
                        >
                            <MdAddCircle size={20} /> Adicionar Local
                        </Button>
                    </div>
                    {localSelecionado && (
                        <Card corBorda="#00A44B">
                            <Container fluid className="mb-5">
                                {/* 1 linha título */}
                                <Row className="d-flex flex-column">
                                    <Col className="d-flex ms-5 mt-5 align-items-center">
                                        <MdBook color="#00A44B" size={35} />
                                        <h3
                                            className="fw-bold ms-1 mb-0"
                                            style={{ color: '#00A44B' }}
                                        >
                                            Espaços do Campus
                                        </h3>
                                    </Col>
                                    <Col className="d-flex justify-content-center">
                                        <hr
                                            className=""
                                            style={{
                                                border: '1px solid',
                                                width: '100%',
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    {/* subtitulo: Nome do local */}
                                    <h2 className="text-center text-success fw-bold mb-4">
                                        {localSelecionado.nome}
                                    </h2>
                                </Row>
                                {/* EXCLUIR: Exemplo de lista de espaços */}
                                <ListGroup variant="flush" className="mb-3">
                                    {espacosExemplo.map((espaco, index) => (
                                        <ListGroup.Item
                                            key={espaco.id}
                                            className="d-flex justify-content-between align-items-center mb-2 border rounded shadow-sm py-3"
                                            style={{ backgroundColor: '#fff' }}
                                        >
                                            <div className="fs-5 text-muted">
                                                <span className="me-2">
                                                    {index + 1}.
                                                </span>
                                                {espaco}
                                            </div>
                                            <div className="d-flex gap-3">
                                                <MdEdit
                                                    size={22}
                                                    className="text-secondary cursor-pointer"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() =>
                                                        console.log(
                                                            'Editar',
                                                            espaco.id,
                                                        )
                                                    }
                                                />
                                                <MdDelete
                                                    size={22}
                                                    className="text-danger cursor-pointer"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() =>
                                                        console.log(
                                                            'Deletar',
                                                            espaco.id,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                                {/* Lista de Espaços */}{' '}
                                {/*Utilizar o atributo que armazena a relaçao com espacos*/}
                                <ListGroup variant="flush" className="mb-3">
                                    {localSelecionado.espacos?.map(
                                        (espaco, index) => (
                                            <ListGroup.Item
                                                key={espaco.id}
                                                className="d-flex justify-content-between align-items-center mb-2 border rounded shadow-sm py-3"
                                                style={{
                                                    backgroundColor: '#fff',
                                                }}
                                            >
                                                <div className="fs-5 text-muted">
                                                    <span className="me-2">
                                                        {index + 1}.
                                                    </span>
                                                    {espaco.nome}
                                                </div>
                                                <div className="d-flex gap-3">
                                                    <MdEdit
                                                        size={22}
                                                        className="text-secondary cursor-pointer"
                                                        style={{
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            console.log(
                                                                'Editar',
                                                                espaco.id,
                                                            )
                                                        }
                                                    />
                                                    <MdDelete
                                                        size={22}
                                                        className="text-danger cursor-pointer"
                                                        style={{
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            console.log(
                                                                'Deletar',
                                                                espaco.id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </ListGroup.Item>
                                        ),
                                    )}
                                </ListGroup>
                                {/* Botão Adicionar Espaço */}{' '}
                                {/*implementar rota para criar espaço*/}
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="d-flex align-items-center gap-1 mt-2 px-3 py-2 shadow-sm"
                                    onClick={() =>
                                        console.log(
                                            'Adicionar espaço ao local',
                                            localSelecionado.id,
                                        )
                                    }
                                >
                                    <MdAddCircle size={18} /> Adicionar Espaço
                                </Button>
                            </Container>
                        </Card>
                    )}
                    {/* Botão Voltar Inferior */}{' '}
                    {/*implementar rota para voltar*/}
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            href="/"
                            variant="secondary"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                        >
                            <MdArrowBack /> Voltar
                        </Button>
                    </div>
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
