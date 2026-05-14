import { useEffect, useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Alert from 'react-bootstrap/esm/Alert';
import Button from 'react-bootstrap/esm/Button';
import usePresencaEvento from '../hooks/usePresencaEvento';
import { useParams } from 'react-router-dom';
import { getCurrentUser, redirectToLogin } from '../services/authService';

import { listarMinhasInscricoesEventos } from '../services/inscricaoEventoService';

export default function AlunoCredenciamento({ campus = 'Campus Restinga' }) {
    const { eventoSlug } = useParams();
    const [mensagem, setMensagem] = useState(null);
    const [tipoMensagem, setTipoMensagem] = useState('info');
    const [presencaConfirmada, setPresencaConfirmada] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);

    const { registrarPresenca, loading } = usePresencaEvento();

    const [loadingPresencaInicial, setLoadingPresencaInicial] = useState(true);

    useEffect(() => {
        let ativo = true;

        (async () => {
            if (!eventoSlug) {
                if (!ativo) return;
                setMensagem('Evento não informado na URL.');
                setTipoMensagem('danger');
                setLoadingUser(false);
                setLoadingPresencaInicial(false);
                return;
            }

            try {
                const user = await getCurrentUser();
                if (!user) {
                    sessionStorage.setItem(
                        'post_login_redirect',
                        window.location.pathname + window.location.search,
                    );
                    redirectToLogin();
                    return;
                }

                const minhasInscricoes = await listarMinhasInscricoesEventos();
                if (!ativo) return;

                const inscricaoEvento = (
                    Array.isArray(minhasInscricoes) ? minhasInscricoes : []
                ).find((inscricao) => inscricao.evento_slug === eventoSlug);

                const jaConfirmada = Boolean(inscricaoEvento?.presente);
                setPresencaConfirmada(jaConfirmada);

                if (jaConfirmada) {
                    setMensagem('Sua presença já está confirmada.');
                    setTipoMensagem('success');
                }
            } catch (e) {
                if (!ativo) return;
                // mantém fallback atual
            } finally {
                if (!ativo) return;
                setLoadingUser(false);
                setLoadingPresencaInicial(false);
            }
        })();

        return () => {
            ativo = false;
        };
    }, [eventoSlug]);

    const limparMensagem = () => {
        setTimeout(() => setMensagem(null), 4000);
    };

    const handleMarcarPresenca = async () => {
        if (!eventoSlug) return;

        try {
            await registrarPresenca(eventoSlug);
            setMensagem('Presença confirmada com sucesso.');
            setTipoMensagem('success');
            setPresencaConfirmada(true);
        } catch (erro) {
            setMensagem(
                erro?.response?.data?.erro || 'Erro ao registrar presença.',
            );
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
                        <h1 className="fw-bold text-success">
                            Marque sua presença
                        </h1>
                    </Col>
                </Row>

                {mensagem && (
                    <Row className="px-4 mb-3">
                        <Col md={4} className="mx-auto">
                            <Alert
                                variant={tipoMensagem}
                                className="mb-0"
                                align="center"
                            >
                                {mensagem}
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row className="px-4 mb-4">
                    <Col md={8} className="mx-auto text-center">
                        <Button
                            size="lg"
                            variant="success"
                            disabled={
                                loading ||
                                !eventoSlug ||
                                presencaConfirmada ||
                                loadingUser ||
                                loadingPresencaInicial
                            }
                            onClick={handleMarcarPresenca}
                        >
                            {presencaConfirmada
                                ? 'Confirmada'
                                : 'Marcar presença'}
                        </Button>
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
