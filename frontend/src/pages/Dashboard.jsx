import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Badge, Button } from 'react-bootstrap';
import { MdDashboard } from 'react-icons/md';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { Link } from 'react-router-dom';
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

// import { getDashboard } from "../services/dashboardService";

export default function DashboardEvento({}) {
    //Pegar da api, apenas placeholder
    const { totalSubmissoes, semAvaliador, desistencias } = {
        totalSubmissoes: 87,
        semAvaliador: 2,
        desistencias: 3,
    };

    //Pegar da api, apenas placeholder
    const dados = [
        {
            titulo: 'Ciências Exatas e da Terra',
            valorAtual: 25,
            total: 30,
            textoFim: 'Avaliados',
        },
        {
            titulo: 'Ciências Humanas',
            valorAtual: 12,
            total: 30,
            textoFim: 'Avaliados',
        },
        {
            titulo: 'Linguística, Letras e Artes',
            valorAtual: 20,
            total: 20,
            textoFim: 'Avaliados',
        },
        {
            titulo: 'Linguística, Letras e Artes',
            valorAtual: 20,
            total: 20,
            textoFim: 'Avaliados',
        },
        {
            titulo: 'Linguística, Letras e Artes',
            valorAtual: 20,
            total: 20,
            textoFim: 'Avaliados',
        },
    ];

    const links = [
        {
            texto: 'Homologar e Definir Avaliadores de Trabalhos',
            icone: <PiChecks color="#14AE5C" size={20} />,
            to: '#',
        },
        {
            texto: 'Editar Informações do Evento',
            icone: <BiSolidEdit color="#727272" size={20} />,
            to: '#',
        },
        {
            texto: 'Definir Locais de Trabalhos',
            icone: <TbMapPinFilled color="#f00" size={20} />,
            to: '/listarLocaisEspacos',
        },
        {
            texto: 'Enviar Emails',
            icone: <TbMail color="#0D99FF" size={20} />,
            to: '#',
        },
        {
            texto: 'Emitir Certificados',
            icone: <TbFileCertificate color="#FFCD29" size={20} />,
            to: '#',
        },
        {
            texto: 'Gerenciar Grupos',
            icone: <RiTeamFill color="#00A44B" size={20} />,
            to: '/permissoesGrupos',
        },
        {
            texto: 'Adicionar um Novo Evento',
            icone: <RiAddBoxFill color="#016B3F" size={20} />,
            to: '/adicionarEvento',
        },
        {
            texto: 'Adicionar uma Nova Modalidade',
            icone: <IoMdSchool color="#00f" size={20} />,
            to: '/adicionarModalidade',
        },
    ];

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4 mx-auto">
                <Container fluid>
                    <Row>
                        <Col className="d-flex gap-5">
                            <h2 className="fw-semibold">
                                Visão Geral do Evento
                            </h2>
                            <div className="d-flex gap-3">
                                <Button
                                    variant="secondary"
                                    as={Link}
                                    to="/ListarEventos"
                                    className="d-flex align-items-center"
                                >
                                    Mudar de Evento
                                </Button>
                                <Button
                                    variant="primary"
                                    as={Link}
                                    to="#"
                                    className="d-flex align-items-center"
                                >
                                    Analisar Usuários
                                </Button>
                                <Button
                                    variant="success"
                                    style={{ background: '#05C978' }}
                                    as={Link}
                                    to="#"
                                    className="d-flex align-items-center border-0"
                                >
                                    Inscrições Evento
                                </Button>
                                <Button
                                    variant="success"
                                    as={Link}
                                    to="#"
                                    className="d-flex align-items-center"
                                >
                                    Inscrições Atrações
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex gap-5 mt-4">
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
                                                Taxa de evasão 3%
                                            </span>
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col xs={7}>
                            <BarrasStatus
                                titulo="Status das Avaliações por Área"
                                dados={dados}
                            />
                        </Col>
                        <Col>
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
