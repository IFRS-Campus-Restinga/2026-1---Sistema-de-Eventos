import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { Link, useParams } from 'react-router-dom';
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

import { getDashboardEvento } from '../services/dashboardService';

export default function DashboardEvento({}) {
    // comentei pra n dar conflito, mas meio q ficou assim, agr ele funciona com dados reais. -Breno

    // //Pegar da api, apenas placeholder
    // const { totalSubmissoes, semAvaliador, desistencias } = {
    //     totalSubmissoes: 87,
    //     semAvaliador: 2,
    //     desistencias: 3,
    // };

    // //Pegar da api, apenas placeholder
    // const dados = [
    //     {
    //         titulo: 'Ciências Exatas e da Terra',
    //         valorAtual: 25,
    //         total: 30,
    //         textoFim: 'Avaliados',
    //     },
    //     {
    //         titulo: 'Ciências Humanas',
    //         valorAtual: 12,
    //         total: 30,
    //         textoFim: 'Avaliados',
    //     },
    //     {
    //         titulo: 'Linguística, Letras e Artes',
    //         valorAtual: 20,
    //         total: 20,
    //         textoFim: 'Avaliados',
    //     },
    //     {
    //         titulo: 'Linguística, Letras e Artes',
    //         valorAtual: 20,
    //         total: 20,
    //         textoFim: 'Avaliados',
    //     },
    //     {
    //         titulo: 'Linguística, Letras e Artes',
    //         valorAtual: 20,
    //         total: 20,
    //         textoFim: 'Avaliados',
    //     },
    // ];

    const { id: eventoId } = useParams();
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        async function carregarDashboard() {
            if (!eventoId) {
                setErro('Selecione um evento para visualizar o dashboard.');
                setDashboard(null);
                return;
            }

            setLoading(true);
            setErro('');
            try {
                const data = await getDashboardEvento(eventoId);
                setDashboard(data);
            } catch (error) {
                setDashboard(null);
                setErro(
                    error?.message || 'Erro ao carregar dashboard do evento.',
                );
            } finally {
                setLoading(false);
            }
        }

        carregarDashboard();
    }, [eventoId]);

    const metricas = dashboard?.metricas || {};
    const totalSubmissoes = metricas.totalSubmissoes || 0;
    const semAvaliador = metricas.semAvaliador || 0;
    const desistencias = metricas.desistencias || 0;
    const taxaEvasao = metricas.taxaEvasao || 0;

    const dados = useMemo(
        () =>
            (dashboard?.areas || []).map((area) => ({
                titulo: area.nome,
                valorAtual: area.avaliados,
                total: area.total,
                textoFim: 'Avaliados',
            })),
        [dashboard],
    );

    const links = [
        {
            texto: 'Homologar e Definir Avaliadores de Trabalhos',
            icone: <PiChecks color="#14AE5C" size={20} />,
            to: '#',
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
            to: `/dashboard/${eventoId}/enviaremails`,
        },
        {
            texto: 'Emitir Certificados',
            icone: <TbFileCertificate color="#FFCD29" size={20} />,
            to: '#',
        },
        {
            texto: 'Gerenciar Organizadores',
            icone: <RiTeamFill color="#00A44B" size={20} />,
            to: '/atribuir_organizador',
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
            icone: <IoCalendarOutline color="rgb(223, 24, 146)" size={20} />,
            to: '/sessao_atribuir_data',
            state: { eventoId },
        },
    ];

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4 mx-auto">
                <Container fluid>
                    <Row>
                        <Col className="d-flex flex-xl-row gap-5 flex-column">
                            <h2 className="fw-semibold text-center">
                                Visão Geral do Evento: {dashboard?.evento?.nome}
                            </h2>
                            <div className="d-flex flex-xl-row flex-column gap-3">
                                <Button
                                    variant="secondary"
                                    as={Link}
                                    to="/listar_eventos"
                                    className="d-flex align-items-center justify-content-center"
                                >
                                    Mudar de Evento
                                </Button>
                                <Button
                                    variant="primary"
                                    as={Link}
                                    to="#"
                                    className="d-flex align-items-center justify-content-center"
                                >
                                    Analisar Usuários
                                </Button>
                                <Button
                                    variant="success"
                                    style={{ background: '#05C978' }}
                                    as={Link}
                                    to="/listar_inscritos_evento"
                                    className="d-flex align-items-center border-0 justify-content-center"
                                >
                                    Inscrições Evento
                                </Button>
                                <Button
                                    variant="success"
                                    as={Link}
                                    to={
                                        eventoId
                                            ? `/atribuirCoordenador?eventoId=${eventoId}`
                                            : '#'
                                    }
                                    className="d-flex align-items-center justify-content-center"
                                >
                                    Coordenadores
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-xl-flex flex-xl-row d-none gap-5 mt-4">
                            <Card corBorda="#003366" largura={400} altura={200}>
                                <Container className="px-4 pt-4">
                                    <Row>
                                        <Col>
                                            <span className="fs-6 fw-semibold text-secondary">
                                                TOTAL DE SUBMISSÕES
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                            <span className="fw-bold fs-1">
                                                {totalSubmissoes || 0}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                            <span className="fw-bold fs-6 text-success">
                                                ⬆ 12% vs ano passado
                                            </span>
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                            <Card corBorda="#FF0000" largura={400} altura={200}>
                                <Container className="px-4 pt-4">
                                    <Row>
                                        <Col>
                                            <span className="fs-6 fw-semibold text-secondary">
                                                SEM AVALIADOR (CRÍTICO)
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                            <span className="fw-bold fs-1 text-danger">
                                                {semAvaliador || 0}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                            <span className="fw-bold fs-6 text-secondary">
                                                Requer ação imediata
                                            </span>
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                            <Card corBorda="#727272" largura={400} altura={200}>
                                <Container className="px-4 pt-4">
                                    <Row>
                                        <Col>
                                            <span className="fs-6 fw-semibold text-secondary">
                                                DESISTÊNCIAS
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                            <span className="fw-bold fs-1 text-secondary">
                                                {desistencias || 0}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                            <span className="fw-bold fs-6 text-secondary">
                                                Taxa de evasão {taxaEvasao}%
                                            </span>
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-5 d-flex flex-lg-row flex-column">
                        <Col xl={7} sm={0}>
                            <BarrasStatus
                                titulo="Status das Avaliações por Área"
                                dados={dados}
                            />
                        </Col>
                        <Col className="mt-3 mt-xl-0">
                            <MenuColuna titulo="Ações" itens={links} />
                        </Col>
                    </Row>
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
