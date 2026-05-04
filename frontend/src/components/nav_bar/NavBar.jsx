import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthButton from '../common/AuthButton';
import IFLogo from '../common/IFLogo';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { BsBell } from 'react-icons/bs';

export default function NavBar() {
    const expand = 'xl';
    return (
        <Navbar
            key={expand}
            expand={expand}
            className="bg-body-tertiary p-0"
            style={{ backgroundColor: '#00A44B' }}
        >
            <Container
                fluid
                style={{ backgroundColor: '#00A44B' }}
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
                            <Nav.Link href="/" className="text-white fw-bold">
                                Home
                            </Nav.Link>
                            <Nav.Link href="/ListarEventos" className="text-white fw-bold">
                                Meus Eventos
                            </Nav.Link>
                            <Nav.Link href="/avaliar-submissao" className="text-white fw-bold">
                                Avaliações
                            </Nav.Link>
                            <Nav.Link
                                href="/dashboard"
                                className="text-white fw-bold"
                            >
                                Gestão
                            </Nav.Link>
                            <div className="d-flex d-xl-none">
                                <div className="pe-3 d-flex fw-bold">
                                    <AuthButton />
                                </div>
                            </div>
                            <div className="d-flex d-xl-none">
                                <div className="pe-3 d-flex flex-column justify-content-center fw-bold">
                                    <BsBell
                                        size={20}
                                        color="#fff"
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
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
