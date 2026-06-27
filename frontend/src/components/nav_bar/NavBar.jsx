import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthButton from '../common/AuthButton';
import IFLogo from '../common/IFLogo';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { BsBell } from 'react-icons/bs';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obterEventosRecentesAdmin } from '../../utils/selectedEvento';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {
    buscarEventoPorId,
    listarMeusEventosCoordenador,
} from '../../services/eventoService';
import { checkSession } from '../../services/authService';
import { listarMeusEventosAvaliador } from '../../services/meusAvaliacoesService';

const ADMIN_GROUPS = ['Administrador', 'Coordenador'];

function ItensGestaoRecentes({ navigate, admin, coord, permitidoIds = [] }) {
    const [itens, setItens] = useState([]);

    useEffect(() => {
        async function carregar() {
            const ids = (obterEventosRecentesAdmin() || []).filter((id) => {
                const idString = String(id);
                if (admin) {
                    return true;
                }
                return !permitidoIds.length || permitidoIds.includes(idString);
            });

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
                } catch {
                    return { id: String(id), nome: `Evento ${id}` };
                }
            });

            const resultados = await Promise.all(promessas);
            setItens(resultados);
        }

        carregar();
    }, [permitidoIds]);

    return (
        <>
            {itens.length > 0 && (
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
                                {(admin || coord) && (
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
                                )}
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
                                {admin && (
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
                                )}
                                {(admin || coord) && (
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
                                )}
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(
                                                `/dashboard/${evento.id}/enviar_emails`,
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

function ItensAvaliacoesRecentes({ navigate, eventos }) {
    const eventosRecentes = Array.isArray(eventos) ? eventos.slice(0, 3) : [];

    return (
        <>
            {eventosRecentes.length > 0 && (
                <>
                    <li>
                        <h6 className="dropdown-header">Eventos recentes</h6>
                    </li>
                    {eventosRecentes.map((evento) => (
                        <li key={evento.id} className="dropdown-submenu">
                            <a
                                className="dropdown-item dropdown-toggle"
                                href="#"
                                onClick={(e) => e.preventDefault()}
                            >
                                {evento.nome}
                            </a>

                            <ul className="dropdown-menu">
                                {/* CORREÇÃO: Lê cirurgicamente os booleanos calculados pelo ORM do Django */}
                                {evento.pode_avaliar_submissoes && (
                                    <li>
                                        <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(
                                                    `/minhas_avaliacoes_submissoes?evento_id=${evento.id}`,
                                                );
                                            }}
                                        >
                                            Avaliação de Submissões
                                        </a>
                                    </li>
                                )}
                                {evento.pode_avaliar_atracoes && (
                                    <li>
                                        <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(
                                                    `/minhas_avaliacoes?evento_id=${evento.id}`,
                                                );
                                            }}
                                        >
                                            Avaliação de Atrações
                                        </a>
                                    </li>
                                )}
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
                        navigate('/meus_eventos_avaliador');
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
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [Coord, setCoord] = useState(false);
    const [Gestao, setGestao] = useState(false);
    const [eventosAvaliador, setEventosAvaliador] = useState([]);
    const [eventosPermitidosGestao, setEventosPermitidosGestao] = useState([]);

    async function carregarSessao(isMounted = true) {
        try {
            const result = await checkSession();
            if (!isMounted) return;

            const autenticado = Boolean(result?.authenticated);
            const grupo = result?.user?.group;
            const grupos = Array.isArray(result?.user?.groups)
                ? result.user.groups
                      .map((group) =>
                          typeof group === 'string' ? group : group?.name,
                      )
                      .filter(Boolean)
                : [];

            setIsAuthenticated(autenticado);
            setIsAdmin(grupo == 'Administrador' ? true : false);
            setCoord(grupo == 'Coordenador' ? true : false);
            setGestao(grupos.some((group) => ADMIN_GROUPS.includes(group)));

            if (!autenticado) {
                setEventosAvaliador([]);
                setEventosPermitidosGestao([]);
                return;
            }

            const listaEventos = await listarMeusEventosAvaliador();
            const eventosCoordenador = await listarMeusEventosCoordenador();
            if (!isMounted) return;

            setEventosAvaliador(
                Array.isArray(listaEventos) ? listaEventos : [],
            );
            setEventosPermitidosGestao(
                Array.isArray(eventosCoordenador)
                    ? eventosCoordenador
                          .map((evento) =>
                              String(evento?.id ?? evento?.evento_id ?? ''),
                          )
                          .filter(Boolean)
                    : [],
            );
        } catch {
            if (isMounted) {
                setIsAuthenticated(false);
                setGestao(false);
                setEventosAvaliador([]);
                setEventosPermitidosGestao([]);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        let ativo = true;

        carregarSessao(ativo);

        const handleAtualizacaoGlobal = () => {
            carregarSessao(ativo);
        };

        window.addEventListener(
            'atualizarEventosAvaliador',
            handleAtualizacaoGlobal,
        );

        return () => {
            ativo = false;
            window.removeEventListener(
                'atualizarEventosAvaliador',
                handleAtualizacaoGlobal,
            );
        };
    }, []);

    const temAvaliacoes = eventosAvaliador.length > 0;

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
                <Navbar.Brand href="/" className="ps-5">
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
                            {!loading && isAuthenticated && (
                                <Nav.Link
                                    as={Link}
                                    to="/meus_eventos"
                                    className="text-white fw-bold"
                                >
                                    Meus Eventos
                                </Nav.Link>
                            )}
                            {!loading && temAvaliacoes && (
                                <NavDropdown
                                    title={
                                        <span className="text-white fw-bold">
                                            Avaliações
                                        </span>
                                    }
                                    id="nav-dropdown-avaliacoes"
                                    align="end"
                                    className="nav-gestao-dropdown"
                                >
                                    <ItensAvaliacoesRecentes
                                        navigate={navigate}
                                        eventos={eventosAvaliador}
                                    />
                                </NavDropdown>
                            )}
                            {!loading && Gestao && (
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
                                    <ItensGestaoRecentes
                                        navigate={navigate}
                                        admin={isAdmin}
                                        coord={Coord}
                                        permitidoIds={eventosPermitidosGestao}
                                    />
                                </NavDropdown>
                            )}

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
