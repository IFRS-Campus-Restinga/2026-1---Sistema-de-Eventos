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
import { useCoordenadorEvento } from '../hooks/useCoordenadorEvento';

export default function DefinirCoordenadorEvento({
    campus = 'Campus Restinga',
}) {
    const [searchParams] = useSearchParams();
    const eventoIdDaUrl = searchParams.get('eventoId') || '';

    const { eventos, loading: loadingEventos } = useEventos();
    const { users, loading: loadingUsers } = useUsers();
    const {
        handleDefinirCoordenador,
        handleRemoverCoordenador,
        carregarCoordenadores,
        coordenadores,
        loading,
        message,
    } = useCoordenadorEvento();

    const [selectedEventoId, setSelectedEventoId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

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
                                    (loadingEventos
                                        ? 'Carregando evento...'
                                        : 'Evento não encontrado')}
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
                                                {user.nome}
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
                                        className="fw-bold text-white text-decoration-none"
                                        onClick={() => navegate(-1)}
                                    >
                                        Voltar
                                    </Button>
                                </div>
                            </Form>

                            <div className="mt-4">
                                <h5 className="fw-bold text-success">
                                    Coordenadores deste evento
                                </h5>

                                {coordenadores.length === 0 ? (
                                    <p className="text-muted mb-0">
                                        Nenhum coordenador atribuído.
                                    </p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered align-middle">
                                            <thead className="table-success">
                                                <tr>
                                                    <th>Usuário</th>
                                                    <th>Email</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coordenadores.map((coordenador) => (
                                                    <tr key={coordenador.id}>
                                                        <td>{coordenador.username}</td>
                                                        <td>
                                                            {coordenador.email || '-'}
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleRemoverCoordenador(
                                                                        selectedEventoId,
                                                                        coordenador.id,
                                                                    )
                                                                }
                                                                disabled={loading}
                                                            >
                                                                Retirar
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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
