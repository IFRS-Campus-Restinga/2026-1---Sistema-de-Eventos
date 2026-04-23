import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import { Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

export default function SemResultado({ campus = 'Campus Restinga' }) {
    return (
        <>
            <NavBar />
            <main className="flex-fill d-flex flex-column justify-content-center align-content-center text-success  py-5">
                <Container className="w-75 p-5">
                    <Row className="">
                        <Col className="">
                            <Row>
                                <Col>
                                    <p className="text-center fs-1 fw-bold">
                                        404
                                    </p>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h1 className=" text-center fw-bold fs-1">
                                        Página não encontrada
                                    </h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="d-flex justify-content-center">
                                    <p className="fs-5">
                                        Desculpe, o sistema não consegue
                                        localizar a página que você está
                                        procurando.
                                    </p>
                                </Col>
                            </Row>
                            <Row className="mt-5">
                                <Col className="d-flex justify-content-center">
                                    <Link
                                        className="text-decoration-none fs-4 btn btn-outline-success"
                                        to={'/'}
                                    >
                                        <MdArrowBack
                                            size={30}
                                            className="me-2"
                                        />
                                        Voltar para página inicial
                                    </Link>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>

            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
