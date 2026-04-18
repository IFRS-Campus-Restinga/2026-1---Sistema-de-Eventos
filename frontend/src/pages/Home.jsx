import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import EventoCard from '../components/cards_listagem/EventoCard';
import Alerta from '../components/common/Alerta';
import { MdOutlineSearch } from 'react-icons/md';

export default function Home({ campus = 'Campus Restinga' }) {
    const location = useLocation();
    const [loginAlert, setLoginAlert] = useState(null);

    useEffect(() => {
        const alertState = location.state?.loginAlert;
        if (!alertState) {
            return;
        }

        setLoginAlert(alertState);
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
        );
    }, [location.state]);

    return (
        <>
            <NavBar />
            <main className="flex-fill">
                {loginAlert ? (
                    <Alerta
                        mensagem={loginAlert.mensagem}
                        variacao={loginAlert.variacao}
                        duracao={5000}
                    />
                ) : null}
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
                        <Col
                            xs={12}
                            md={10}
                            lg={8}
                            className="mx-auto d-flex flex-column align-items-center my-5 gap-3"
                        >
                            {/* Exemplo de card: Faça um map para gerar outros com dados reais*/}
                            {
                                <EventoCard
                                    titulo="Mostra"
                                    data="De 20/09 a 22/09"
                                    faseAtual="Inscrições abertas"
                                    corFase="#106D47"
                                    descricao={
                                        'A XIV Mostra Científica conecta estudantes, pesquisadores e comunidade para compartilhar inovação, tecnologia e saberes. Submeta seu trabalho e faça parte.'
                                    }
                                    textoBotao="Ver Detalhes"
                                    icon={MdOutlineSearch}
                                />
                            }
                        </Col>
                    </Row>
                </Container>
            </main>
            {/* Mude esses dados posteriormente */}
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
