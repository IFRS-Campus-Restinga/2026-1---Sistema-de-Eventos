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
import { FaCalendarDay } from 'react-icons/fa';
import { MdOutlineArticle, MdAddCircleOutline } from 'react-icons/md';
import { MdPeopleAlt } from 'react-icons/md';
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

export default function Dashboard() {
    return (
        <>
            <div className="d-flex flex-column min-vh-100 bg-light">
                <NavBar />

                <main
                    className="flex-fill py-4 mx-auto w-100"
                    style={{ maxWidth: '1400px' }}
                >
                    <Container fluid>
                        <Row>
                            <Col>
                                <Row className="rounded-4 bg-success p-3">
                                    <Col sm={1} className="d-flex ">
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
                                            Semana Acadêmica IFRS 2026
                                        </p>
                                        <div className="d-flex flex-row gap-3">
                                            <span className="d-flex align-items-center">
                                                <FaCalendarDay className="me-2" />{' '}
                                                10–14 jun. 2026
                                            </span>
                                            <span className="d-flex align-items-center">
                                                <TbMapPinFilled className="me-2" />{' '}
                                                Campus Restinga
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
                                                Em andamento
                                            </span>
                                            <Button
                                                className="rounded-4"
                                                style={{
                                                    background: '#ffffff26',
                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                }}
                                            >
                                                <HiOutlineSwitchHorizontal className="me-1" />
                                                Trocar de evento
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="d-flex gap-3 mt-3">
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
                                            320
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
                                            <HiOutlineTicket className="me-2" />
                                            atrações
                                        </span>
                                        <span className="fw-bold fs-3 text-black">
                                            32
                                        </span>
                                        <span>Homologadas</span>
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
                                            32
                                        </span>
                                        <span>Submetidas</span>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
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
                                <Row>
                                    <Col className="bg-white rounded-4 py-3 px-2">
                                        <Row>
                                            <Col className="d-flex flex-column ms-3 text-secondary">
                                                <Button
                                                    className="d-flex align-items-center p-3"
                                                    variant="light"
                                                >
                                                    <BiSolidEdit
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Editar informações
                                                </Button>
                                            </Col>
                                            <Col className="d-flex flex-column ms-3 text-secondary">
                                                <Button
                                                    className="d-flex align-items-center p-3"
                                                    variant="light"
                                                >
                                                    <IoCalendarOutline
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Definir sessões da
                                                    programação
                                                </Button>
                                            </Col>
                                            <Col className="d-flex flex-column ms-3 text-secondary">
                                                <Button
                                                    className="d-flex align-items-center p-3"
                                                    variant="light"
                                                >
                                                    <TbMapPinFilled
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Definir locais de trabalho
                                                </Button>
                                            </Col>
                                            <Col className="d-flex flex-column ms-3 text-secondary">
                                                <Button
                                                    className="d-flex align-items-center p-3"
                                                    variant="light"
                                                >
                                                    <RiTeamFill
                                                        size={20}
                                                        className="me-2"
                                                        color="green"
                                                    />
                                                    Gerenciar organizadores
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
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
                                                <LuFileCheck2
                                                    size={20}
                                                    color="green"
                                                />
                                            </div>
                                            <span className="fw-semibold">
                                                Submissões
                                            </span>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className="p-3 d-flex flex-wrap">
                                        <Col sm={6}>
                                            <Button
                                                className="d-flex align-items-center p-3 justify-content-center w-100"
                                                variant="light"
                                            >
                                                <GoTasklist
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Gerenciar Submissões
                                            </Button>
                                        </Col>
                                        <Col sm={6}>
                                            <Button
                                                className="d-flex align-items-center p-3 justify-content-center w-100"
                                                variant="success"
                                            >
                                                + Adicionar Submissão
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col
                                    className="bg-white rounded-4 "
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.09)',
                                    }}
                                >
                                    <Row className="p-2">
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
                                                Atrações
                                            </span>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className="p-3 ">
                                        <Col>
                                            <Button
                                                className="d-flex align-items-center p-3 justify-content-center w-100"
                                                variant="light"
                                            >
                                                <BsPersonFillCheck
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Definir Avaliadores
                                            </Button>
                                        </Col>
                                        <Col>
                                            <Button
                                                className="d-flex align-items-center p-3 justify-content-center w-100"
                                                variant="light"
                                            >
                                                <AiOutlineUnorderedList
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Gerenciar Modalidades
                                            </Button>
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
                                    <Row className="p-3 d-flex flex-wrap">
                                        <Col sm={6}>
                                            <Button
                                                className="d-flex align-items-center p-3 justify-content-center w-100"
                                                variant="light"
                                            >
                                                <BiPaperPlane
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Enviar e-mails
                                            </Button>
                                        </Col>
                                        <Col sm={6}>
                                            <Button
                                                className="d-flex align-items-center p-3 justify-content-center w-100"
                                                variant="light"
                                            >
                                                <TbFileCertificate
                                                    size={25}
                                                    className="me-2"
                                                    color="green"
                                                />
                                                Emitir Certificados
                                            </Button>
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
