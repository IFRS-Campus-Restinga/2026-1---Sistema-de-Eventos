import { Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import HomeCard from '../components/cards_listagem/HomeCard';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';
import { setSelectedEventoId } from '../utils/selectedEvento';
import {
    formatarDataEvento,
    obterStatusHome,
} from '../utils/homeEventoHelpers';
import { useEventos } from '../hooks/useEventos';
import { useMinhasInscricoes } from '../hooks/useMinhasInscricoes';

export default function MeusEventos({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();
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

    const abrirParticipacoes = (eventoId) => {
        setSelectedEventoId(eventoId);
        navigate(`/meus_eventos/${eventoId}/participacoes`);
    };

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
                    <Row
                        className="w-100 p-0"
                        style={{
                            backgroundImage:
                                ' linear-gradient(to right, rgb(23, 136, 44) 0px, rgb(0, 81, 15) 100%)',
                        }}
                    >
                        <Col className="text-center text-white pb-4 d-flex flex-column my-3 align-items-center">
                            <h1 className="fw-bold">Meus Eventos</h1>

                            <span className="fs-5">
                                Acesse eventos nos quais você se inscreveu.
                            </span>
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
                                        <HomeCard
                                            key={evento.id}
                                            evento={evento}
                                            destaque={true}
                                            possuiInscricao={Boolean(inscricao)}
                                            statusInscricao={inscricao?.status}
                                            permiteInscricao={false}
                                            formatarData={formatarDataEvento}
                                            etapaAtual={
                                                obterStatusHome(evento)
                                                    ?.etapaAtual ||
                                                'Etapa atual'
                                            }
                                            textoBotao1="Ver minhas participacoes"
                                            onClick1={() =>
                                                abrirParticipacoes(evento.id)
                                            }
                                            textoBotao2={
                                                podeCancelar
                                                    ? 'Cancelar inscrição'
                                                    : ''
                                            }
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
                                            varianteBotao2="btn-outline-danger"
                                            corBotao1="#00A44B"
                                            showDestaqueBadge={false}
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
