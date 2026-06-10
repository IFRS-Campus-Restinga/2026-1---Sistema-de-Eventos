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
        if (!eventoSelecionadoId || !usuarioLogado?.perfil_id) return [];

        // ids de atrações em que o usuário está inscrito
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

        // ids de atrações em que o usuário é autor ou membro da equipe
        const idsAutorOuEquipe = new Set();
        atracoes.forEach((atracao) => {
            const autorias = Array.isArray(atracao.autorias)
                ? atracao.autorias
                : [];

            const pertenceComoAutoria = autorias.some((a) => {
                if (!a) return false;
                // normal match by local user id (when available)
                if (typeof a.usuario !== 'undefined' && usuarioLogado?.id) {
                    if (Number(a.usuario) === Number(usuarioLogado.id))
                        return true;
                }

                // fallback: compare by name/username using usuario_nome
                const usuarioNome = String(a.usuario_nome || '')
                    .trim()
                    .toLowerCase();
                const display = String(usuarioLogado?.display_name || '')
                    .trim()
                    .toLowerCase();
                const perfilNome = String(usuarioLogado?.nome || '')
                    .trim()
                    .toLowerCase();
                const username = String(usuarioLogado?.username || '')
                    .trim()
                    .toLowerCase();

                return (
                    (usuarioNome && display && usuarioNome === display) ||
                    (usuarioNome && perfilNome && usuarioNome === perfilNome) ||
                    (usuarioNome && username && usuarioNome === username)
                );
            });

            let pertenceComoEquipe = false;
            if (Array.isArray(atracao.equipe_nomes) && usuarioLogado) {
                const nomePerfil = String(usuarioLogado.nome || '').trim();
                const username = String(usuarioLogado.username || '').trim();
                pertenceComoEquipe = atracao.equipe_nomes.some((n) => {
                    if (!n) return false;
                    const s = String(n).trim();
                    return (
                        (nomePerfil && s === nomePerfil) ||
                        (username && s === username)
                    );
                });
            }

            if (pertenceComoAutoria || pertenceComoEquipe) {
                idsAutorOuEquipe.add(Number(atracao.id));
            }
        });

        // combinação: inscrito OU autor/equipe
        const idsCombinados = new Set([
            ...Array.from(idsInscritos),
            ...Array.from(idsAutorOuEquipe),
        ]);

        const minhas = atracoes
            .filter((atracao) => idsCombinados.has(Number(atracao.id)))
            .map((atracao) => {
                const autorias = Array.isArray(atracao.autorias)
                    ? atracao.autorias
                    : [];

                const isAutor = autorias.some((a) => {
                    if (!a) return false;
                    if (String(a.tipo).toUpperCase() !== 'AUTOR') return false;

                    if (typeof a.usuario !== 'undefined' && usuarioLogado?.id) {
                        if (Number(a.usuario) === Number(usuarioLogado.id))
                            return true;
                    }

                    const usuarioNome = String(a.usuario_nome || '')
                        .trim()
                        .toLowerCase();
                    const display = String(usuarioLogado?.display_name || '')
                        .trim()
                        .toLowerCase();
                    const perfilNome = String(usuarioLogado?.nome || '')
                        .trim()
                        .toLowerCase();
                    const username = String(usuarioLogado?.username || '')
                        .trim()
                        .toLowerCase();

                    return (
                        (usuarioNome && display && usuarioNome === display) ||
                        (usuarioNome &&
                            perfilNome &&
                            usuarioNome === perfilNome) ||
                        (usuarioNome && username && usuarioNome === username)
                    );
                });

                return { ...atracao, isAutor };
            });

        return minhas;
    }, [
        atracoes,
        inscricoes,
        eventoSelecionadoId,
        inscricaoEvento,
        usuarioLogado,
    ]);

    const atracoesQueSouAutor = useMemo(
        () => atracoesInscritas.filter((a) => a.isAutor),
        [atracoesInscritas],
    );

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill">
                <Container fluid className="p-0">
                    <Row className="m-0">
                        <Col
                            style={{
                                backgroundImage:
                                    'linear-gradient(to right,#17882c 0,#00510f 100%)',
                                padding: '100px',
                            }}
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
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <h3 className="mb-1">
                                                                        {
                                                                            atracao.titulo
                                                                        }
                                                                    </h3>
                                                                    <div>
                                                                        {atracao.isAutor ? (
                                                                            <span className="badge bg-success ms-2">
                                                                                Autor
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge bg-secondary ms-2">
                                                                                Participante
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
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
                                                                    Autor:{' '}
                                                                    {atracao.autor_nome ||
                                                                        (Array.isArray(
                                                                            atracao.autorias,
                                                                        ) &&
                                                                            atracao
                                                                                .autorias[0]
                                                                                ?.usuario_nome) ||
                                                                        '—'}
                                                                </span>
                                                                <span className="text-muted">
                                                                    Orientador:{' '}
                                                                    {atracao.orientador_nome ||
                                                                        '—'}
                                                                </span>
                                                                {atracao.isAutor && (
                                                                    <Button
                                                                        className="w-25 mt-3"
                                                                        size="sm"
                                                                        variant="success"
                                                                    >
                                                                        Inscritos
                                                                    </Button>
                                                                )}
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
