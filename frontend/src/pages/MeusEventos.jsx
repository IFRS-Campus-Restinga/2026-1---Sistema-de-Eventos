import { Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import EventoCard from '../components/cards_listagem/EventoCard';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';
import { useEventos } from '../hooks/useEventos';
import { useMinhasInscricoes } from '../hooks/useMinhasInscricoes';

export default function MeusEventos({ campus = 'Campus Restinga' }) {
    const { eventos } = useEventos();
    const {
        eventosInscritos,
        erro,
        inscricoes,
        podeCancelarEvento,
        cancelarInscricao,
    } = useMinhasInscricoes(eventos);
    const [alerta, setAlerta] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [inscricaoSelecionada, setInscricaoSelecionada] = useState(null);

    const handleCancelar = async (inscricaoId) => {
        try {
            await cancelarInscricao(inscricaoId);
            setAlerta({
                mensagem: 'Inscrição cancelada com sucesso',
                variacao: 'success',
            });
        } catch (err) {
            const mensagem =
                err?.response?.data?.erro ||
                err?.message ||
                'Erro ao cancelar inscrição';
            setAlerta({ mensagem, variacao: 'danger' });
        }
    };

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
                                Meus Eventos
                            </h1>
                            <p className="text-white text-center fs-5 mb-0">
                                Acesse eventos nos quais você se inscreveu.
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
                            {eventosInscritos.length > 0 ? (
                                eventosInscritos.map((evento) => {
                                    const inscricao = inscricoes.find(
                                        (i) =>
                                            Number(i.evento_id) ===
                                            Number(evento.id),
                                    );

                                    const podeCancelar =
                                        podeCancelarEvento(evento) &&
                                        inscricao &&
                                        inscricao.status !== 'CANCELADA';

                                    return (
                                        <EventoCard
                                            key={evento.id}
                                            titulo={evento.nome}
                                            data={`Carga Horária: ${evento.carga_horaria}h`}
                                            faseAtual={
                                                evento.status_evento ||
                                                'Em andamento'
                                            }
                                            corFase={
                                                evento.status_evento ===
                                                'Aberto'
                                                    ? '#106D47'
                                                    : '#6c757d'
                                            }
                                            descricao={evento?.descricao}
                                            textoBotao1="Ver minhas participacoes"
                                            textoBotao2={
                                                podeCancelar
                                                    ? 'Cancelar inscrição'
                                                    : ''
                                            }
                                            onClick1={() => {}}
                                            onClick2={
                                                podeCancelar
                                                    ? () => {
                                                          setInscricaoSelecionada(
                                                              inscricao.id,
                                                          );
                                                          setShowModal(true);
                                                      }
                                                    : undefined
                                            }
                                            desabilitarBotao2={!podeCancelar}
                                            varianteBotao2="outline-danger"
                                            statusInscricao={inscricao?.status}
                                            id={evento.id}
                                        />
                                    );
                                })
                            ) : (
                                <p className="text-muted mb-0">
                                    Você ainda não está inscrito em nenhum
                                    evento.
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
            <ModalPopup
                show={showModal}
                titulo="Confirmar cancelamento"
                texto="Deseja realmente cancelar sua inscrição neste evento?"
                textoAcao="Confirmar"
                onFechar={() => {
                    setShowModal(false);
                    setInscricaoSelecionada(null);
                }}
                onAcao={async () => {
                    if (inscricaoSelecionada) {
                        await handleCancelar(inscricaoSelecionada);
                    }
                    setShowModal(false);
                    setInscricaoSelecionada(null);
                }}
                variante="danger"
            />
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </div>
    );
}
