import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Spinner from 'react-bootstrap/esm/Spinner';
import EventoCard from '../components/cards_listagem/EventoCard';
import Alerta from '../components/common/Alerta';
import { MdOutlineSearch } from 'react-icons/md';
import { useEventos } from '../hooks/useEventos';
import useInscricoesEvento from '../hooks/useInscricoesEvento';
import { redirectToLogin } from '../services/authService';

export default function Home({ campus = 'Campus Restinga' }) {
    const location = useLocation();
    const loginAlert = location.state?.loginAlert ?? null;
    const navigate = useNavigate();
    const [alertaInscricao, setAlertaInscricao] = useState(null);

    const { eventos, possuiEtapaSubmissaoAberta } = useEventos();
    const {
        estaInscritoEmEvento,
        criarInscricao,
        usuarioLogado,
        obterStatusInscricao,
    } = useInscricoesEvento();

    const handleInscrever = async (eventoId) => {
        if (!usuarioLogado) {
            redirectToLogin();
            return;
        }

        if (!usuarioLogado.perfil_id) {
            navigate('/cadastroComplementar');
            return;
        }

        try {
            await criarInscricao({
                perfil_id: usuarioLogado.perfil_id,
                evento_id: eventoId,
            });
            setAlertaInscricao({
                mensagem: 'Inscrição realizada com sucesso!',
                variacao: 'success',
            });
        } catch (erro) {
            console.error('Erro ao inscrever:', erro);
            const mensagem =
                erro?.response?.data?.mensagem?.[0] ||
                erro?.message ||
                'Erro ao realizar inscrição. Tente novamente.';
            setAlertaInscricao({
                mensagem,
                variacao: 'danger',
            });
        }
    };
   

    useEffect(() => {
        if (loginAlert) {
            const timeoutId = window.setTimeout(() => {
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname,
                );
            }, 5000);

            return () => window.clearTimeout(timeoutId);
        }
    }, [loginAlert, location.pathname]);

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
                            {eventos.length > 0 ? (
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
                                        textoBotao1="Ver Detalhes"
                                        onClick1={()=>{navigate(`/detalhe-evento/${evento.id}`)}}
                                        textoBotao2={
                                            estaInscritoEmEvento(evento.id)
                                                ? obterStatusInscricao(
                                                      evento.id,
                                                  ) === 'CANCELADA'
                                                    ? 'Cancelada'
                                                    : 'Inscrito'
                                                : possuiEtapaSubmissaoAberta(
                                                        evento,
                                                    )
                                                  ? 'Inscreva-se'
                                                  : ''
                                        }
                                        onClick2={() =>
                                            handleInscrever(evento.id)
                                        }
                                        icon1={MdOutlineSearch}
                                        varianteBotao2={
                                            obterStatusInscricao(evento.id) ===
                                            'CANCELADA'
                                                ? 'danger'
                                                : 'outline-success'
                                        }
                                        id={evento.id}
                                        desabilitarBotao2={estaInscritoEmEvento(
                                            evento.id,
                                        )}
                                    />
                                ))
                            ) : (
                                <p className="text-muted">
                                    Nenhum evento disponível no momento.
                                </p>
                            )}
                        </Col>
                    </Row>
                </Container>
            </main>
            {alertaInscricao && (
                <Alerta
                    mensagem={alertaInscricao.mensagem}
                    variacao={alertaInscricao.variacao}
                    duracao={3000}
                />
            )}

            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
