import { Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import EventoCard from '../components/cards_listagem/EventoCard';
import Alerta from '../components/common/Alerta';
import { useMeusAvaliacoes } from '../hooks/useMeusAvaliacoes';

export default function MeusEventosAvaliador({ campus = 'Campus Restinga' }) {
    const { eventos, erro } = useMeusAvaliacoes();
    const [alerta, setAlerta] = useState(null);
    const navigate = useNavigate();

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill">
                <Container fluid className="p-0">
                    <Row className="m-0">
                        <Col
                            style={{ background: '#059547', padding: '100px' }}
                        >
                            <h1 className="text-white text-center fw-bold">
                                Meus Eventos (Avaliador)
                            </h1>
                            <p className="text-white text-center fs-5 mb-0">
                                Eventos nos quais você foi designado como
                                avaliador.
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
                            {eventos && eventos.length > 0 ? (
                                eventos.map((evento) => (
                                    <EventoCard
                                        key={evento.id}
                                        titulo={evento.nome}
                                        data={`Carga Horária: ${evento.carga_horaria}h`}
                                        faseAtual={
                                            evento.status_evento ||
                                            'Em andamento'
                                        }
                                        corFase={
                                            evento.status_evento === 'Aberto'
                                                ? '#106D47'
                                                : '#6c757d'
                                        }
                                        descricao={evento?.descricao}
                                        textoBotao1="Ver Avaliações"
                                        textoBotao2=""
                                        onClick1={() =>
                                            navigate(
                                                `/minhas_avaliacoes?evento_id=${evento.id}`,
                                            )
                                        }
                                        desabilitarBotao2={true}
                                    />
                                ))
                            ) : (
                                <p className="text-muted mb-0">
                                    Você não está designado como avaliador em
                                    nenhum evento.
                                </p>
                            )}
                        </Col>
                    </Row>
                </Container>
            </main>
            {erro && (
                <Alerta mensagem={erro} variacao="danger" duracao={5000} />
            )}
            {alerta && (
                <Alerta
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    duracao={3000}
                />
            )}
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </div>
    );
}
