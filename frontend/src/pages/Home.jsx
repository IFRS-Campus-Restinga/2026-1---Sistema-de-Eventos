import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import EventoCard from '../components/common/EventCard';
import { MdOutlineSearch } from 'react-icons/md';
import Tag from '../components/common/Tag';

export default function Home({ campus = 'Campus Restinga' }) {
    return (
        <>
            <NavBar></NavBar>
            <main className="flex-fill">
                <Container fluid>
                    <Row>
                        <Col
                            style={{ background: '#059547', padding: '100px' }}
                        >
                            <h1 className="text-white text-center fw-bold">
                                Eventos IFRS {campus}
                            </h1>
                            <p className="text-white text-center fs-5">
                                Acompanhe os principais eventos do IFRS {campus}
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex justify-content-center my-5">
                            {/* Exemplo de card */}
                            {/* <EventoCard
                                title="Mostra"
                                dateRange="De 20/09 a 22/09"
                                phaseLabel="Inscrições abertas"
                                phaseColor="#106D47"
                                description={
                                    'A XIV Mostra Científica conecta estudantes, pesquisadores e comunidade para compartilhar inovação, tecnologia e saberes. Submeta seu trabalho e faça parte.'
                                }
                                detailsLabel="Ver Detalhes"
                                icon={MdOutlineSearch}
                            /> */}
                        </Col>
                    </Row>
                </Container>
            </main>
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            ></Footer>
        </>
    );
}
