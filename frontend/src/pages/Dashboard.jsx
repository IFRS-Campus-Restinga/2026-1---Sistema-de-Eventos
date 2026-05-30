import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BarrasStatus from '../components/barras_status/BarrasStatus';
import MenuColuna from '../components/menu_coluna/MenuColuna';
import { PiChecks } from 'react-icons/pi';
import { BiSolidEdit } from 'react-icons/bi';
import { TbMapPinFilled } from 'react-icons/tb';
import { TbMail } from 'react-icons/tb';
import { TbFileCertificate } from 'react-icons/tb';
import { RiTeamFill } from 'react-icons/ri';
import { IoMdSchool } from 'react-icons/io';
import { RiAddBoxFill } from 'react-icons/ri';
import { IoCalendarOutline } from 'react-icons/io5';
import { MdOutlineArticle, MdAddCircleOutline } from 'react-icons/md';

import { getDashboardEvento } from '../services/dashboardService';
import {
    clearSelectedEventoId,
    getSelectedEventoId,
    setSelectedEventoId,
} from '../utils/selectedEvento';

export default function DashboardEvento() {
    const { id: eventoId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Inicia como true para evitar flashes de tela vazia
    const [erro, setErro] = useState('');
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        async function carregarDashboard() {
            // Se não veio ID na URL, resolve o redirecionamento e interrompe a execução
            if (!eventoId) {
                const eventoSalvo = getSelectedEventoId();
                if (eventoSalvo) {
                    navigate(`/dashboard/${eventoSalvo}`, { replace: true });
                } else {
                    navigate('/listar_eventos', { replace: true });
                }
                return;
            }

            // Define o ID ativo apenas se ele veio na URL
            setSelectedEventoId(eventoId);
            setLoading(true);
            setErro('');

            try {
                const data = await getDashboardEvento(eventoId);
                setDashboard(data);
            } catch (error) {
                console.error('Erro ao buscar dashboard:', error);
                const status = error?.response?.status;

                if (status === 404) {
                    clearSelectedEventoId();
                    navigate('/listar_eventos', { replace: true });
                    return;
                }

                setDashboard(null);
                setErro(
                    error?.response?.data?.detail ||
                        error?.message ||
                        'Erro ao carregar os dados do painel do evento no servidor.',
                );
            } finally {
                setLoading(false);
            }
        }

        carregarDashboard();
    }, [eventoId, navigate]);

    // Fallbacks seguros para evitar que o código quebre caso a API traga objetos vazios
    const metricas = dashboard?.metricas || {};
    const totalAtracoes = metricas.total_atracoes || 0;
    const semAvaliador = metricas.semAvaliador || 0;
    const desistencias = metricas.desistencias || 0;
    const taxaEvasao = metricas.taxaEvasao || 0;

    const dados = useMemo(
        () =>
            (dashboard?.areas || []).map((area) => ({
                titulo: area.nome,
                valorAtual: area.avaliados || 0,
                total: area.total || 0,
                textoFim: 'Avaliados',
            })),
        [dashboard],
    );

    const links = useMemo(
        () => [
            {
                texto: 'Homologar e Definir Avaliadores de Trabalhos',
                icone: <PiChecks color="#14AE5C" size={20} />,
                to: eventoId
                    ? `/gerenciar_avaliadores_atracoes?evento_id=${eventoId}`
                    : '#',
            },
            {
                texto: 'Editar Informações do Evento',
                icone: <BiSolidEdit color="#727272" size={20} />,
                to: eventoId ? `/editar_evento/${eventoId}` : '#',
            },
            {
                texto: 'Definir Locais de Trabalhos',
                icone: <TbMapPinFilled color="#f00" size={20} />,
                to: '/listar_locais_espacos',
            },
            {
                texto: 'Enviar Emails',
                icone: <TbMail color="#0D99FF" size={20} />,
                to: eventoId ? `/dashboard/${eventoId}/enviaremails` : '#',
            },
            {
                texto: 'Emitir Certificados',
                icone: <TbFileCertificate color="#FFCD29" size={20} />,
                to: '#',
            },
            {
                texto: 'Gerenciar Organizadores',
                icone: <RiTeamFill color="#00A44B" size={20} />,
                to: eventoId
                    ? `/atribuir_organizador?eventoId=${eventoId}`
                    : '#',
            },
            {
                texto: 'Adicionar um Novo Evento',
                icone: <RiAddBoxFill color="#016B3F" size={20} />,
                to: '/adicionar_evento',
            },
            {
                texto: 'Gerenciar Modalidades',
                icone: <IoMdSchool color="#00f" size={20} />,
                to: '/listar_modalidades',
            },
            {
                texto: 'Definir Sessões da Programação do Evento',
                icone: (
                    <IoCalendarOutline color="rgb(223, 24, 146)" size={20} />
                ),
                to: eventoId
                    ? `/dashboard/${eventoId}/sessao_atribuir_data`
                    : '#',
            },
            {
                texto: 'Gerenciar Submissões',
                icone: <MdOutlineArticle color="#6200EA" size={20} />,
                to: '/listar_atracoes',
            },
            {
                texto: 'Adicionar Submissão',
                icone: <MdAddCircleOutline color="#6200EA" size={20} />,
                to: '/adicionar_atracao',
            },
            {
                texto: 'Listrar Atrações Inscritíveis',
                icone: <MdOutlineArticle color="#10c7ff" size={20} />,
                to: eventoId ? `/inscrever_atracoes/${eventoId}` : '#',
            },
        ],
        [eventoId],
    );

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main
                className="flex-fill py-4 mx-auto w-100"
                style={{ maxWidth: '1400px' }}
            >
                <Container fluid>
                    {loading ? (
                        // ✅ Feedback Visual de Carregamento Preventivo
                        <div className="text-center py-5">
                            <Spinner
                                animation="border"
                                variant="primary"
                                className="mb-2"
                            />
                            <p className="text-muted fw-medium">
                                Sincronizando dados do painel...
                            </p>
                        </div>
                    ) : erro ? (
                        // ✅ Alerta Amigável se o Backend falhar por falta de dados vinculados
                        <div className="py-4">
                            <Alert variant="danger" className="shadow-sm">
                                <Alert.Heading>
                                    Atenção, Organizador
                                </Alert.Heading>
                                <p className="mb-0">{erro}</p>
                            </Alert>
                            <div className="text-center mt-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/listar_eventos')}
                                >
                                    Voltar para Lista de Eventos
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Row className="mb-4">
                                <Col className="d-flex flex-xl-row justify-content-between align-items-center gap-3 flex-column">
                                    <h2 className="fw-semibold text-xl-start text-center m-0">
                                        Visão Geral do Evento:{' '}
                                        <span className="text-primary">
                                            {dashboard?.evento?.nome}
                                        </span>
                                    </h2>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        <Button
                                            variant="secondary"
                                            as={Link}
                                            to="/listar_eventos"
                                        >
                                            Mudar de Evento
                                        </Button>
                                        <Button
                                            variant="primary"
                                            as={Link}
                                            to="#"
                                        >
                                            Analisar Usuários
                                        </Button>
                                        <Button
                                            variant="success"
                                            style={{
                                                backgroundColor: '#05C978',
                                                borderColor: '#05C978',
                                            }}
                                            as={Link}
                                            to="/listar_inscritos_evento"
                                        >
                                            Inscrições Evento
                                        </Button>
                                        <Button
                                            variant="success"
                                            as={Link}
                                            to={
                                                eventoId
                                                    ? `/atribuir_coordenador?eventoId=${eventoId}`
                                                    : '#'
                                            }
                                        >
                                            Coordenadores
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="g-4 mb-4">
                                <Col xs={12} md={4}>
                                    <Card
                                        corBorda="#003366"
                                        largura="100%"
                                        altura={180}
                                    >
                                        <Container className="p-3">
                                            <span className="fs-6 fw-semibold text-secondary d-block mb-3">
                                                TOTAL DE SUBMISSÕES
                                            </span>
                                            <span className="fw-bold fs-1 d-block mb-2">
                                                {totalAtracoes}
                                            </span>
                                            <span className="fw-bold small text-success">
                                                ⬆ 12% vs ano passado
                                            </span>
                                        </Container>
                                    </Card>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Card
                                        corBorda="#FF0000"
                                        largura="100%"
                                        altura={180}
                                    >
                                        <Container className="p-3">
                                            <span className="fs-6 fw-semibold text-secondary d-block mb-3">
                                                SEM AVALIADOR (CRÍTICO)
                                            </span>
                                            <span className="fw-bold fs-1 text-danger d-block mb-2">
                                                {semAvaliador}
                                            </span>
                                            <span className="fw-bold small text-muted">
                                                Requer ação imediata
                                            </span>
                                        </Container>
                                    </Card>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Card
                                        corBorda="#727272"
                                        largura="100%"
                                        altura={180}
                                    >
                                        <Container className="p-3">
                                            <span className="fs-6 fw-semibold text-secondary d-block mb-3">
                                                DESISTÊNCIAS
                                            </span>
                                            <span className="fw-bold fs-1 text-secondary d-block mb-2">
                                                {desistencias}
                                            </span>
                                            <span className="fw-bold small text-secondary">
                                                Taxa de evasão {taxaEvasao}%
                                            </span>
                                        </Container>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-4">
                                <Col lg={7} xs={12}>
                                    <BarrasStatus
                                        titulo="Status das Avaliações por Área"
                                        dados={dados}
                                    />
                                </Col>
                                <Col lg={5} xs={12}>
                                    <MenuColuna titulo="Ações" itens={links} />
                                </Col>
                            </Row>
                        </>
                    )}
                </Container>
            </main>

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
