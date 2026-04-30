import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Alert from 'react-bootstrap/esm/Alert';
import Card from 'react-bootstrap/esm/Card';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import { MdQrCode, MdOutlineEventAvailable } from 'react-icons/md';
import ListaInscritos from '../components/lista_inscritos/ListaInscritos';
import useInscricoesEvento from '../hooks/useInscricoesEvento';
import usePresencaEvento from '../hooks/usePresencaEvento';

const CODIGO_UNIVERSAL = 'EVENTO-2026';

const mapearInscricaoParaUsuario = (inscricao) => ({
    id: inscricao.id,
    nome:
        inscricao.usuario_nome ||
        inscricao.usuario_username ||
        `Inscrição ${inscricao.id}`,
    email: inscricao.usuario_email || inscricao.usuario_username || '-',
    cpf: inscricao.usuario_username || '-',
    tipo: inscricao.presente ? 'Presente' : 'Pendente',
    atracao: inscricao.evento_nome || '-',
});

export default function PresencaEvento({ campus = 'Campus Restinga' }) {
    const [searchParams] = useSearchParams();
    const eventoIdDaUrl = searchParams.get('eventoId') || '';

    const [eventoInput, setEventoInput] = useState(eventoIdDaUrl);
    const [codigoAtual, setCodigoAtual] = useState('');
    const [mensagem, setMensagem] = useState(null);
    const [tipoMensagem, setTipoMensagem] = useState('info');

    const {
        eventoId,
        setEventoId,
        inscricoes,
        presentes,
        loading: loadingInscricoes,
        error: erroInscricoes,
        carregarInscricoes,
    } = useInscricoesEvento(eventoIdDaUrl);

    const {
        registrarPresenca,
        loading: loadingPresenca,
        error: erroPresenca,
    } = usePresencaEvento();

    useEffect(() => {
        if (eventoIdDaUrl) {
            setEventoInput(eventoIdDaUrl);
            setEventoId(eventoIdDaUrl);
        }
    }, [eventoIdDaUrl, setEventoId]);

    const usuariosDaLista = useMemo(
        () => inscricoes.map(mapearInscricaoParaUsuario),
        [inscricoes],
    );

    const presencasRegistradas = useMemo(
        () => new Set(presentes.map((item) => item.id)),
        [presentes],
    );

    const presentesCount = presentes.length;
    const pendentesCount = inscricoes.length - presentesCount;

    const mostrarMensagemTemporaria = (texto, variante = 'info') => {
        setMensagem(texto);
        setTipoMensagem(variante);
        window.clearTimeout(window.__presencaTimeout);
        window.__presencaTimeout = window.setTimeout(() => setMensagem(null), 4000);
    };

    const handleCarregarEvento = async () => {
        const eventoLimpo = eventoInput.trim();
        setEventoId(eventoLimpo);

        if (!eventoLimpo) {
            mostrarMensagemTemporaria('Informe o ID do evento para carregar a lista.', 'warning');
            return;
        }

        try {
            await carregarInscricoes(eventoLimpo);
            mostrarMensagemTemporaria('Lista do evento carregada com sucesso.', 'success');
        } catch {
            mostrarMensagemTemporaria('Não foi possível carregar o evento informado.', 'danger');
        }
    };

    const handleLerCodigo = async () => {
        if (!codigoAtual.trim()) return;

        const codigoLimpo = codigoAtual.trim().toUpperCase();


        try {
            const resposta = await registrarPresenca(eventoId);
            mostrarMensagemTemporaria(resposta?.msg || 'Presença registrada com sucesso.', 'success');
            setCodigoAtual('');
            await carregarInscricoes(eventoId);
        } catch (erro) {
            const erroMensagem =
                erro?.response?.data?.erro ||
                erro?.response?.data?.msg ||
                erro?.message ||
                'Não foi possível registrar a presença.';
            mostrarMensagemTemporaria(erroMensagem, 'danger');
            setCodigoAtual('');
        }
    };

    return (
        <>
            <NavBar />
            <main className="flex-fill bg-light py-4">
                <Row>
                    <Col className="text-center mb-4">
                        <h1 className="fw-bold text-success">
                            Credenciamento
                        </h1>
                        
                    </Col>
                </Row>

                

                {mensagem && (
                    <Row className="px-4 mb-3">
                        <Col lg={8} className="mx-auto">
                            <Alert variant={tipoMensagem} className="mb-0">
                                {mensagem}
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row className="px-4 mb-4">
                    <Col lg={8} className="mx-auto">
                        <Row className="g-3 mb-4">
                            <Col md={4}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-center gap-2 text-muted">
                                            <MdOutlineEventAvailable size={20} />
                                            <span className="fw-semibold">Inscritos</span>
                                        </div>
                                        <div className="fs-2 fw-bold mt-2">{inscricoes.length}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body>
                                        <div className="text-muted fw-semibold">Presentes</div>
                                        <div className="fs-2 fw-bold text-success mt-2">{presentesCount}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body>
                                        <div className="text-muted fw-semibold">Pendentes</div>
                                        <div className="fs-2 fw-bold text-secondary mt-2">{pendentesCount}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {(loadingInscricoes || erroInscricoes || erroPresenca) && (
                            <div className="mb-3">
                                {loadingInscricoes && (
                                    <div className="d-flex align-items-center gap-2 text-muted mb-2">
                                        <Spinner animation="border" size="sm" />
                                        Carregando inscritos do evento...
                                    </div>
                                )}

                                {erroInscricoes && (
                                    <Alert variant="danger" className="mb-2">
                                        Não foi possível carregar os inscritos.
                                    </Alert>
                                )}

                                {erroPresenca && (
                                    <Alert variant="danger" className="mb-0">
                                        Não foi possível registrar a presença.
                                    </Alert>
                                )}
                            </div>
                        )}

                        <ListaInscritos
                            titulo="Lista de Inscritos"
                            usuarios={usuariosDaLista}
                            loading={loadingInscricoes}
                            error={erroInscricoes}
                            habilitarPresenca={true}
                            bloquearCliquePresenca={true}
                            presencasRegistradas={presencasRegistradas}
                            onRegistrarPresenca={() => {}}
                            paginaAtual={0}
                            totalPaginas={1}
                        />
                    </Col>
                </Row>
            </main>

            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
