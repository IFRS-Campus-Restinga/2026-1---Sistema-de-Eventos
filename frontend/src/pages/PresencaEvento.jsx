import { useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Alert from 'react-bootstrap/esm/Alert';
import { MdQrCode } from 'react-icons/md';
import ListaInscritos from '../components/lista_inscritos/ListaInscritos';
// import usePresenca from '../hooks/usePresenca';

export default function PresencaEvento({ campus = 'Campus Restinga' }) {
    const [codigoAtual, setCodigoAtual] = useState('');
    const [mensagem, setMensagem] = useState(null);
    const [tipoMensagem, setTipoMensagem] = useState('info');
    const [inscritosComPresenca, setInscritosComPresenca] = useState(new Set());
    const [mostrarSelecao, setMostrarSelecao] = useState(false);
    const [selecionado, setSelecionado] = useState(null);

    // Código universal do evento
    const CODIGO_UNIVERSAL = 'EVENTO-2026';

    const mockInscritosOriginais = [
    {
        id: 1,
        nome: 'Bruno',
        email: 'bruno@email.com',
        cpf: '123.456.789-00',
        tipo: 'Participante',
        matricula: '001',
        atracao: 'Introdução a Análise de Dados',
    },
    {
        id: 2,
        nome: 'Breno',
        email: 'breno@email.com',
        cpf: '123.456.789-00',
        tipo: 'Participante',
        matricula: '002',
        atracao: 'Introdução a Análise de Dados',
    }
]
    const handleLerCodigo = () => {
        if (!codigoAtual.trim()) return;
        
        const codigoLimpo = codigoAtual.trim().toUpperCase();
        
        if (codigoLimpo === CODIGO_UNIVERSAL) {
            setMostrarSelecao(true);
            setCodigoAtual('');
        } else {
            setMensagem('Código inválido. Escanei o QR code do evento.');
            setTipoMensagem('danger');
            setCodigoAtual('');
            setTimeout(() => setMensagem(null), 4000);
        }
    };

    const handleSelecionarAluno = (aluno) => {
        setSelecionado(aluno);
    };

    const handleConfirmarPresenca = () => {
        if (selecionado) {
            setInscritosComPresenca(prev => new Set([...prev, selecionado.id]));
            setMensagem(`✓ Presença registrada para ${selecionado.nome}`);
            setTipoMensagem('success');
            setTimeout(() => setMensagem(null), 4000);
            setMostrarSelecao(false);
            setSelecionado(null);
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
                        <Col>
                            <Alert variant={tipoMensagem} className="mb-0">
                                {mensagem}
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row className="px-4 mb-4">
                    <Col md={8} className="mx-auto">
                        <InputGroup size="lg" className="shadow-sm">
                            <InputGroup.Text className="bg-white" style={{ backgroundColor: '#f8f9fa' }}>
                                <MdQrCode size={24} color="#38A149" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Cole aqui a matrícula, CPF ou código do QR code..."
                                value={codigoAtual}
                                onChange={(e) => setCodigoAtual(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleLerCodigo();
                                    }
                                }}
                                autoFocus
                                className="border-start-0 ps-2"
                                style={{ fontSize: '1rem' }}
                            />
                        </InputGroup>
                        <small className="text-muted d-block mt-2">
                            Escanei o QR code do evento ou digite: <strong>EVENTO-2026</strong>
                        </small>
                    </Col>
                </Row>

                <Row>
                    <Col className="px-4">
                        <ListaInscritos
                            titulo="Lista de Inscritos"
                            usuarios={mockInscritosOriginais}
                            habilitarPresenca={true}
                            presencasRegistradas={inscritosComPresenca}
                            onRegistrarPresenca={(usuario) => {
                                setInscritosComPresenca(prev => new Set([...prev, usuario.id]));
                                setMensagem(`✓ Presença registrada para ${usuario.nome}`);
                                setTipoMensagem('success');
                                setTimeout(() => setMensagem(null), 4000);
                            }}
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
