import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthButton from '../common/AuthButton';
import IFLogo from '../common/IFLogo';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { BsBell } from 'react-icons/bs';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getSelectedEventoId,
    obterEventosRecentesAdmin,
} from '../../utils/selectedEvento';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { buscarEventoPorId } from '../../services/eventoService';

function ItensGestaoRecentes({ navigate }) {
    const [itens, setItens] = useState([]);

    useEffect(() => {
        async function carregar() {
            const ids = obterEventosRecentesAdmin() || [];
            if (!ids.length) {
                setItens([]);
                return;
            }

            const promessas = ids.map(async (id) => {
                try {
                    const data = await buscarEventoPorId(id);
                    return {
                        id: String(id),
                        nome: data?.nome || `Evento ${id}`,
                    };
                } catch (e) {
                    return { id: String(id), nome: `Evento ${id}` };
                }
            });

            const resultados = await Promise.all(promessas);
            setItens(resultados);
        }

        carregar();
    }, []);

    return (
        <>
            {itens.length && (
                <>
                    <li>
                        <h6 className="dropdown-header">Eventos recentes</h6>
                    </li>
                    {itens.map((evento) => (
                        <li key={evento.id} className="dropdown-submenu">
                            <a
                                className="dropdown-item dropdown-toggle"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/dashboard/${evento.id}`);
                                }}
                            >
                                {evento.nome}
                            </a>

                            <ul className="dropdown-menu">
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(`/dashboard/${evento.id}`);
                                        }}
                                    >
                                        Abrir painel
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(
                                                `/editar_evento/${evento.id}`,
                                            );
                                        }}
                                    >
                                        Editar evento
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(
                                                `/dashboard/${evento.id}/sessao_atribuir_data`,
                                            );
                                        }}
                                    >
                                        Programação
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(
                                                `/atribuir_coordenador?eventoId=${evento.id}`,
                                            );
                                        }}
                                    >
                                        Coordenadores
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(
                                                `/atribuir_organizador?eventoId=${evento.id}`,
                                            );
                                        }}
                                    >
                                        Organizadores
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(
                                                `/dashboard/${evento.id}/enviaremails`,
                                            );
                                        }}
                                    >
                                        Enviar emails
                                    </a>
                                </li>
                            </ul>
                        </li>
                    ))}
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                </>
            )}
            <li>
                <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/listar_eventos');
                    }}
                >
                    Todos os eventos
                </a>
            </li>
        </>
    );
}

export default function NavBar() {
    const expand = 'xl';
    const navigate = useNavigate();

    return (
        <Navbar
            key={expand}
            expand={expand}
            className="bg-body-tertiary p-0"
            style={{
                backgroundImage:
                    'linear-gradient(to right,#17882c 0,#00510f 100%)',
            }}
        >
            <Container
                fluid
                style={{
                    backgroundImage:
                        'linear-gradient(to right,#17882c 0,#00510f 100%)',
                }}
                className="py-2 position-relative"
            >
                <Navbar.Brand href="#" className="ps-5">
                    <IFLogo
                        escalaTitulo={12}
                        escalaTexto={10}
                        estado="Rio Grande do Sul"
                        campus="Campus Restinga"
                        corRect="#fff"
                        corTexto="#fff"
                    />
                </Navbar.Brand>
                <Navbar.Toggle
                    aria-controls={`offcanvasNavbar-expand-${expand}`}
                />
                <Navbar.Offcanvas
                    style={{ backgroundColor: '#00A44B' }}
                    id={`offcanvasNavbar-expand-${expand}`}
                    aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                    placement="end"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title
                            id={`offcanvasNavbarLabel-expand-${expand}`}
                            className="text-white fw-bold"
                        >
                            Menu
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="justify-content-center flex-grow-1 pe-3 gap-5 ">
                            <Nav.Link
                                as={Link}
                                to="/"
                                className="text-white fw-bold"
                            >
                                Home
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/meus_eventos"
                                className="text-white fw-bold"
                            >
                                Meus Eventos
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/meus_eventos_avaliador"
                                className="text-white fw-bold"
                            >
                                Avaliações
                            </Nav.Link>
                            <NavDropdown
                                title={
                                    <span className="text-white fw-bold">
                                        Gestão
                                    </span>
                                }
                                id="nav-dropdown-gestao"
                                align="end"
                                className="nav-gestao-dropdown"
                            >
                                <ItensGestaoRecentes navigate={navigate} />
                            </NavDropdown>

                            <div className="d-flex d-xl-none">
                                <div className="pe-3 d-flex fw-bold">
                                    <AuthButton />
                                </div>
                            </div>
                            <div className="d-flex d-xl-none">
                                <div className="pe-3 d-flex flex-column justify-content-center fw-bold"></div>
                            </div>

                            <div className="d-none d-xl-flex position-absolute end-0 top-50 translate-middle-y pe-5">
                                <div className="me-3 d-flex fw-bold align-items-center">
                                    <AuthButton />
                                </div>
                            </div>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
}
