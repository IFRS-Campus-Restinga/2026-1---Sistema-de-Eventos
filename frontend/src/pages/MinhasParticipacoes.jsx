import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    ListGroup,
    Spinner,
    Button,
} from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta';
import Card from '../components/common/Card';
import { useMinhasInscricoes } from '../hooks/useMinhasInscricoes';
import useInscricoesAtracao from '../hooks/useInscricoesAtracao';
import { listarAtracoes } from '../services/atracaoService';
import { buscarEventoPorId } from '../services/eventoService';
import {
    getSelectedEventoId,
    setSelectedEventoId,
} from '../utils/selectedEvento';

export default function MinhasParticipacoes({ campus = 'Campus Restinga' }) {
    const { eventoId } = useParams();
    const navigate = useNavigate();
    const eventoSelecionadoId = eventoId || getSelectedEventoId();
    const [evento, setEvento] = useState(null);
    const [atracoes, setAtracoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carregandoEvento, setCarregandoEvento] = useState(true);
    const [alerta, setAlerta] = useState(null);
    const {
        inscricoes: inscricoesEventos,
        carregando: carregandoInscricoesEvento,
    } = useMinhasInscricoes();
    const {
        inscricoes,
        erro,
        carregandoUsuario,
        loading: carregandoInscricoes,
        usuarioLogado,
    } = useInscricoesAtracao();
    const inscricaoEvento = useMemo(() => {
        if (!eventoSelecionadoId) return null;

        return (
            inscricoesEventos.find(
                (inscricao) =>
                    Number(inscricao.evento_id) ===
                        Number(eventoSelecionadoId) && Boolean(inscricao.id),
            ) || null
        );
    }, [inscricoesEventos, eventoSelecionadoId]);

    useEffect(() => {
        const carregarDados = async () => {
            if (!eventoSelecionadoId) {
                setAlerta({
                    mensagem:
                        'Nenhum evento foi selecionado. Volte para Meus Eventos e escolha um evento.',
                    variacao: 'warning',
                });
                setLoading(false);
                setCarregandoEvento(false);
                return;
            }

            try {
                setLoading(true);
                setCarregandoEvento(true);

                const [dadosEvento, dadosAtracoes] = await Promise.all([
                    buscarEventoPorId(eventoSelecionadoId),
                    listarAtracoes(eventoSelecionadoId),
                ]);

                setEvento(dadosEvento);
                setSelectedEventoId(eventoSelecionadoId);
                setAtracoes(Array.isArray(dadosAtracoes) ? dadosAtracoes : []);

                if (!carregandoInscricoesEvento && !inscricaoEvento) {
                    setAlerta({
                        mensagem:
                            'Você precisa estar inscrito neste evento para acessar as participações.',
                        variacao: 'warning',
                    });
                    navigate('/meus_eventos');
                }
            } catch (err) {
                setAlerta({
                    mensagem:
                        err?.response?.data?.erro ||
                        err?.message ||
                        'Não foi possível carregar as participações do evento.',
                    variacao: 'danger',
                });
            } finally {
                setLoading(false);
                setCarregandoEvento(false);
            }
        };

        carregarDados();
    }, [
        eventoSelecionadoId,
        inscricaoEvento,
        carregandoInscricoesEvento,
        carregandoInscricoes,
        carregandoUsuario,
        navigate,
    ]);

    const atracoesInscritas = useMemo(() => {
        if (!inscricaoEvento || !usuarioLogado?.perfil_id) return [];

        const idsInscritos = new Set(
            inscricoes
                .filter(
                    (inscricao) =>
                        Number(inscricao.evento_id) ===
                            Number(eventoSelecionadoId) &&
                        Number(inscricao.perfil_id) ===
                            Number(usuarioLogado.perfil_id),
                )
                .map((inscricao) => Number(inscricao.atracao_id)),
        );

        return atracoes.filter((atracao) =>
            idsInscritos.has(Number(atracao.id)),
        );
    }, [
        atracoes,
        inscricoes,
        eventoSelecionadoId,
        inscricaoEvento,
        usuarioLogado,
    ]);

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
                                Minhas Participações
                            </h1>
                            <p className="text-white text-center fs-5 mb-0">
                                Veja as atrações do evento selecionado.
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
                            {loading ||
                            carregandoInscricoes ||
                            carregandoEvento ||
                            carregandoUsuario ||
                            carregandoInscricoesEvento ? (
                                <div className="text-center py-5">
                                    <Spinner
                                        animation="border"
                                        variant="success"
                                    />
                                    <p className="mt-2 text-muted mb-0">
                                        Carregando participações...
                                    </p>
                                </div>
                            ) : inscricaoEvento ? (
                                <Card corBorda="#00A44B">
                                    <Container fluid className="p-4">
                                        {atracoesInscritas.length > 0 ? (
                                            <ListGroup variant="flush">
                                                {atracoesInscritas.map(
                                                    (atracao) => (
                                                        <ListGroup.Item
                                                            key={atracao.id}
                                                            className="py-3"
                                                        >
                                                            <div className="d-flex flex-column gap-1">
                                                                <h3>
                                                                    {
                                                                        atracao.titulo
                                                                    }
                                                                </h3>
                                                                <span className="text-muted">
                                                                    Tipo:{' '}
                                                                    {atracao.tipo ||
                                                                        'Atração'}
                                                                </span>
                                                                <span className="text-muted">
                                                                    Resumo:{' '}
                                                                    {atracao.resumo ||
                                                                        'Sem descrição.'}
                                                                </span>
                                                                <span className="text-muted">
                                                                    Autor/Oficineiro:{' '}
                                                                    {atracao.orientador_nome ||
                                                                        'Sem descrição.'}
                                                                </span>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ),
                                                )}
                                            </ListGroup>
                                        ) : (
                                            <p className="text-muted mb-0">
                                                Você ainda não se inscreveu em
                                                nenhuma atração deste evento.
                                            </p>
                                        )}
                                    </Container>
                                </Card>
                            ) : (
                                <div className="text-center py-5 border rounded bg-white w-100">
                                    <p className="text-muted mb-0">
                                        Você não está inscrito neste evento.
                                    </p>
                                </div>
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
