import { useEffect, useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Alert from 'react-bootstrap/esm/Alert';
import Button from 'react-bootstrap/esm/Button';
import { MdQrCode } from 'react-icons/md';
import usePresencaEvento from '../hooks/usePresencaEvento';
import { useParams } from 'react-router-dom';

export default function AlunoCredenciamento({ campus = 'Campus Restinga' }) {
    const { eventoId } = useParams();
    const [codigoAtual, setCodigoAtual] = useState('');
    const [mensagem, setMensagem] = useState(null);
    const [tipoMensagem, setTipoMensagem] = useState('info');
    const [presencaConfirmada, setPresencaConfirmada] = useState(false);

    const { registrarPresenca, loading } = usePresencaEvento();

    useEffect(() => {
        if (!eventoId) {
            setMensagem('Evento não informado na URL.');
            setTipoMensagem('danger');
        }
    }, [eventoId]);

    const limparMensagem = () => {
        setTimeout(() => setMensagem(null), 4000);
    };

    const handleLerCodigo = async () => {
        if (!eventoId) return;
        if (!codigoAtual.trim()) return;

        const codigoLimpo = codigoAtual.trim().toUpperCase();

        // o código do evento sempre vai ser EVENTO-{eventoId}, ok?
        if (codigoLimpo !== `EVENTO-${eventoId}`) {
            setMensagem('QR code inválido para este evento.');
            setTipoMensagem('danger');
            setCodigoAtual('');
            limparMensagem();
            return;
        }

        try {
            await registrarPresenca(eventoId);
            setMensagem('Presença confirmada com sucesso.');
            setTipoMensagem('success');
            setCodigoAtual('');
            setPresencaConfirmada(true);
        } catch (erro) {
            setMensagem(erro?.response?.data?.erro || 'Erro ao registrar presença.');
            setTipoMensagem('danger');
        } finally {
            limparMensagem();
        }
    };

    return (
        <>
            <NavBar />
            <main className="flex-fill bg-light py-4">
                <Row>
                    <Col className="text-center mb-4">
                        <h1 className="fw-bold text-success">Marque sua presença</h1>
                    </Col>
                </Row>

                {mensagem && (
                    <Row className="px-4 mb-3">
                        <Col md={8} className="mx-auto">
                            <Alert variant={tipoMensagem} className="mb-0">
                                {mensagem}
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row className="px-4 mb-4">
                    <Col md={8} className="mx-auto">
                        <InputGroup size="lg">
                            <InputGroup.Text style={{ backgroundColor: '#f8f9fa' }}>
                                <MdQrCode size={24} color="#38A149" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Cole o código do QR..."
                                value={codigoAtual}
                                onChange={(e) => setCodigoAtual(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLerCodigo();
                                }}
                                autoFocus
                                disabled={presencaConfirmada}
                            />
                            <Button
                                variant={presencaConfirmada ? 'success' : 'success'}
                                disabled={loading || !codigoAtual.trim() || !eventoId || presencaConfirmada}
                                onClick={handleLerCodigo}
                            >
                                {presencaConfirmada ? 'Confirmada' : 'Registrar'}
                            </Button>
                        </InputGroup>

                        <small className="text-muted d-block mt-2">
                            Evento atual: <strong>{eventoId || 'não informado'}</strong>
                        </small>

                        {presencaConfirmada && (
                            <Alert variant="success" className="mt-3 mb-0">
                                Sua presença já está confirmada.
                            </Alert>
                        )}
                    </Col>
                </Row>
            </main>

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus={campus}
            />
        </>
    );
}