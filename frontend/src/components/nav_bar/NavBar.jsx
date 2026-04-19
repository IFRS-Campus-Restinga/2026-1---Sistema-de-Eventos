import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthButton from '../common/AuthButton';
import IFLogo from '../common/IFLogo';
export default function NavBar() {
    return (
        <Navbar style={{ backgroundColor: '#00A44B' }}>
            <Container fluid className="px-0 d-flex align-items-center">
                <Navbar.Brand href="#home" className="ps-5 me-3">
                    <IFLogo
                        estado="Rio Grande do Sul"
                        campus="Campus Restinga"
                        corRect="#fff"
                        corTexto="#fff"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse
                    id="basic-navbar-nav"
                    className="justify-content-center"
                >
                    <Nav className="gap-5">
                        <Nav.Link href="/" className="text-white">
                            Home
                        </Nav.Link>
                        {/* <Nav.Link
                            href="permissoesGrupos"
                            className="text-white"
                        >
                            Permissões mock
                        </Nav.Link> */}
                        <Nav.Link
                            href="listarLocaisEspacos"
                            className="text-white"
                        >
                            Listar Locais e Espaços
                        </Nav.Link>

                        <Nav.Link href="ListarEventos" className="text-white">
                            Listar Evento
                        </Nav.Link>
                        {/*<Nav.Link href="#link" className="text-white">
                            Avaliações
                        </Nav.Link>
                        */}
                        <Nav.Link href="/dashboard" className="text-white">
                            Gestão
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <div className="d-flex align-items-center ms-auto pe-5">
                    <AuthButton />
                </div>
            </Container>
        </Navbar>
    );
}
