import { useEffect, useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alerta from '../components/common/Alerta';
import { Link, useSearchParams } from 'react-router-dom';

import { useEventos } from '../hooks/useEventos';
import { useUsers } from '../hooks/useUsers';
import { useCoordenadorEvento } from '../hooks/useCoordenadorEvento';

export default function DefinirCoordenadorEvento({ campus = 'Campus Restinga' }) {
    const [searchParams] = useSearchParams();
    const eventoIdDaUrl = searchParams.get('eventoId') || '';

    const { eventos, loading: loadingEventos } = useEventos();
    const { users, loading: loadingUsers } = useUsers();
    const { handleDefinirCoordenador, loading, message, setMessage } =
        useCoordenadorEvento();

    const [selectedEventoId, setSelectedEventoId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    // aq é onde tu acha qual o evento q tu ta atribuindo coordenador
    const eventoSelecionado = eventos.find(
        (evento) => String(evento.id) === String(selectedEventoId),
    );

    useEffect(() => {
        if (eventoIdDaUrl) {
            setSelectedEventoId(eventoIdDaUrl);
        }
    }, [eventoIdDaUrl]);

    const handleSubmit = async () => {
        await handleDefinirCoordenador(selectedEventoId, selectedUserId);
        setSelectedUserId('');
    };

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

                    <Row>
                        <Col md={6} className="mx-auto">
                            <h4 className="mb-3 text-success fw-bold">
                                Evento:{' '}
                                {eventoSelecionado?.nome ||
                                (loadingEventos ? 'Carregando evento...' : 'Evento não encontrado')}
                            </h4>
                            <Form>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Selecionar Coordenador
                                    </Form.Label>
                                    <Form.Select
                                        value={selectedUserId}
                                        onChange={(e) =>
                                            setSelectedUserId(e.target.value)
                                        }
                                        disabled={loadingUsers}
                                    >
                                        <option value="">
                                            {loadingUsers
                                                ? 'Carregando...'
                                                : 'Escolha um usuário'}
                                        </option>
                                        {users.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.username}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-flex gap-3">
                                    <Button
                                        variant="success"
                                        className="fw-bold"
                                        onClick={handleSubmit}
                                        disabled={
                                            loading ||
                                            !selectedEventoId ||
                                            !selectedUserId
                                        }
                                    >
                                        {loading
                                            ? 'Definindo...'
                                            : 'Definir Coordenador'}
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        className="fw-bold"
                                    >
                                        <Link
                                            to="/"
                                            className="text-white text-decoration-none"
                                        >
                                            Voltar
                                        </Link>
                                    </Button>
                                </div>
                            </Form>
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