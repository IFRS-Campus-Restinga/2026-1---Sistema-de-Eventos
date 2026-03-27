import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';

export default function Home({}) {
    return (
        <>
            <NavBar></NavBar>
            <main className="flex-fill">
                <Container fluid>
                    <Row>
                        <Col></Col>
                    </Row>
                </Container>
            </main>
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={'Campus Restinga'}
            ></Footer>
        </>
    );
}
