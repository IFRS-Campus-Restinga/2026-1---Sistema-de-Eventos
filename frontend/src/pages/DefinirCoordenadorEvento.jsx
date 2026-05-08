import { useEffect, useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Alerta from '../components/common/Alerta';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useEventos } from '../hooks/useEventos';
import { useUsers } from '../hooks/useUsers';
import { useCoordenadorEvento } from '../hooks/useCoordenadorEvento';

import Vinculo from '../components/common/Vinculo';

export default function DefinirCoordenadorEvento({
    campus = 'Campus Restinga',
}) {
    const [searchParams] = useSearchParams();
    const eventoIdDaUrl = searchParams.get('eventoId') || '';

    const { eventos, loading: loadingEventos } = useEventos();
    const { users } = useUsers();
    const {
        handleDefinirCoordenador,
        handleRemoverCoordenador,
        carregarCoordenadores,
        coordenadores,
        loading,
        message,
    } = useCoordenadorEvento();

    const [selectedEventoId, setSelectedEventoId] = useState('');
    const [search, setSearch] = useState('');

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
        carregarCoordenadores(selectedEventoId);
    }, [selectedEventoId]);

    const usuariosServidor = users.filter(
        (user) => user.access_profile === 'servidor',
    );

    const idsCoordenadores = new Set(
        coordenadores.map((coordenador) => String(coordenador.id)),
    );

    // const dadosDisponiveis = usuariosServidor.filter(
    //     (user) => !idsCoordenadores.has(String(user.id)),
    // );

    const dadosSelecionados = coordenadores;

    // é o jeito de fzr o filtro dar certo sem mudar mto a lógica de atribuição
    const usuariosFiltrados = usuariosServidor.filter((user) =>
        `${user.nome || ''} ${user.email || ''}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    const dadosDisponiveis = usuariosFiltrados.filter(
        (user) => !idsCoordenadores.has(String(user.id)),
    );

    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container fluid className="px-5">
                    <Row>
                        <Col className="text-center my-5">
                            <h1 className="fw-bold text-success">
                                Definir Coordenador de Evento
                            </h1>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <h4 className="mb-3 text-success fw-bold">
                            Evento:{' '}
                            {eventoSelecionado?.nome ||
                                (loadingEventos
                                    ? 'Carregando evento...'
                                    : 'Evento não encontrado')}
                        </h4>
                        <Col>
                            <span className="fs-5 fw-semibold">
                                Buscar usuários
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Digite para filtrar usuários"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col md={0} className="mx-auto">
                            <Vinculo
                                cabecario1="Usuários disponíveis"
                                cabecario2="Coordenadores escolhidos"
                                corTexto="#fff"
                                corCabecario="#006B3F"
                                dados1={dadosDisponiveis}
                                dados2={dadosSelecionados}
                                onAcao2={(id) => {
                                    const usuario = users.find(
                                        (u) => String(u.id) === String(id),
                                    );
                                    handleDefinirCoordenador(
                                        selectedEventoId,
                                        id,
                                        usuario?.nome || 'Usuário',
                                    );
                                }}
                                onAcao1={(id) => {
                                    const usuario = users.find(
                                        (u) => String(u.id) === String(id),
                                    );
                                    handleRemoverCoordenador(
                                        selectedEventoId,
                                        id,
                                        usuario?.nome || 'Usuário',
                                    );
                                }}
                                selecionado={selectedEventoId}
                                renderItem={(user) => user.nome}
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
