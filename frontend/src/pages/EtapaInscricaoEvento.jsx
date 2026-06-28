import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    MdPlace, 
    MdInfoOutline, 
    MdArrowForward,
    MdPersonAdd,
    MdEmail,
    MdEventAvailable,
    MdHowToReg
} from 'react-icons/md';
import { FaCalendarAlt as Calendar, FaClock as Clock } from 'react-icons/fa';

import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';

import { buscarEventoPorId } from '../services/eventoService';
import { redirectToLogin } from '../services/authService';
import { setSelectedEventoId } from '../utils/selectedEvento';
import useInscricoesEvento from '../hooks/useInscricoesEvento';

export default function FaseInscricao({ campus = 'Campus Restinga' }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados dos dados do evento
    const [evento, setEvento] = useState(null);
    const [etapaInscricao, setEtapaInscricao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de feedback e modais da inscrição (Idênticos à sua Home)
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

    // Hooks integrados do seu sistema de inscrições
    const {
        criarInscricao,
        usuarioLogado,
        estaInscritoEmEvento,
        obterStatusInscricao,
    } = useInscricoesEvento();

    const verdeDestaque = "#008B47";

    useEffect(() => {
        async function carregarDados() {
            try {
                setLoading(true);
                setError(null);
                
                const dados = await buscarEventoPorId(id);
                setEvento(dados);

                if (dados?.etapas && Array.isArray(dados.etapas)) {
                    const insc = dados.etapas.find(e => 
                        e.tipo_etapa?.toLowerCase().includes('inscricao_publico') || 
                        e.tipo_etapa?.toLowerCase().includes('inscricao') ||
                        e.tipo_etapa_display?.toLowerCase().includes('inscrição')
                    );
                    setEtapaInscricao(insc || null);
                }
            } catch (err) {
                console.error('Erro ao carregar dados da inscrição:', err);
                setError('Não foi possível carregar as informações desta etapa.');
            } finally {
                setLoading(false);
            }
        }
        if (id) carregarDados();
    }, [id]);

    // ✅ Lógica comportamental do botão do protótipo
    const handleDispararInscricao = () => {
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
            eventoId: evento.id,
            nomeEvento: evento?.nome || '',
        });
    };

    const fecharModalConfirmarInscricao = () => {
        setModalConfirmarInscricao({ show: false, eventoId: null, nomeEvento: '' });
    };

    // ✅ Executa o POST da inscrição usando seu hook nativo
    const confirmarInscricao = async () => {
    const { eventoId } = modalConfirmarInscricao;
    fecharModalConfirmarInscricao();

        if (!eventoId) return;

        try {
            await criarInscricao({
                perfil_id: usuarioLogado.perfil_id,
                evento_id: eventoId,
            });

            setAlertaInscricao({
                mensagem: 'Inscrição realizada com sucesso!',
                variacao: 'success',
            });

            setModalPosInscricao({
                show: true,
                eventoId,
                nomeEvento: evento?.nome || '',
            });
        } catch (erro) {
            console.error('Erro detalhado retornado pelo Django:', erro.response?.data);
            
            // ✅ MAPEAMENTO CIRÚRGICO: Captura a chave "mensagem" enviada pelo seu serializer
            const mensagemDjango = erro?.response?.data?.mensagem?.[0];
            const detalheDjango = erro?.response?.data?.detail;
            
            const mensagemFinal = 
                mensagemDjango || 
                detalheDjango || 
                erro?.message || 
                'Erro ao realizar inscrição. Tente novamente.';

            setAlertaInscricao({
                mensagem: mensagemFinal,
                variacao: 'danger',
            });
        }
    };

    const fecharModalPosInscricao = () => {
        setModalPosInscricao({ show: false, eventoId: null, nomeEvento: '' });
    };

    const verAtracoesEvento = () => {
        const { eventoId } = modalPosInscricao;
        fecharModalPosInscricao();
        if (!eventoId) return;
        navigate(`/programacao_evento/${eventoId}`);
    };

    const formatarData = (dataString) => {
        if (!dataString) return '—';
        try {
            const apenasData = dataString.split('T')[0];
            const partes = apenasData.split('-');
            if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
            return '—';
        } catch (e) {
            return '—';
        }
    };

    const jaInscrito = evento ? estaInscritoEmEvento(evento.id) : false;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="success" role="status" />
            </div>
        );
    }

    if (error || !evento) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger p-4" role="alert">
                    <h4 className="alert-heading fw-bold">Opa, tivemos um problema!</h4>
                    <p className="mb-0">{error || 'Evento não encontrado.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-white">
            <NavBar />

            <main className="flex-fill bg-light-subtle">
                {/* HERO SECTION */}
                <section 
                    style={{ backgroundImage: 'linear-gradient(to right, #17882c 0%, #00510f 100%)', color: 'white' }} 
                    className="py-4 shadow-sm"
                >
                    <div className="container">
                        <div className="row align-items-center justify-content-between g-3">
                            <Col md={7}>
                                <h1 className="h2 fw-bold mb-1 text-capitalize">{evento.nome}</h1>
                                <div className="d-flex flex-wrap gap-2 text-white opacity-90 small align-items-center mt-2">
                                    <span className="d-flex align-items-center gap-1 bg-white bg-opacity-10 px-2 py-1 rounded">
                                        <Calendar size={15} /> 
                                        Fase Atual: {etapaInscricao?.tipo_etapa_display || 'Inscrição no Evento'}
                                    </span>
                                    <span className="d-flex align-items-center gap-1 bg-white bg-opacity-10 px-2 py-1 rounded">
                                        <MdPlace size={15} /> 
                                        {evento.local_display?.nome || evento.local?.nome || 'IFRS Campus Restinga'}
                                    </span>
                                    {evento.link_edital && (
                                        <a 
                                            href={evento.link_edital}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white text-decoration-none d-flex align-items-center gap-1 px-2 py-1 rounded fw-semibold"
                                            style={{ 
                                                fontSize: '0.82rem',
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                            }}
                                        >
                                            <MdInfoOutline size={15} className="text-warning" /> Ver Regulamento
                                        </a>
                                    )}
                                </div>
                            </Col>
                            
                        </div>
                    </div>
                </section>

                {/* CONTEÚDO PRINCIPAL DA FASE DE INSCRIÇÃO */}
                <div className="container py-5">
                    <div className="row g-4 justify-content-center">
                        <div className="col-lg-8">
                            
                            {/* CARD DE INFORMAÇÕES DA ETAPA */}
                            <div className="card border shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: verdeDestaque }}>
                                    <MdHowToReg size={24} />
                                    <h2 className="h5 fw-bold m-0">Faça sua inscrição como participante</h2>
                                </div>
                                <p className="text-muted small">
                                    Esse cadastro garante acesso completo à plataforma do evento e é o primeiro passo obrigatório para poder se inscrever nas atrações específicas (palestras, oficinas, minicursos) e acompanhar a programação oficial.
                                </p>

                                {/* BOX DE PRAZOS DA INSCRIÇÃO */}
                                <div className="row g-3 bg-light p-3 rounded border mt-3 mx-0">
                                    <div className="col-sm-6 d-flex align-items-center gap-3">
                                        <div className="p-2 rounded bg-success-subtle text-success">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <span className="text-muted d-block uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>PERÍODO DE INSCRIÇÃO</span>
                                            <span className="fw-bold text-dark">{formatarData(etapaInscricao?.data_inicio)}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 d-flex align-items-center gap-3">
                                        <div className="p-2 rounded bg-danger-subtle text-danger">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <span className="text-muted d-block uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>ENCERRAMENTO</span>
                                            <span className="fw-bold text-dark">{formatarData(etapaInscricao?.data_fim)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEÇÃO PROTÓTIPO: COMO FUNCIONA A INSCRIÇÃO */}
                            <div className="mb-4">
                                <h3 className="h6 fw-bold text-secondary text-uppercase tracking-wider mb-3">Como funciona a inscrição</h3>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div className="card p-3 bg-white border h-100 shadow-sm" style={{ borderRadius: '12px' }}>
                                            <div className="p-2 rounded bg-light text-success w-fit mb-2">
                                                <MdPersonAdd size={20} />
                                            </div>
                                            <h4 className="h6 fw-bold text-dark mb-1">1. Crie seu cadastro</h4>
                                            <p className="text-muted m-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                Informe seus dados pessoais e de vínculo institucional na plataforma.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card p-3 bg-white border h-100 shadow-sm" style={{ borderRadius: '12px' }}>
                                            <div className="p-2 rounded bg-light text-success w-fit mb-2">
                                                <MdEmail size={20} />
                                            </div>
                                            <h4 className="h6 fw-bold text-dark mb-1">2. Confirme sua inscrição</h4>
                                            <p className="text-muted m-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                Você recebe a confirmação de inscrição no evento diretamente por e-mail.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card p-3 bg-white border h-100 shadow-sm" style={{ borderRadius: '12px' }}>
                                            <div className="p-2 rounded bg-light text-success w-fit mb-2">
                                                <MdEventAvailable size={20} />
                                            </div>
                                            <h4 className="h6 fw-bold text-dark mb-1">3. Acesse as atrações</h4>
                                            <p className="text-muted m-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                Com a inscrição feita, você já pode garantir vaga nas atrações da grade.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CARD: SOBRE O EVENTO */}
                            <div className="card border shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                                <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                                    <MdInfoOutline size={20} className="text-secondary" />
                                    <h3 className="h6 fw-bold m-0 text-secondary text-uppercase tracking-wider">Sobre o Evento</h3>
                                </div>
                                <p className="text-dark lh-base m-0 text-justify" style={{ fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                                    {evento.descricao}
                                </p>
                            </div>

                            {/* CRONOGRAMA GERAL ORDENADO POR DATA */}
                            <div className="card border shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                                <h3 className="h6 fw-bold text-secondary text-uppercase tracking-wider pb-2 mb-3 border-bottom">Prazos e Cronograma Geral</h3>
                                <div className="position-relative border-start border-2 ps-3 ms-2 my-2" style={{ borderColor: '#E5E7EB !important' }}>
                                    {evento.etapas?.[0] && [...evento.etapas]
                                        .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
                                        .map((et, index) => {
                                            const ehEtapaAtual = et.tipo_etapa === etapaInscricao?.tipo_etapa;
                                            return (
                                                <div key={et.id || index} className="position-relative mb-4">
                                                    <div 
                                                        className="position-absolute rounded-circle bg-white border border-4" 
                                                        style={{ 
                                                            left: '-26px', 
                                                            top: '2px', 
                                                            width: '14px', 
                                                            height: '14px',
                                                            borderColor: ehEtapaAtual ? verdeDestaque : '#9CA3AF'
                                                        }} 
                                                    />
                                                    <span className="text-muted d-block fw-bold small text-uppercase" style={{ fontSize: '0.75rem', color: ehEtapaAtual ? verdeDestaque : '#6B7280' }}>
                                                        {et.tipo_etapa_display || et.tipo_etapa}
                                                    </span>
                                                    <span className="fw-bold text-dark d-block my-0.5">
                                                        {formatarData(et.data_inicio)} — {formatarData(et.data_fim)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* BOTÃO COMPORTAMENTAL PROTÓTIPO */}
                            <div className="d-flex justify-content-end pt-2">
                                <Button 
                                    disabled={jaInscrito}
                                    onClick={handleDispararInscricao}
                                    className="d-inline-flex align-items-center gap-2 px-4 py-2.5 fw-bold text-white border-0 shadow-sm text-capitalize"
                                    style={{ backgroundColor: jaInscrito ? '#6C757D' : verdeDestaque, borderRadius: '8px' }}
                                >
                                    {jaInscrito ? 'Inscrição Confirmada ✔' : 'Inscrever-se no Evento'} 
                                    {!jaInscrito && <MdArrowForward size={18} />}
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* FEEDBACKS GLOBAIS DE INSCRIÇÃO */}
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
                texto={`Você está prestes a se inscrever em ${modalConfirmarInscricao.nomeEvento}.`}
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
                texto={`Sua inscrição em ${modalPosInscricao.nomeEvento} foi concluída com sucesso.`}
                textoFechar="Depois"
                textoAcao="Ver atrações"
            />

            <Footer 
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus={campus}
            />
        </div>
    );
}