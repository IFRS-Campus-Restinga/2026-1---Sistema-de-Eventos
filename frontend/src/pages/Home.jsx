import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Spinner from 'react-bootstrap/esm/Spinner';
import EventoCard from '../components/cards_listagem/EventoCard';
import Alerta from '../components/common/Alerta';
import { MdOutlineSearch } from 'react-icons/md';
import { listarEventos } from '../services/eventoService'; // Importando seu serviço
import eArray from '../utils/eArray'; // Sua utilidade de verificação de array

export default function Home({ campus = 'Campus Restinga' }) {
    const location = useLocation();
    const [loginAlert, setLoginAlert] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const alertState = location.state?.loginAlert;
        if (alertState) {
            setLoginAlert(alertState);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.state]);

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const dados = await listarEventos();
                if (eArray(dados)) {
                    setEventos(dados);
                }
            } catch (error) {
                console.error("Erro ao carregar eventos na home:", error);
            } finally {
                setCarregando(false);
            }
        };
        buscarDados();
    }, []);

    return (
        <>
            <NavBar />
            <main className="flex-fill">
                {loginAlert && (
                    <Alerta
                        mensagem={loginAlert.mensagem}
                        variacao={loginAlert.variacao}
                        duracao={5000}
                    />
                )}
                
                <Container fluid className="p-0">
                    <Row className="m-0">
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

                    <Row className="m-0">
                        <Col
                            xs={12}
                            md={10}
                            lg={8}
                            className="mx-auto d-flex flex-column align-items-center my-5 gap-4"
                        >
                            {carregando ? (
                                <Spinner animation="border" variant="success" />
                            ) : eventos.length > 0 ? (
                                eventos.map((evento) => (
                                    <EventoCard
                                        key={evento.id}
                                        titulo={evento.nome}
                                        data={`Carga Horária: ${evento.carga_horaria}h`}
                                        faseAtual={evento.status_evento || "Em andamento"}
                                        corFase={evento.status_evento === 'Aberto' ? "#106D47" : "#6c757d"}
                                        descricao={evento.descricao}
                                        textoBotao="Ver Detalhes"
                                        icon={MdOutlineSearch}
                                        id={evento.id} 
                                    />
                                ))
                            ) : (
                                <p className="text-muted">Nenhum evento disponível no momento.</p>
                            )}
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