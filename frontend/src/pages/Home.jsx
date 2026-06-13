import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Spinner from 'react-bootstrap/esm/Spinner';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';
import { MdOutlineSearch } from 'react-icons/md';
import HomeCard from '../components/cards_listagem/HomeCard';
import { useEventos } from '../hooks/useEventos';
import useInscricoesEvento from '../hooks/useInscricoesEvento';
import { redirectToLogin } from '../services/authService';
import {
    formatarDataEvento,
    obterStatusHome,
} from '../utils/homeEventoHelpers';

const FILTROS = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'INSCRICOES_ABERTAS', label: 'Inscrições abertas' },
    { value: 'SUBMISSAO_TRABALHOS', label: 'Submissões de trabalhos' },
    { value: 'ENCERRADO', label: 'Encerrados' },
];

export default function Home({ campus = 'Campus Restinga' }) {
    const location = useLocation();
    const loginAlert = location.state?.loginAlert ?? null;
    const navigate = useNavigate();
    const [alertaInscricao, setAlertaInscricao] = useState(null);
    const [modalConfirmarInscricao, setModalConfirmarInscricao] = useState({
        show: false,
        eventoId: null,
        nomeEvento: '',
    });
    const [modalPosInscricao, setModalPosInscricao] = useState({
        show: false,
        eventoId: null,
        nomeEvento: '',
    });
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [termoBusca, setTermoBusca] = useState('');

    const {
        eventos,
        loading,
        possuiEtapaSubmissaoAberta,
        possuiEtapaRealizacaoAberta,
    } = useEventos();
    const {
        estaInscritoEmEvento,
        criarInscricao,
        usuarioLogado,
        obterStatusInscricao,
    } = useInscricoesEvento();

    const handleInscrever = async (eventoId) => {
        const eventoSelecionado = eventos.find(
            (evento) => Number(evento?.id) === Number(eventoId),
        );

        if (!usuarioLogado) {
            redirectToLogin();
            return;
        }

        if (!usuarioLogado.perfil_id) {
            navigate('/cadastro_complementar', {
                state: { from: location },
            });
            return;
        }

        setModalConfirmarInscricao({
            show: true,
            eventoId,
            nomeEvento: eventoSelecionado?.nome || '',
        });
    };

    const fecharModalConfirmarInscricao = () => {
        setModalConfirmarInscricao({
            show: false,
            eventoId: null,
            nomeEvento: '',
        });
    };

    const confirmarInscricao = async () => {
        const { eventoId } = modalConfirmarInscricao;

        fecharModalConfirmarInscricao();

        if (!eventoId) {
            return;
        }

        try {
            await criarInscricao({
                perfil_id: usuarioLogado.perfil_id,
                evento_id: eventoId,
            });

            const eventoInscrito = eventos.find(
                (evento) => Number(evento?.id) === Number(eventoId),
            );

            setAlertaInscricao({
                mensagem: 'Inscrição realizada com sucesso!',
                variacao: 'success',
            });

            setModalPosInscricao({
                show: true,
                eventoId,
                nomeEvento: eventoInscrito?.nome || '',
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

    const fecharModalPosInscricao = () => {
        setModalPosInscricao({
            show: false,
            eventoId: null,
            nomeEvento: '',
        });
    };

    const verAtracoesEvento = () => {
        const { eventoId } = modalPosInscricao;

        fecharModalPosInscricao();

        if (!eventoId) {
            return;
        }

        navigate(`/programacao_evento/${eventoId}`);
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

    const eventosOrdenados = useMemo(() => {
        // Ordena por data (menor primeiro). Usa a menor data válida entre as etapas
        // de cada evento. Se não houver data, coloca o evento ao final.
        const getMenorData = (evento) => {
            const datas = (evento?.etapas || [])
                .flatMap((et) => [et?.data_inicio, et?.data_fim])
                .filter(Boolean)
                .map((d) => new Date(d).getTime())
                .filter((t) => !Number.isNaN(t));

            return datas.length > 0 ? Math.min(...datas) : Infinity;
        };

        return [...eventos].sort((eventoA, eventoB) => {
            const tA = getMenorData(eventoA);
            const tB = getMenorData(eventoB);

            if (tA === tB) {
                // desempate de datas por  id (mais novo primeiro)
                return Number(eventoB?.id ?? 0) - Number(eventoA?.id ?? 0);
            }

            return tA - tB;
        });
    }, [eventos]);

    const eventosFiltrados = useMemo(() => {
        const termo = termoBusca.trim().toLowerCase();

        return eventosOrdenados
            .map((evento) => {
                const statusInfo = obterStatusHome(evento);
                const inscricaoAberta = possuiEtapaSubmissaoAberta(evento);

                return {
                    ...evento,
                    status_home: statusInfo.status,
                    etapa_atual: statusInfo.etapaAtual,
                    inscricao_aberta: inscricaoAberta,
                };
            })
            .filter((evento) => {
                if (!evento.status_home && !evento.inscricao_aberta) {
                    return false;
                }

                const statusOk =
                    filtroStatus === 'TODOS' ||
                    (filtroStatus === 'EM_ANDAMENTO'
                        ? possuiEtapaRealizacaoAberta(evento)
                        : filtroStatus === 'INSCRICOES_ABERTAS'
                          ? evento.status_home === filtroStatus ||
                            evento.inscricao_aberta === true
                          : evento.status_home === filtroStatus);
                const textoBase = [
                    evento?.nome,
                    evento?.tema,
                    evento?.descricao,
                    evento?.setor,
                    evento?.etapa_atual,

                    // tipos de etapas (INSCRICAO, REALIZACAO_EVENTO, etc.)
                    evento?.etapas
                        ? evento.etapas
                              .map((et) => et?.tipo_etapa)
                              .filter(Boolean)
                              .join(' ')
                        : null,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                const buscaOk = !termo || textoBase.includes(termo);

                return statusOk && buscaOk;
            });
    }, [
        eventosOrdenados,
        filtroStatus,
        termoBusca,
        possuiEtapaRealizacaoAberta,
        possuiEtapaSubmissaoAberta,
    ]);

    const eventosDestaque = useMemo(() => {
        if (!eventosFiltrados || eventosFiltrados.length === 0) return [];

        const destaquePorRealizacao = eventosFiltrados.filter((e) =>
            possuiEtapaRealizacaoAberta(e),
        );

        return destaquePorRealizacao.length > 0
            ? destaquePorRealizacao
            : [eventosFiltrados[0]];
    }, [eventosFiltrados, possuiEtapaRealizacaoAberta]);

    const eventosDestaqueIds = useMemo(
        () => new Set(eventosDestaque.map((e) => e.id)),
        [eventosDestaque],
    );

    const eventosSecundarios = useMemo(() => {
        return eventosFiltrados.filter((e) => !eventosDestaqueIds.has(e.id));
    }, [eventosFiltrados, eventosDestaqueIds]);
    const temFiltroAtivo =
        filtroStatus !== 'TODOS' || termoBusca.trim().length > 0;

    const renderCard = (evento, destaque = false) => (
        <HomeCard
            key={evento.id}
            evento={evento}
            destaque={destaque}
            onDetalhes={() => {
                navigate(`/programacao_evento/${evento.id}`);
            }}
            onInscrever={() => handleInscrever(evento.id)}
            possuiInscricao={estaInscritoEmEvento(evento.id)}
            statusInscricao={obterStatusInscricao(evento.id)}
            permiteInscricao={possuiEtapaSubmissaoAberta(evento)}
            formatarData={formatarDataEvento}
            statusHome={evento.status_home}
            etapaAtual={evento.etapa_atual}
        />
    );

    return (
        <>
            <NavBar />
            <main
                className="flex-fill"
                style={{
                    background:
                        'radial-gradient(circle at top left, rgba(15, 122, 67, 0.14), transparent 32%), radial-gradient(circle at bottom right, rgba(178, 106, 0, 0.11), transparent 28%), linear-gradient(180deg, #f4f7f2 0%, #eef3ec 100%)',
                    color: '#17301f',
                }}
            >
                {loginAlert && (
                    <Alerta
                        mensagem={loginAlert.mensagem}
                        variacao={loginAlert.variacao}
                        duracao={5000}
                    />
                )}

                <section
                    style={{
                        backgroundImage:
                            'linear-gradient(to right,#17882c 0,#00510f 100%)',
                        color: '#ffffff',
                        padding: '4.25rem 1.5rem 4.75rem',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            width: '24rem',
                            height: '24rem',
                            left: '-7rem',
                            top: '-10rem',
                            borderRadius: '999px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            pointerEvents: 'none',
                        }}
                    />
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            width: '18rem',
                            height: '18rem',
                            right: '-5rem',
                            bottom: '-8rem',
                            borderRadius: '999px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            pointerEvents: 'none',
                        }}
                    />
                    <div
                        className="position-relative mx-auto text-center"
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            maxWidth: '52rem',
                        }}
                    >
                        <span
                            className="d-inline-flex align-items-center gap-2 rounded-pill fw-bold text-uppercase"
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'rgba(255, 255, 255, 0.76)',
                                fontSize: '0.74rem',
                                letterSpacing: '0.18em',
                                padding: '0.45rem 0.85rem',
                            }}
                        >
                            {campus} · 2026
                        </span>
                        <h1
                            className="fw-bold text-white"
                            style={{
                                fontSize: 'clamp(2.75rem, 6vw, 4.8rem)',
                                lineHeight: 0.96,
                                margin: '1.1rem 0 0.9rem',
                            }}
                        >
                            Eventos <em className="fst-italic">acadêmicos</em>
                        </h1>
                        <p
                            className="mx-auto mb-0"
                            style={{
                                maxWidth: '40rem',
                                color: 'rgba(255, 255, 255, 0.74)',
                                fontSize: '1rem',
                                lineHeight: 1.7,
                            }}
                        >
                            Acompanhe, inscreva-se e participe dos principais
                            eventos do IFRS {campus}.
                        </p>
                    </div>
                </section>

                <Container className="py-5" style={{ maxWidth: '82rem' }}>
                    <div className="d-grid gap-3 mb-4">
                        <label
                            className="d-flex align-items-center gap-2"
                            htmlFor="home-search"
                            style={{
                                background: 'rgba(255, 255, 255, 0.94)',
                                border: '1px solid rgba(18, 48, 30, 0.09)',
                                borderRadius: '1rem',
                                boxShadow: '0 18px 36px rgba(22, 51, 28, 0.08)',
                                minHeight: '3.5rem',
                                padding: '0 1rem',
                            }}
                        >
                            <MdOutlineSearch aria-hidden="true" />
                            <input
                                className="form-control border-0 bg-transparent shadow-none p-0"
                                id="home-search"
                                type="search"
                                value={termoBusca}
                                onChange={(event) =>
                                    setTermoBusca(event.target.value)
                                }
                                placeholder="Buscar eventos por nome, tema ou fase..."
                            />
                        </label>

                        <div
                            className="d-flex flex-wrap gap-2"
                            role="tablist"
                            aria-label="Filtros de eventos"
                        >
                            {FILTROS.map((filtro) => (
                                <button
                                    key={filtro.value}
                                    type="button"
                                    className={`btn btn-sm rounded-pill fw-semibold ${
                                        filtroStatus === filtro.value
                                            ? 'btn-success text-white shadow-sm'
                                            : 'btn-outline-success'
                                    }`}
                                    onClick={() =>
                                        setFiltroStatus(filtro.value)
                                    }
                                >
                                    {filtro.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 px-3 bg-white border rounded-4 shadow-sm gap-3">
                            <Spinner animation="border" role="status" />
                            <span>Carregando eventos...</span>
                        </div>
                    ) : eventosFiltrados.length > 0 ? (
                        <div className="d-grid gap-4">
                            {!temFiltroAtivo ? (
                                <>
                                    <div>
                                        {eventosDestaque.map((evento) => (
                                            <div
                                                className="mb-4"
                                                key={evento.id}
                                            >
                                                {renderCard(evento, true)}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : null}

                            <div className="row row-cols-1 row-cols-lg-2 g-4">
                                {(temFiltroAtivo
                                    ? eventosFiltrados
                                    : eventosSecundarios
                                ).map((evento) => (
                                    <div className="col" key={evento.id}>
                                        {renderCard(evento, false)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 px-3 bg-white border rounded-4 shadow-sm">
                            <strong>Nenhum evento encontrado.</strong>
                            <span>
                                Ajuste a busca ou os filtros para visualizar
                                outros eventos.
                            </span>
                        </div>
                    )}
                </Container>
            </main>
            {alertaInscricao && (
                <Alerta
                    mensagem={alertaInscricao.mensagem}
                    variacao={alertaInscricao.variacao}
                    duracao={3000}
                />
            )}

            <ModalPopup
                show={modalConfirmarInscricao.show}
                onFechar={fecharModalConfirmarInscricao}
                onAcao={confirmarInscricao}
                variante="success"
                titulo="Confirmar inscrição"
                tituloSecundario="Deseja confirmar a inscrição neste evento?"
                texto={
                    modalConfirmarInscricao.nomeEvento
                        ? `Você está prestes a se inscrever em ${modalConfirmarInscricao.nomeEvento}.`
                        : 'Você está prestes a confirmar sua inscrição.'
                }
                textoFechar="Cancelar"
                textoAcao="Confirmar inscrição"
            />

            <ModalPopup
                show={modalPosInscricao.show}
                onFechar={fecharModalPosInscricao}
                onAcao={verAtracoesEvento}
                variante="success"
                titulo="Inscrição confirmada"
                tituloSecundario="Deseja ver as atrações deste evento agora?"
                texto={
                    modalPosInscricao.nomeEvento
                        ? `Você se inscreveu em ${modalPosInscricao.nomeEvento}.`
                        : 'Sua inscrição foi concluída com sucesso.'
                }
                textoFechar="Depois"
                textoAcao="Ver atrações"
            />

            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
