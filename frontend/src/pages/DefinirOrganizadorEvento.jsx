import { useEffect, useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alerta from '../components/common/Alerta';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useEventos } from '../hooks/useEventos';
import { useUsers } from '../hooks/useUsers';
import { useOrganizadorEvento } from '../hooks/useOrganizadorEvento';

import Vinculo from '../components/common/Vinculo';

export default function DefinirOrganizadorEvento({
    campus = 'Campus Restinga',
}) {
    const [searchParams] = useSearchParams();
        const eventoIdDaUrl = searchParams.get('eventoId') || '';
    
        const { eventos, loading: loadingEventos } = useEventos();
        const { users } = useUsers();
        const {
            handleDefinirOrganizador,
            handleRemoverOrganizador,
            carregarOrganizadores,
            organizadores,
            loading,
            message,
        } = useOrganizadorEvento();
    
        const [selectedEventoId, setSelectedEventoId] = useState('');
    
        // aq é onde tu acha qual o evento q tu ta atribuindo coordenador
        const eventoSelecionado = eventos.find(
            (evento) => String(evento.id) === String(selectedEventoId),
        );
    
        const navegate = useNavigate();
    
        useEffect(() => {
            if (eventoIdDaUrl) {
                setSelectedEventoId(eventoIdDaUrl);
            }
        }, [eventoIdDaUrl]);
    
        useEffect(() => {
            carregarOrganizadores(selectedEventoId);
        }, [selectedEventoId]);
    
        const usuariosServidor = users.filter(
            (user) => user.access_profile === 'servidor',
        );
    
        const idsOrganizadores = new Set(
            organizadores.map((organizador) => String(organizador.id)),
        );
    
        const dadosDisponiveis = usuariosServidor.filter(
            (user) => !idsOrganizadores.has(String(user.id)),
        );
    
        const dadosSelecionados = organizadores;
    
        return (
            <>
                <NavBar />
                <main className="flex-fill mb-5">
                    <Container fluid className="px-5">
                        <Row>
                            <Col className="text-center my-5">
                                <h1 className="fw-bold text-success">
                                    Definir Organizador de Evento
                                </h1>
                            </Col>
                        </Row>
    
                        <Row>
                            <Col md={6} className="mx-auto">
                                <h4 className="mb-3 text-success fw-bold">
                                    Evento:{' '}
                                    {eventoSelecionado?.nome ||
                                        (loadingEventos
                                            ? 'Carregando evento...'
                                            : 'Evento não encontrado')}
                                </h4>
                                <Vinculo
                                    cabecario1="Usuários disponíveis"
                                    cabecario2="Organizadores escolhidos"
                                    corTexto="#fff"
                                    corCabecario="#006B3F"
                                    dados1={dadosDisponiveis}
                                    dados2={dadosSelecionados}
                                    onAcao2={(id) =>
                                        handleDefinirOrganizador(selectedEventoId, id)
                                    }
                                    onAcao1={(id) =>
                                        handleRemoverOrganizador(selectedEventoId, id)
                                    }
                                    selecionado={selectedEventoId}
                                    renderItem={(user) => user.nome || user.username}
                                />
    
                                <div className="d-flex gap-3 mt-3">
                                    <Button
                                        variant="secondary"
                                        className="fw-bold text-white text-decoration-none"
                                        onClick={() => navegate(-1)}
                                    >
                                        Voltar
                                    </Button>
                                </div>
    
                                
                            </Col>
                        </Row>
                    </Container>
                </main>

            {message && (
                <Alerta
                    mensagem={message.text}
                    variacao={message.type}
                    duracao={5000}
                />
            )}

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus={campus}
            />
        </>
    );
}
