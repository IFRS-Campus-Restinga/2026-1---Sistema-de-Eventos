import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    MdPlace, 
    MdInfoOutline, 
    MdInsertDriveFile, 
    MdArrowForward,
    MdScience,
    MdSettings,
    MdPublic,
    MdMenuBook
} from 'react-icons/md';
import { FaCalendarAlt as Calendar, FaClock as Clock, FaFileAlt as FileText } from 'react-icons/fa';

import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { buscarEventoPorId } from '../services/eventoService';
import { setSelectedEventoId } from '../utils/selectedEvento';

export default function FaseSubmissao() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [evento, setEvento] = useState(null);
    const [etapaSubmissao, setEtapaSubmissao] = useState(null);
    const [areasDoEvento, setAreasDoEvento] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const verdeDestaque = "#008B47";
    const getIconArea = (nome) => {
        if (!nome) return <MdMenuBook size={20} />;
        const n = nome.toLowerCase();
        if (n.includes('exatas') || n.includes('terra')) return <MdScience size={20} />;
        if (n.includes('engenharia')) return <MdSettings size={20} />;
        if (n.includes('humana') || n.includes('social')) return <MdPublic size={20} />;
        return <MdMenuBook size={20} />;
    };

    useEffect(() => {
        async function carregarDados() {
            try {
                setLoading(true);
                setError(null);
                
                const dados = await buscarEventoPorId(id);
                setEvento(dados);

                // Mapeia a etapa de submissão
                if (dados?.etapas && Array.isArray(dados.etapas)) {
                    const sub = dados.etapas.find(e => 
                        e.tipo_etapa?.toLowerCase().includes('submissao') || 
                        e.tipo_etapa_display?.toLowerCase().includes('submissão')
                    );
                    setEtapaSubmissao(sub || null);
                }

                const campoArea = dados?.area_conhecimento_detalhes || dados?.area_conhecimento;
                if (campoArea && Array.isArray(campoArea)) {
                    const areasMapeadas = campoArea.map(area => area.nome || area.area_conhecimento_display || area);
                    setAreasDoEvento(areasMapeadas);
                }

            } catch (err) {
                console.error('Erro ao carregar dados da submissão:', err);
                setError('Não foi possível carregar as informações desta etapa.');
            } finally {
                setLoading(false);
            }
        }
        if (id) carregarDados();
    }, [id]);

    const formatarData = (dataString) => {
        if (!dataString) return '—';
        try {
            const apenasData = dataString.split('T')[0];
            const partes = apenasData.split('-');
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
            return '—';
        } catch (e) {
            return '—';
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
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
                                        Fase Atual: {etapaSubmissao?.tipo_etapa_display || 'Submissão de Trabalhos'}
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
                                            className="text-white text-decoration-none d-flex align-items-center gap-1 px-2 py-1 rounded fw-semibold transition-all"
                                            style={{ 
                                                fontSize: '0.82rem',
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                                backdropFilter: 'blur(4px)'
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

                {/* CONTEÚDO PRINCIPAL */}
                <div className="container py-5">
                    <div className="row g-4 justify-content-center">
                        <div className="col-lg-8">
                            
                            {/* CARD INSTRUÇÕES E PRAZOS */}
                            <div className="card border shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: verdeDestaque }}>
                                    <FileText size={22} />
                                    <h2 className="h5 fw-bold m-0">Instruções de Envio</h2>
                                </div>
                                <p className="text-muted small">
                                    Os trabalhos científicos e acadêmicos devem ser submetidos respeitando as diretrizes do edital regulador. Certifique-se de preencher os metadados dos autores corretamente antes de carregar o arquivo final.
                                </p>

                                <div className="row g-3 bg-light p-3 rounded border mt-3 mx-0">
                                    <div className="col-sm-6 d-flex align-items-center gap-3">
                                        <div className="p-2 rounded bg-success-subtle text-success">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <span className="text-muted d-block uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>ABERTURA DOS ENVIOS</span>
                                            <span className="fw-bold text-dark">{formatarData(etapaSubmissao?.data_inicio)}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 d-flex align-items-center gap-3">
                                        <div className="p-2 rounded bg-danger-subtle text-danger">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <span className="text-muted d-block uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>PRAZO FINAL</span>
                                            <span className="fw-bold text-dark">{formatarData(etapaSubmissao?.data_fim)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ÁREAS ACEITAS  */}
                            <div className="mb-4">
                                <h3 className="h6 fw-bold text-secondary text-uppercase tracking-wider mb-3">Áreas aceitas</h3>
                                <div className="row g-3">
                                    {areasDoEvento.length > 0 ? (
                                        areasDoEvento.map((area, idx) => (
                                            <div key={idx} className="col-md-6">
                                                <div className="card p-3 bg-white border shadow-sm d-flex flex-row align-items-center gap-2" style={{ borderRadius: '8px' }}>
                                                    <div style={{ color: verdeDestaque }} className="d-flex align-items-center">
                                                        {getIconArea(area)}
                                                    </div>
                                                    <span className="fw-semibold text-dark small">{area}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12">
                                            <div className="card p-3 bg-white border text-muted small" style={{ borderRadius: '8px' }}>
                                                Nenhuma área específica configurada para este evento.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CARD SOBRE O EVENTO */}
                            <div className="card border shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                                <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                                    <MdInfoOutline size={20} className="text-secondary" />
                                    <h3 className="h6 fw-bold m-0 text-secondary text-uppercase tracking-wider">Sobre o Evento</h3>
                                </div>
                                <p className="text-dark lh-base m-0 text-justify" style={{ fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                                    {evento.descricao}
                                </p>
                            </div>

                            {/* CRONOGRAMA GERAL - ORDENADO POR DATA CRONOLÓGICA */}
                            <div className="card border shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                                <h3 className="h6 fw-bold text-secondary text-uppercase tracking-wider pb-2 mb-3 border-bottom">
                                    Prazos e Cronograma Geral
                                </h3>
                                
                                <div className="position-relative border-start border-2 ps-3 ms-2 my-2" style={{ borderColor: '#E5E7EB !important' }}>
                                    {evento.etapas?.[0] && [...evento.etapas]
                                        // ✅ ORDENAÇÃO: Garante que a data_inicio mais antiga venha primeiro e a mais atual fique por último
                                        .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
                                        .map((et, index) => {
                                            const ehEtapaAtual = et.tipo_etapa === etapaSubmissao?.tipo_etapa;
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

                            {/* BOTÃO SUBMISSÃO */}
                            <div className="d-flex justify-content-end pt-2">
                                <Link 
                                    to="/adicionar_atracao"
                                    onClick={() => setSelectedEventoId(evento.id)}
                                    className="btn btn-success d-inline-flex align-items-center gap-2 px-4 py-2.5 fw-bold text-white border-0 shadow-sm"
                                    style={{ backgroundColor: verdeDestaque, borderRadius: '8px' }}
                                >
                                    Ir para Submissão <MdArrowForward size={18} />
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
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