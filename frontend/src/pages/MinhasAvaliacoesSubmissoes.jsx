import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import Tabela from '../components/common/Tabela';
import Tag from '../components/common/Tag';
import ModalPopup from '../components/common/ModalPopup';
import { TbPencil } from 'react-icons/tb';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { BsEyeFill } from 'react-icons/bs';
import { useState, useEffect } from 'react';
import { useMeusAvaliacoes } from '../hooks/useMeusAvaliacoes';
import { buscarEventoPorId } from '../services/eventoService';
import formatNivelEnsino from '../utils/formatNivelEnsino';
import formatAreaConhecimento from '../utils/formatAreaConhecimento';

export default function MinhasAvaliacoesSubmissoes() {
    const [modalAtivo, setModalAtivo] = useState(false);
    const [selectedSubmissao, setSelectedSubmissao] = useState(null);
    const [searchParams] = useSearchParams();
    const eventoId = searchParams.get('evento_id');

    const { submissoes, carregarSubmissoesParaEvento } = useMeusAvaliacoes();
    const [etapaAvaliacao, setEtapaAvaliacao] = useState(null);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    );

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (eventoId) {
            carregarSubmissoesParaEvento(eventoId);

            (async () => {
                try {
                    // Busca o evento específico para extrair as etapas locais embutidas nele
                    const eventoDados = await buscarEventoPorId(eventoId);
                    const etapas = eventoDados?.etapas || [];

                    const etapa = etapas.find(
                        (e) => e.tipo_etapa === 'AVALIACAO_PREVIA',
                    );
                    setEtapaAvaliacao(etapa || null);
                } catch (err) {
                    console.error('Erro ao buscar etapas do evento:', err);
                    setEtapaAvaliacao(null);
                }
            })();
        }
    }, [eventoId, carregarSubmissoesParaEvento]);

    const obterNomesIntegrantes = (item) => {
        const nomes = [];

        const adicionarNome = (valor) => {
            if (typeof valor === 'string' && valor.trim()) {
                nomes.push(valor.trim());
            }
        };

        const autorias = Array.isArray(item?.autorias) ? item.autorias : [];
        autorias.forEach((autoria) => {
            adicionarNome(autoria?.nome);
            adicionarNome(autoria?.usuario_nome);
            adicionarNome(autoria?.autor);
            adicionarNome(autoria?.nome_completo);
        });

        adicionarNome(item?.autor_nome);
        adicionarNome(item?.autor);
        adicionarNome(item?.nome_autor);

        if (Array.isArray(item?.equipe)) {
            item.equipe.forEach((membro) => {
                adicionarNome(membro?.nome);
                adicionarNome(membro?.usuario_nome);
                adicionarNome(membro?.autor);
            });
        }

        return [...new Set(nomes)];
    };

    const personalizarInformacoes = (d) => {
        const nomesIntegrantes = obterNomesIntegrantes(d);

        return (
            <>
                <Row className="p-0 m-0">
                    <Col className="p-0 m-0 fw-bold">{d?.titulo}</Col>
                </Row>

                <Row className="p-0 m-0">
                    <Col className="p-0 m-0">
                        {d?.tipo || d?.modalidade || 'Modalidade'} |{' '}
                        {formatNivelEnsino(d?.nivel_ensino || d?.nivel)}
                        {nomesIntegrantes.length > 0 ? (
                            <div className="text-muted small mt-1">
                                {nomesIntegrantes.length === 1
                                    ? 'Autor: '
                                    : 'Integrantes: '}
                                {nomesIntegrantes.join(', ')}
                            </div>
                        ) : null}
                    </Col>

                    <Col className="p-0 m-0">
                        <Link
                            className="text-decoration-none d-flex align-items-center"
                            to="#"
                        >
                            <BsEyeFill />
                            <span
                                className="ms-2"
                                onClick={() => {
                                    setSelectedSubmissao(d);
                                    setModalAtivo(true);
                                }}
                            >
                                Ler resumo completo
                            </span>
                        </Link>
                    </Col>
                </Row>
            </>
        );
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />
            <main className="mb-5">
                <Container
                    fluid
                    className="d-md-flex flex-md-column align-items-md-center gap-3 p-0"
                >
                    <Row className="w-100">
                        <Col className="p-0">
                            <section
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right,#17882c 0,#00510f 100%)',
                                    color: '#ffffff',
                                    padding: '1.5rem 4.75rem',
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
                                        left: '-5rem',
                                        top: '10rem',
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
                                    <h1
                                        className="fw-bold text-white"
                                        style={{
                                            fontSize:
                                                'clamp(2.75rem, 6vw, 3.8rem)',
                                            lineHeight: 0.8,
                                            margin: '0 0 0.9rem',
                                        }}
                                    >
                                        Avaliações de Submissões
                                    </h1>
                                    <p className="fs-5">
                                        Acompanhe submissões pendentes e
                                        concluídas para avaliação.
                                    </p>
                                    <div>
                                        <div className="d-flex justify-content-center">
                                            <div
                                                className="d-flex justify-content-center flex-wrap z-1"
                                                style={{ gap: '16px' }}
                                            >
                                                <div
                                                    className="d-flex align-items-center rounded-3 p-4"
                                                    style={{
                                                        background:
                                                            'rgba(255, 255, 255, 0.10)',
                                                        border: '0.5px solid rgba(255,255,255,0.20)',
                                                        gap: '12px',
                                                        padding: '1rem 1.5rem;',
                                                    }}
                                                >
                                                    <div
                                                        className="p-2 rounded-3"
                                                        style={{
                                                            background:
                                                                'rgba(255,255,255,0.12)',
                                                        }}
                                                    >
                                                        <TbPencil
                                                            size={45}
                                                            color="#ffffff"
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className="fs-4 fw-bold">
                                                            Para avaliar
                                                        </div>
                                                        <div className="fs-2 fw-bold">
                                                            {
                                                                (
                                                                    submissoes ||
                                                                    []
                                                                ).filter(
                                                                    (s) =>
                                                                        s.status !==
                                                                            'avaliada' &&
                                                                        s.avaliacao_disponivel,
                                                                ).length
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="d-flex align-items-center rounded-3 p-4"
                                                    style={{
                                                        background:
                                                            'rgba(255, 255, 255, 0.10)',
                                                        border: '0.5px solid rgba(255,255,255,0.20)',
                                                        gap: '12px',
                                                        padding: '1rem 1.5rem;',
                                                    }}
                                                >
                                                    <div
                                                        className="p-2 rounded-3"
                                                        style={{
                                                            background:
                                                                'rgba(255,255,255,0.12)',
                                                        }}
                                                    >
                                                        <FaRegCircleCheck
                                                            size={45}
                                                            color="#ffffff"
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className="text-end fs-4 fw-bold">
                                                            Concluídas
                                                        </div>
                                                        <div className="fs-2 fw-bold">
                                                            {
                                                                (
                                                                    submissoes ||
                                                                    []
                                                                ).filter(
                                                                    (s) =>
                                                                        s.status ===
                                                                        'avaliada',
                                                                ).length
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </Col>
                    </Row>

                    <Row className="w-75 mt-4 ps-2">
                        <Col>
                            <span className="fw-bold fs-4 text-dark">
                                Minhas Avaliações
                            </span>
                        </Col>
                    </Row>

                    <Row
                        className={`${
                            !isMobile ? 'w-75' : 'w-100'
                        } px-2 overflow-auto pb-5`}
                    >
                        <Col>
                            <Tabela
                                className="rounded-4"
                                cabecarioCor={'#E9ECEF'}
                                style={{ overflow: 'hidden' }}
                                cabecarios={[
                                    'Título do Trabalho',
                                    'Prazo',
                                    'Status',
                                    'Ação',
                                ]}
                                dados={(submissoes || []).map((s) => {
                                    const prazoTexto = (() => {
                                        if (
                                            !etapaAvaliacao ||
                                            !etapaAvaliacao.data_fim
                                        )
                                            return 'Sem prazo definido';
                                        const now = new Date();
                                        if (
                                            etapaAvaliacao.data_inicio &&
                                            new Date(
                                                etapaAvaliacao.data_inicio,
                                            ) > now
                                        ) {
                                            return new Date(
                                                etapaAvaliacao.data_inicio,
                                            ).toLocaleDateString('pt-BR');
                                        }
                                        const fim = new Date(
                                            etapaAvaliacao.data_fim,
                                        );
                                        const diffMs = fim - now;
                                        if (diffMs <= 0) return 'Encerrado';
                                        const oneDayMs = 24 * 60 * 60 * 1000;
                                        if (diffMs < oneDayMs) {
                                            const diffHours = Math.ceil(
                                                diffMs / (1000 * 60 * 60),
                                            );
                                            return `${diffHours} hora${
                                                diffHours > 1 ? 's' : ''
                                            } restantes`;
                                        }
                                        return `${Math.ceil(
                                            diffMs / oneDayMs,
                                        )} dias restantes`;
                                    })();

                                    const statusTag =
                                        s.status === 'avaliada' ? (
                                            <Tag
                                                corFundo={'#059547'}
                                                corTexto={'#fff'}
                                                texto={'Avaliada'}
                                            />
                                        ) : s.avaliacao_disponivel ||
                                          s.status === 'para_avaliar' ? (
                                            <Tag
                                                corFundo={'#003366'}
                                                corTexto={'#fff'}
                                                texto={'Para avaliar'}
                                            />
                                        ) : (
                                            <Tag
                                                corFundo={'#6c757d'}
                                                corTexto={'#fff'}
                                                texto={'Fora do período'}
                                            />
                                        );

                                    const now = new Date();
                                    const etapaBefore =
                                        !!etapaAvaliacao &&
                                        etapaAvaliacao.data_inicio &&
                                        new Date(etapaAvaliacao.data_inicio) >
                                            now;
                                    const etapaOpen =
                                        !!etapaAvaliacao &&
                                        etapaAvaliacao.data_inicio &&
                                        new Date(etapaAvaliacao.data_inicio) <=
                                            now &&
                                        new Date(etapaAvaliacao.data_fim) >=
                                            now;

                                    const estaAvaliada =
                                        s.status === 'avaliada' ||
                                        !!s.avaliacao_id;
                                    const podeAvaliar =
                                        !estaAvaliada &&
                                        (!!s.avaliacao_disponivel ||
                                            s.status === 'para_avaliar' ||
                                            etapaOpen);
                                    const podeVer = estaAvaliada;
                                    const podeEditar =
                                        estaAvaliada && etapaOpen;

                                    return [
                                        {
                                            value: personalizarInformacoes(s),
                                            style: { width: '40%' },
                                        },
                                        {
                                            value: (
                                                <span
                                                    className={
                                                        etapaBefore
                                                            ? 'text-secondary fw-bold'
                                                            : 'text-danger fw-bold'
                                                    }
                                                >
                                                    {prazoTexto}
                                                </span>
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                        {
                                            value: statusTag,
                                            style: { verticalAlign: 'middle' },
                                        },
                                        {
                                            value: (
                                                <button
                                                    className="btn btn-primary btn-sm px-3"
                                                    disabled={
                                                        etapaBefore ||
                                                        (!podeAvaliar &&
                                                            !podeVer)
                                                    }
                                                    onClick={() => {
                                                        if (etapaBefore) return;
                                                        const baseUrl = `/avaliar_submissao?submissao_id=${s.id}`;

                                                        // Passa o objeto completo para o hook coletar instantaneamente
                                                        const opcoesNavegacao =
                                                            {
                                                                state: {
                                                                    submissaoObjeto:
                                                                        s,
                                                                },
                                                            };

                                                        if (podeAvaliar) {
                                                            return navigate(
                                                                baseUrl,
                                                                opcoesNavegacao,
                                                            );
                                                        }
                                                        if (podeVer) {
                                                            return navigate(
                                                                `${baseUrl}&avaliacao_id=${s.avaliacao_id}`,
                                                                opcoesNavegacao,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {etapaBefore
                                                        ? 'Indisponível'
                                                        : podeAvaliar
                                                          ? 'Avaliar'
                                                          : podeEditar
                                                            ? 'Editar'
                                                            : 'Ver'}
                                                </button>
                                            ),
                                            style: { verticalAlign: 'middle' },
                                        },
                                    ];
                                })}
                            />
                        </Col>
                    </Row>
                </Container>
            </main>

            <ModalPopup
                titulo={
                    selectedSubmissao
                        ? selectedSubmissao.titulo
                        : 'Detalhes do trabalho'
                }
                show={modalAtivo}
                onFechar={() => {
                    setModalAtivo(false);
                    setSelectedSubmissao(null);
                }}
                textoAcao=""
            >
                <Container className="p-2">
                    <Row className="mb-2">
                        <Col>
                            <Tag
                                texto={
                                    formatAreaConhecimento(
                                        selectedSubmissao?.area_conhecimento,
                                    ) || 'Área'
                                }
                                corFundo="#003366"
                                corTexto="#fff"
                            />
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col>
                            <span className="fw-bold text-dark d-block mb-1">
                                Integrantes
                            </span>
                            <p className="text-secondary small mb-0">
                                {obterNomesIntegrantes(selectedSubmissao).join(
                                    ', ',
                                ) || '—'}
                            </p>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col>
                            <span className="fw-bold text-dark d-block mb-1">
                                Resumo Acadêmico
                            </span>
                            <p
                                className="text-secondary border rounded p-2 bg-white"
                                style={{
                                    fontSize: '0.95rem',
                                    whiteSpace: 'pre-line',
                                }}
                            >
                                {selectedSubmissao?.resumo ||
                                    'Nenhum resumo anexado.'}
                            </p>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col>
                            <span className="fw-bold text-dark d-block mb-1">
                                Palavras-chave
                            </span>
                            <p className="text-secondary small">
                                {selectedSubmissao?.palavras_chave || '—'}
                            </p>
                        </Col>
                    </Row>
                </Container>
            </ModalPopup>
            <Footer
                telephone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                year={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
