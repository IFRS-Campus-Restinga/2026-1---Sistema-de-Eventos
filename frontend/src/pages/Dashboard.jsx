import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BiSolidEdit } from 'react-icons/bi';
import { TbMapPinFilled } from 'react-icons/tb';
import { TbMail } from 'react-icons/tb';
import { TbFileCertificate } from 'react-icons/tb';
import { RiTeamFill } from 'react-icons/ri';
import { IoCalendarOutline } from 'react-icons/io5';
import { FaCalendarDay } from 'react-icons/fa';
import { HiOutlineTicket } from 'react-icons/hi';
import { HiOutlineSwitchHorizontal } from 'react-icons/hi';
import { FaRegFileAlt } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { LuFileCheck2 } from 'react-icons/lu';
import { GoTasklist } from 'react-icons/go';
import { LuStar } from 'react-icons/lu';
import { BsPersonFillCheck } from 'react-icons/bs';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { BiPaperPlane } from 'react-icons/bi';
import { FaCogs } from 'react-icons/fa';
import { HiOutlineClipboardList } from 'react-icons/hi';

import {
    clearSelectedEventoId,
    getSelectedEventoId,
    setSelectedEventoId,
    adicionarEventoRecenteAdminId,
} from '../utils/selectedEvento';
import { getDashboardEvento } from '../services/dashboardService';

export default function Dashboard() {
    const { id: eventoId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Inicia como true para evitar flashes de tela vazia
    const [erro, setErro] = useState('');

    const [dashboard, setDashboard] = useState(null);

    const formatarData = (valor) => {
        if (!valor) {
            return '';
        }

        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) {
            return '';
        }

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(data);
    };

    const formatarStatus = (status) => {
        if (!status) {
            return '';
        }

        const statusLabels = {
            EM_ANDAMENTO: 'Em andamento',
            ENCERRADO: 'Encerrado',
            EM_PLANEJAMENTO: 'Em planejamento',
        };

        if (statusLabels[status]) {
            return statusLabels[status];
        }

        return status
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letra) => letra.toUpperCase());
    };

    const possuiEtapaRealizacao = dashboard?.evento?.etapas?.some(
        (etapa) => etapa.tipo_etapa === 'REALIZACAO_EVENTO',
    );

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
            adicionarEventoRecenteAdminId(eventoId);
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

    return (
        <>
            <div className="d-flex flex-column min-vh-100 bg-light">
                <NavBar />
                {console.log(dashboard)}

                <main
                    className="flex-fill py-4 mx-auto w-100"
                    style={{ maxWidth: '1400px' }}
                >
                    <Container>
                        <Row>
                            <Col>
                                <Row
                                    className="rounded-4 bg-success p-3"
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(to right,#17882c 0,#00510f 100%)',
                                    }}
                                >
                                    <Col
                                        sm={1}
                                        className="d-flex flex-column flex-md-row"
                                    >
                                        <div
                                            className="px-3  d-flex justify-content-center align-items-center rounded-3"
                                            style={{ background: '#ffffff26' }}
                                        >
                                            <IoCalendarOutline
                                                size={30}
                                                color="white"
                                            />
                                        </div>
                                    </Col>
                                    <Col className="text-white d-flex flex-column justify-content-start">
                                        <p className="m-0 fw-bold fs-4">
                                            {dashboard?.evento?.nome}
                                        </p>
                                        <div className="d-flex flex-column flex-md-row gap-3">
                                            <span className="d-flex align-items-center">
                                                <FaCalendarDay className="me-2" />{' '}
                                                {formatarData(
                                                    dashboard?.evento?.inicio,
                                                )}
                                                {' – '}
                                                {formatarData(
                                                    dashboard?.evento?.fim,
                                                )}
                                            </span>
                                            <span className="d-flex align-items-center">
                                                <TbMapPinFilled className="me-2" />{' '}
                                                {dashboard?.evento?.local}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col
                                        sm={2}
                                        className="d-flex  align-items-center"
                                    >
                                        <div className="d-flex flex-column align-items-center">
                                            <span
                                                className="px-3 py-1 text-white rounded-5 text-center mb-2"
                                                style={{
                                                    background: '#ffffff26',
                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                }}
                                            >
                                                {formatarStatus(
                                                    dashboard?.evento
                                                        ?.status_evento,
                                                )}
                                            </span>
                                            <Link
                                                to="/listar_eventos"
                                                className="rounded-4 btn btn-light text-white"
                                                style={{
                                                    background: '#ffffff26',
                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                }}
                                            >
                                                <HiOutlineSwitchHorizontal className="me-1" />
                                                Trocar de evento
                                            </Link>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        {/* Cards */}
                        <Row className="d-flex flex-column flex-md-row gap-3 mt-3">
                            <Col
                                className="bg-white rounded-4 py-3 px-2"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.09)',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Row>
                                    <Col className="d-flex flex-column ms-3 text-secondary">
                                        <span className="d-flex align-items-center">
                                            <HiOutlineTicket className="me-2" />
                                            inscrições
                                        </span>
                                        <span className="fw-bold fs-3 text-black">
                                            {dashboard?.metricas
                                                ?.total_inscricoes ||
                                                'sem inscrições'}
                                        </span>
                                        <span>No evento</span>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className="bg-white rounded-4 py-3 px-2"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.09)',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Row>
                                    <Col className="d-flex flex-column ms-3 text-secondary">
                                        <span className="d-flex align-items-center">
                                            <FaRegFileAlt className="me-2" />
                                            Submissões
                                        </span>
                                        <span className="fw-bold fs-3 text-black">
                                            {dashboard?.metricas
                                                ?.total_submissoes ||
                                                'sem atrações'}
                                        </span>
                                        <span>Submetidas</span>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className="bg-white rounded-4 py-3 px-2"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.09)',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Row>
                                    <Col className="d-flex flex-column ms-3 text-secondary">
                                        <span className="d-flex align-items-center">
                                            <HiOutlineTicket className="me-2" />
                                            atrações
                                        </span>
                                        <span className="fw-bold fs-3 text-black">
                                            {dashboard?.metricas
                                                ?.total_atracoes ||
                                                'sem atrações'}
                                        </span>
                                        <span>Homologadas</span>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        {/* Configurações do evento */}
                        <Row className="mt-3">
                            <Col
                                className="bg-white rounded-4"
                                style={{ border: '1px solid rgba(0,0,0,0.09)' }}
                            >
                                <Row className="p-2">
                                    <Col className="d-flex flex-row align-items-center px-2 pt-2 ms-2">
                                        <div
                                            className="p-2 d-flex justify-content-center align-items-center rounded-3 me-2"
                                            style={{ background: '#e8f5ed' }}
                                        >
                                            <IoMdSettings
                                                size={20}
                                                color="green"
                                            />
                                        </div>
                                        <span className="fw-semibold">
                                            Configurações do Evento
                                        </span>
                                    </Col>
                                </Row>
                                <hr />
                                {/* Links */}
                                <Row>
                                    <Col className="bg-white rounded-4 py-3 px-2">
                                        <Row
                                            className="d-flex flex-column flex-md-row px-3 flex-wrap"
                                            style={{ gap: '1rem' }}
                                        >
                                            <Col
                                                className="d-flex flex-column p-0 text-secondary"
                                                style={{
                                                    flex: '1 1 calc(25% - 1rem)',
                                                }}
                                            >
                                                <Link
                                                    className="d-flex align-items-center p-3 btn btn-light"
                                                    to={
                                                        eventoId
                                                            ? `/editar_evento/${eventoId}`
                                                            : '#'
                                                    }
                                                >
                                                    <BiSolidEdit
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Editar informações
                                                </Link>
                                            </Col>
                                            <Col
                                                className="d-flex flex-column p-0 text-secondary"
                                                style={{
                                                    flex: '1 1 calc(25% - 1rem)',
                                                }}
                                            >
                                                <Link
                                                    className="d-flex align-items-center p-3 btn btn-light"
                                                    style={{
                                                        opacity:
                                                            !possuiEtapaRealizacao
                                                                ? 0.65
                                                                : 1,
                                                        cursor: !possuiEtapaRealizacao
                                                            ? 'not-allowed'
                                                            : 'pointer',
                                                    }}
                                                    title={
                                                        !possuiEtapaRealizacao
                                                            ? 'O evento precisa possuir uma etapa de realização'
                                                            : ''
                                                    }
                                                    to={
                                                        possuiEtapaRealizacao &&
                                                        eventoId
                                                            ? `/dashboard/${eventoId}/sessao_atribuir_data`
                                                            : '#'
                                                    }
                                                    onClick={(e) => {
                                                        if (
                                                            !possuiEtapaRealizacao
                                                        ) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <IoCalendarOutline
                                                        size={20}
                                                        className="me-2"
                                                        color={
                                                            possuiEtapaRealizacao
                                                                ? 'green'
                                                                : 'gray'
                                                        }
                                                    />
                                                    Configurar programação
                                                </Link>
                                            </Col>
                                            <Col
                                                className="d-flex flex-column p-0 text-secondary"
                                                style={{
                                                    flex: '1 1 calc(25% - 1rem)',
                                                }}
                                            >
                                                <Link
                                                    className="d-flex align-items-center p-3 btn btn-light"
                                                    to={
                                                        '/listar_locais_espacos'
                                                    }
                                                >
                                                    <TbMapPinFilled
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Definir locais de trabalho
                                                </Link>
                                            </Col>
                                            <Col
                                                className="d-flex flex-column p-0 text-secondary"
                                                style={{
                                                    flex: '1 1 calc(25% - 1rem)',
                                                }}
                                            >
                                                <Link
                                                    className="d-flex align-items-center p-3 btn btn-light"
                                                    to={
                                                        eventoId
                                                            ? `/atribuir_organizador?eventoId=${eventoId}`
                                                            : '#'
                                                    }
                                                >
                                                    <RiTeamFill
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Gerenciar organizadores
                                                </Link>
                                            </Col>
                                            <Col
                                                className="d-flex flex-column p-0 text-secondary"
                                                style={{
                                                    flex: '1 1 calc(25% - 1rem)',
                                                }}
                                            >
                                                <Link
                                                    className="d-flex align-items-center p-3 btn btn-light"
                                                    to={
                                                        eventoId
                                                            ? `/atribuir_coordenador?eventoId=${eventoId}`
                                                            : '#'
                                                    }
                                                >
                                                    <FaCogs
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Definir Coordenadores
                                                </Link>
                                            </Col>
                                            <Col
                                                className="d-flex flex-column p-0 text-secondary"
                                                style={{
                                                    flex: '1 1 calc(25% - 1rem)',
                                                }}
                                            >
                                                <Link
                                                    className="d-flex align-items-center p-3 btn btn-light"
                                                    to={`/listar_inscritos_evento?eventoId=${eventoId}`}
                                                >
                                                    <HiOutlineClipboardList
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Lista de inscritos
                                                </Link>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col className="d-flex flex-md-row flex-column p-0 d-flex flex-row gap-3">
                                {/* Submissoes */}
                                <Col
                                    className="bg-white rounded-4 "
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.09)',
                                    }}
                                >
                                    <Row className="p-2 ">
                                        <Col className="d-flex flex-row align-items-center px-2 pt-2 ms-2">
                                            <div
                                                className="p-2 d-flex justify-content-center align-items-center rounded-3 me-2"
                                                style={{
                                                    background: '#e8f5ed',
                                                }}
                                            >
                                                <LuFileCheck2
                                                    size={20}
                                                    color="green"
                                                />
                                            </div>
                                            <span className="fw-semibold">
                                                Submissões e Atrações
                                            </span>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row
                                        className="px-4 pb-3 d-flex flex-column flex-md-row flex-wrap"
                                        style={{ gap: '1rem' }}
                                    >
                                        <Col
                                            className="p-0"
                                            style={{
                                                flex: '1 1 calc(50% - 1rem)',
                                            }}
                                        >
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-light"
                                                to={'/listar_submissoes'}
                                            >
                                                <GoTasklist
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Gerenciar Submissões
                                            </Link>
                                        </Col>
                                        <Col
                                            className="p-0"
                                            style={{
                                                flex: '1 1 calc(50% - 1rem)',
                                            }}
                                        >
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-success"
                                                to={'/adicionar_submissao'}
                                            >
                                                + Adicionar Submissão
                                            </Link>
                                        </Col>
                                        <Col
                                            className="p-0"
                                            style={{
                                                flex: '1 1 calc(50% - 1rem)',
                                            }}
                                        >
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-light"
                                                to={'/listar_atracoes'}
                                            >
                                                <GoTasklist
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Gerenciar Atrações
                                            </Link>
                                        </Col>
                                        <Col
                                            className="p-0"
                                            style={{
                                                flex: '1 1 calc(50% - 1rem)',
                                            }}
                                        >
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-success"
                                                to={'/adicionar_atracao'}
                                            >
                                                + Adicionar Atração
                                            </Link>
                                        </Col>
                                    </Row>
                                </Col>
                                {/* Avaliações */}
                                <Col
                                    className="bg-white rounded-4 "
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.09)',
                                    }}
                                >
                                    <Row className="p-2 ">
                                        <Col className="d-flex flex-row align-items-center px-2 pt-2 ms-2">
                                            <div
                                                className="p-2 d-flex justify-content-center align-items-center rounded-3 me-2"
                                                style={{
                                                    background: '#e8f5ed',
                                                }}
                                            >
                                                <LuStar
                                                    size={20}
                                                    color="green"
                                                />
                                            </div>
                                            <span className="fw-semibold">
                                                Avaliações
                                            </span>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row
                                        className="px-4 pb-3 d-flex flex-column flex-md-row flex-wrap"
                                        style={{ gap: '1rem' }}
                                    >
                                        <Col
                                            className="p-0"
                                            style={{
                                                flex: '1 1 calc(50% - 1rem)',
                                            }}
                                        >
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-light"
                                                to={
                                                    eventoId
                                                        ? `/gerenciar_avaliadores_submissoes?evento_id=${eventoId}`
                                                        : '#'
                                                }
                                            >
                                                <BsPersonFillCheck
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Definir Avaliadores Submissão
                                            </Link>
                                        </Col>
                                        <Col
                                            className="p-0"
                                            style={{
                                                flex: '1 1 calc(50% - 1rem)',
                                            }}
                                        >
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-light"
                                                to={
                                                    eventoId
                                                        ? `/gerenciar_avaliadores_atracoes?evento_id=${eventoId}`
                                                        : '#'
                                                }
                                            >
                                                <BsPersonFillCheck
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Definir Avaliadores Atração
                                            </Link>
                                        </Col>
                                        <Col
                                            className="p-0"
                                            style={{
                                                flex: '1 1 calc(50% - 1rem)',
                                            }}
                                        >
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-success"
                                                to={'/listar_modalidades'}
                                            >
                                                <AiOutlineUnorderedList
                                                    size={25}
                                                    className="me-2"
                                                    color="white"
                                                />
                                                Gerenciar Modalidades
                                            </Link>
                                        </Col>
                                    </Row>
                                </Col>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col className="d-flex flex-row p-0 d-flex flex-row gap-3">
                                <Col
                                    className="bg-white rounded-4 "
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.09)',
                                    }}
                                >
                                    <Row className="p-2 ">
                                        <Col className="d-flex flex-row align-items-center px-2 pt-2 ms-2">
                                            <div
                                                className="p-2 d-flex justify-content-center align-items-center rounded-3 me-2"
                                                style={{
                                                    background: '#e8f5ed',
                                                }}
                                            >
                                                <TbMail
                                                    size={20}
                                                    color="green"
                                                />
                                            </div>
                                            <span className="fw-semibold">
                                                Comunicação e certificados
                                            </span>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className="p-3 d-flex flex-column flex-md-row gap-md-0 gap-3 flex-wrap">
                                        <Col sm={6}>
                                            <Link
                                                className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-light"
                                                to={
                                                    eventoId
                                                        ? `/dashboard/${eventoId}/enviar_emails`
                                                        : '#'
                                                }
                                            >
                                                <BiPaperPlane
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Enviar e-mails
                                            </Link>
                                        </Col>
                                        <Col sm={6}>
                                            <Link className="d-flex align-items-center p-3 justify-content-center w-100 btn btn-light">
                                                <TbFileCertificate
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Emitir Certificados
                                            </Link>
                                        </Col>
                                    </Row>
                                </Col>
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
        </>
    );
}
