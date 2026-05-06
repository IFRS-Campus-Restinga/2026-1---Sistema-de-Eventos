import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    ListGroup,
    Dropdown,
    Table,
} from 'react-bootstrap';
import {
    MdEdit,
    MdDelete,
    MdArrowBack,
    MdBook,
    MdAddCircle,
} from 'react-icons/md';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import eArray from '../utils/eArray';
import useLocais from '../hooks/useLocais';
import useEspacos from '../hooks/useEspacos';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ModalPopup from '../components/common/ModalPopup';

export default function LocaisEspacosListar() {
    const { locais } = useLocais();
    const {
        espacos,
        idLocalSelecionado,
        setIdLocalSelecionado,
        loading,
        error,
        excluiEspaco,
    } = useEspacos();

    //const [idLocalSelecionado, setIdLocalSelecionado] = useState(null); //pega o idlocal selecionado no dropdown
    const [idEspaco, setIdEspaco] = useState(null); //pega o id do espaco selecionado para excluir
    const listaLocais = eArray(locais) ? locais : [];
    const localSelecionado = listaLocais.find(
        (local) => String(local.id) === String(idLocalSelecionado),
    ); //pega o objeto local selecionado a partir do id

    const navigate = useNavigate();
    const [mostrarModal, setMostrarModal] = useState(false); // mostra o modal de excluir

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
                            href="adicionar_local"
                            variant="primary"
                            className="d-flex align-items-center gap-1 shadow-sm"
                        >
                            <MdAddCircle size={20} /> Adicionar Local
                        </Button>
                    </div>
                    {loading && <p className="text-muted">Carregando...</p>}
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

                                <Table
                                    striped
                                    bordered
                                    hover
                                    responsive
                                    className="shadow-sm"
                                    style={{ backgroundColor: '#fff' }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    width: '60px',
                                                    color: '#016B3F',
                                                }}
                                            ></th>
                                            <th style={{ color: '#016B3F' }}>
                                                Nome do Espaço
                                            </th>
                                            <th style={{ color: '#016B3F' }}>
                                                Capacidade
                                            </th>
                                            <th style={{ color: '#016B3F' }}>
                                                Prédio / Bloco
                                            </th>
                                            <th
                                                style={{
                                                    width: '120px',
                                                    textAlign: 'center',
                                                    color: '#016B3F',
                                                }}
                                            >
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {espacos.map((espaco, index) => (
                                            <tr key={espaco.id}>
                                                <td>{index + 1}</td>

                                                <td className="text-muted fs-5">
                                                    {espaco.nome}
                                                </td>

                                                <td className="text-muted fs-5">
                                                    {espaco.capacidade}
                                                </td>

                                                <td className="text-muted fs-5">
                                                    {espaco.predio_bloco}
                                                </td>

                                                <td>
                                                    <div className="d-flex justify-content-center gap-3">
                                                        <MdEdit
                                                            size={22}
                                                            className="text-secondary"
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => {
                                                                navigate(
                                                                    `/editar_espaco/${espaco.id}`,
                                                                    {
                                                                        state: {
                                                                            localId:
                                                                                idLocalSelecionado,
                                                                        },
                                                                    },
                                                                );
                                                                console.log(
                                                                    'Editar',
                                                                    espaco.id,
                                                                );
                                                            }}
                                                        />

                                                        <MdDelete
                                                            size={22}
                                                            className="text-danger"
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => {
                                                                setIdEspaco(
                                                                    espaco.id,
                                                                );
                                                                setMostrarModal(
                                                                    true,
                                                                );
                                                                console.log(
                                                                    'Deletar',
                                                                    espaco.id,
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="d-flex align-items-center gap-1 mt-2 px-3 py-2 shadow-sm"
                                    onClick={() => {
                                        console.log(
                                            'Adicionar espaço ao local',
                                            localSelecionado.id,
                                        );
                                        navigate('/adicionar_espaco', {
                                            state: {
                                                localId: idLocalSelecionado,
                                            },
                                        });
                                    }}
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
            <ModalPopup
                show={mostrarModal}
                titulo="Aviso!"
                tituloSecundario="Excluir Espaço"
                onAcao={() => {
                    excluiEspaco(idEspaco);
                    setMostrarModal(false);
                }}
                onFechar={() => setMostrarModal(false)}
                textoAcao="Excluir"
            />

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
