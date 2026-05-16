import { Container, Row, Col, Button } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { FaPenNib } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';
import { BsEyeFill } from 'react-icons/bs';
import Tabela from '../components/common/Tabela';
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Tag from '../components/common/Tag';
import formatNivelEnsino from '../utils/formatNivelEnsino';
import formatAreaConhecimento from '../utils/formatAreaConhecimento';
import ModalPopup from '../components/common/ModalPopup';
import { useMeusAvaliacoes } from '../hooks/useMeusAvaliacoes';
import { listarEtapas } from '../services/etapaEventoService';

export default function AvaliacoesAtracoes({}) {
    const [modalAtivo, setModalAtivo] = useState(false);
    const [selectedAtracao, setSelectedAtracao] = useState(null);
    const [searchParams] = useSearchParams();
    const eventoId = searchParams.get('evento_id');

    const { atracoes, carregarAtracoesParaEvento } = useMeusAvaliacoes();
    const [etapaRealizacao, setEtapaRealizacao] = useState(null);
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
            carregarAtracoesParaEvento(eventoId);

            (async () => {
                try {
                    const etapas = await listarEtapas();
                    const etapa = (etapas || []).find(
                        (e) =>
                            String(e.evento) === String(eventoId) &&
                            e.tipo_etapa === 'REALIZACAO_EVENTO',
                    );
                    setEtapaRealizacao(etapa || null);
                } catch (err) {
                    console.error('erro ao buscar etapas:', err);
                    setEtapaRealizacao(null);
                }
            })();
        }
    }, [eventoId, carregarAtracoesParaEvento]);

    const personalizarInformacoes = (d) => (
        <>
            <Row className="p-0 m-0">
                <Col className="p-0 m-0 fw-bold">{d?.titulo}</Col>
            </Row>
            <Row className="p-0 m-0">
                <Col className="p-0 m-0">
                    {d?.tipo || 'Modalidade'} |{' '}
                    {formatNivelEnsino(d?.nivel_ensino || d?.nivel)}
                </Col>
                <Col className="p-0 m-0">
                    <Link className="text-decoration-none d-flex align-items-center">
                        <BsEyeFill />
                        <span
                            className="ms-2"
                            onClick={() => {
                                setSelectedAtracao(d);
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

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className=" py-4 ">
                <Container
                    fluid
                    className="d-md-flex flex-md-column align-items-md-center gap-3"
                >
                    <Row>
                        <Col>
                            <h1
                                className="fw-bold mt-3 text-center"
                                style={{ color: '#059547' }}
                            >
                                Avaliações
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-md-flex gap-5">
                            <Card
                                corBorda="#003366"
                                largura={!isMobile ? 400 : undefined}
                                altura={110}
                            >
                                <Container className="d-flex justify-content-evenly mt-3 pt-3 pt-md-0">
                                    <Row className="d-flex flex-column">
                                        <Col>
                                            <span>PARA AVALIAR</span>
                                        </Col>
                                        <Col>
                                            <span className="fw-bold fs-1">
                                                {Array.isArray(atracoes)
                                                    ? atracoes.filter(
                                                          (a) =>
                                                              a.status !==
                                                                  'avaliada' &&
                                                              a.avaliacao_disponivel,
                                                      ).length
                                                    : 0}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="d-flex align-items-center">
                                            <FaPenNib
                                                size={45}
                                                color="#003366"
                                            />
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                            <Card
                                corBorda="#059547"
                                largura={!isMobile ? 400 : undefined}
                                altura={110}
                            >
                                <Container className="d-flex justify-content-evenly mt-3  pt-3 pt-md-0">
                                    <Row className="d-flex flex-column">
                                        <Col>
                                            <span className="">
                                                AVALIAÇÕES CONCLUÍDAS
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="fw-bold fs-1">
                                                {Array.isArray(atracoes)
                                                    ? atracoes.filter(
                                                          (a) =>
                                                              a.status ===
                                                              'avaliada',
                                                      ).length
                                                    : 0}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="">
                                        <Col className="d-flex align-items-center">
                                            <MdCheckCircle
                                                size={50}
                                                color="#059547"
                                            />
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="w-75 mt-4 ps-4">
                        <Col>
                            <span className="text-start fw-bold fs-4">
                                Minhas Avaliações
                            </span>
                        </Col>
                    </Row>
                    <Row
                        className={`${
                            !isMobile ? 'w-75' : 'w-100'
                        } px-4 overflow-auto`}
                    >
                        <Col>
                            <Tabela
                                className="rounded-4 "
                                cabecarioCor={'#E9ECEF'}
                                style={{
                                    overflow: 'hidden',
                                }}
                                cabecarios={[
                                    'Título do Trabalho',
                                    'Prazo',
                                    'Status',
                                    'Ação',
                                ]}
                                dados={(atracoes || []).map((a) => {
                                    const prazoTexto = (() => {
                                        if (
                                            !etapaRealizacao ||
                                            !etapaRealizacao.data_fim
                                        )
                                            return '-';
                                        const now = new Date();
                                        // if current time is before the start of the etapa, show start date
                                        if (
                                            etapaRealizacao.data_inicio &&
                                            new Date(
                                                etapaRealizacao.data_inicio,
                                            ) > now
                                        ) {
                                            return new Date(
                                                etapaRealizacao.data_inicio,
                                            ).toLocaleDateString('pt-BR');
                                        }
                                        const fim = new Date(
                                            etapaRealizacao.data_fim,
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
                                        const diffDays = Math.ceil(
                                            diffMs / oneDayMs,
                                        );
                                        return `${diffDays} dias restantes`;
                                    })();

                                    const statusTag =
                                        a.status === 'avaliada' ? (
                                            <Tag
                                                corFundo={'#059547'}
                                                corTexto={'#fff'}
                                                texto={'Avaliada'}
                                            />
                                        ) : a.avaliacao_disponivel ? (
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

                                    const podeAvaliar =
                                        !!a.avaliacao_disponivel &&
                                        a.status !== 'avaliada';
                                    const podeVer =
                                        !!a.avaliacao_id ||
                                        a.status === 'avaliada';
                                    const now = new Date();
                                    const etapaOpen =
                                        !!etapaRealizacao &&
                                        etapaRealizacao.data_inicio &&
                                        new Date(etapaRealizacao.data_inicio) <=
                                            now &&
                                        new Date(etapaRealizacao.data_fim) >=
                                            now;
                                    const etapaBefore =
                                        !!etapaRealizacao &&
                                        etapaRealizacao.data_inicio &&
                                        new Date(etapaRealizacao.data_inicio) >
                                            now;
                                    const podeEditar =
                                        !!a.avaliacao_id && etapaOpen;

                                    return [
                                        {
                                            value: personalizarInformacoes(a),
                                            style: { width: '35%' },
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
                                                    className="btn btn-primary"
                                                    disabled={
                                                        etapaBefore ||
                                                        (!podeAvaliar &&
                                                            !podeVer)
                                                    }
                                                    onClick={() => {
                                                        if (etapaBefore) return;
                                                        if (podeAvaliar)
                                                            return navigate(
                                                                `/avaliar_atracao?atracao_id=${a.id}`,
                                                            );
                                                        if (podeVer)
                                                            return navigate(
                                                                `/avaliar_atracao?atracao_id=${a.id}&avaliacao_id=${a.avaliacao_id}`,
                                                            );
                                                    }}
                                                >
                                                    {etapaBefore
                                                        ? 'Avaliação ainda indisponível'
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
                    selectedAtracao
                        ? selectedAtracao.titulo
                        : 'Detalhes do trabalho'
                }
                show={modalAtivo}
                onFechar={() => {
                    setModalAtivo(false);
                    setSelectedAtracao(null);
                }}
                children={
                    <>
                        <Container>
                            <Row>
                                <Col>
                                    <h1>{selectedAtracao?.titulo}</h1>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <Tag
                                        texto={
                                            formatAreaConhecimento(
                                                selectedAtracao?.area_conhecimento,
                                            ) || 'Área'
                                        }
                                        corFundo="#00f"
                                        corTexto="#000"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <span className="fw-bold">Resumo</span>
                                    <p>{selectedAtracao?.resumo}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <span className="fw-bold">
                                        Palavras-chave
                                    </span>
                                    <p>{selectedAtracao?.palavras_chave}</p>
                                </Col>
                            </Row>
                        </Container>
                    </>
                }
            />

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
