// React
import { useState } from 'react';
import Container from 'react-bootstrap/esm/Container';

// Bootstrap básicos
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Button from 'react-bootstrap/esm/Button';

// Componentes do Projeto
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Select from '../components/common/Select';

// Hooks
import { useCsrf } from '../hooks/useCsrf';
import { useCadastroComplementar } from '../hooks/useCadastroComplementar';
import Alerta from '../components/common/Alerta.jsx';

// Mock para Informações do Usuário vindo do Hub de Sistemas
    const usuarioHub = {
        id: '125a2577-e89b-12d3-a456-426614174000',
        nome: 'teste4',
        email: 'teste4.aluno@ifrs.edu.br',
        cpf: '452.452.897-00',
    };

export default function CadastroComplementar({ campus = 'Campus Restinga' }) {
    const { executarSalvamento, carregando, opcoes, notificacao } =
        useCadastroComplementar();
    const { csrfToken } = useCsrf(); //Token CSRF

    // Estados para guardar o que o usuário selecionou
    const [nivelSelecionado, setNivelSelecionado] = useState('');
    const [areaSelecionada, setAreaSelecionada] = useState('');

    const clicarEmSalvar = () => {
        const dados = {
            usuario_id_hub: usuarioHub.id,
            nome_usuario_hub: usuarioHub.nome,
            email_usuario_hub: usuarioHub.email,
            cpf_usuario_hub: usuarioHub.cpf,
            nivel_ensino: nivelSelecionado,
            area_conhecimento: areaSelecionada,
            // TODO: Por hora apenas para preencher espaço não está de fato complementando o cadastro, depois a gente vê o que mais precisa ser enviado para o backend
        };
        executarSalvamento(dados, csrfToken);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />

            {notificacao.mensagem && (
                <Alerta
                    mensagem={notificacao.mensagem}
                    variacao={notificacao.variacao}
                />
            )}

            <main className="d-flex flex-column flex-grow-1">
                <Container className="d-flex flex-grow-1 align-items-center justify-content-center">
                    <Col xs={16} sm={14} md={12} lg={10} xl={8}>
                        <Row className="p-1 w-100 shadow-lg rounded overflow-hidden">
                            <Col
                                md={5}
                                className="p-4 d-flex flex-column justify-content-between rounded"
                                style={{
                                    backgroundColor: '#059547',
                                    color: 'white',
                                }}
                            >
                                <Row className="justify-content-center">
                                    <Row className="p-0">
                                        <h4>Cadastro Complementar</h4>
                                        <p>
                                            Finalize seu cadastro para se
                                            inscrever em atrações e eventos{' '}
                                        </p>
                                    </Row>
                                </Row>
                                <Row>
                                    <h6>Sistema de Eventos</h6>
                                    <p className="small fw-light">
                                        O Sistema de Eventos é o seu portal
                                        central para descobrir, se inscrever e
                                        gerenciar sua participação nas
                                        atividades do Campus. Aqui você garante
                                        sua vaga e emite seus certificados em um
                                        só lugar.
                                    </p>
                                </Row>
                            </Col>

                            <Col md={7} className="bg-white p-4">
                                <h3 className="mb-4">Finalize seu cadastro</h3>

                                <Form>
                                    <Form.Group
                                        className="mb-3 text-start"
                                        controlId="nivelEnsino"
                                    >
                                        <Form.Label className="fw-bold small mb-1">
                                            Nível de Ensino
                                        </Form.Label>

                                        <Select
                                            textFundo="Selecione o Nível de Ensino"
                                            grupos={opcoes.niveis}
                                            value={nivelSelecionado} // 1. Aqui ele lê o estado
                                            onChange={(e) =>
                                                setNivelSelecionado(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>

                                    <Form.Group
                                        className="mb-4 text-start"
                                        controlId="areaConhecimento"
                                    >
                                        <Form.Label className="fw-bold small mb-1">
                                            Área do conhecimento
                                        </Form.Label>
                                        <Select
                                            textFundo="Selecione a Área"
                                            grupos={opcoes.areas}
                                            value={areaSelecionada} // 1. Aqui ele lê o estado
                                            onChange={(e) =>
                                                setAreaSelecionada(
                                                    e.target.value,
                                                )
                                            } // 2. Aqui ele altera o estado
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="success"
                                            className="fw-bold px-4"
                                            onClick={clicarEmSalvar}
                                            disabled={carregando}
                                        >
                                            {carregando
                                                ? 'Salvando...'
                                                : 'Salvar'}
                                        </Button>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Col>
                </Container>
            </main>

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus={campus}
            />
        </div>
    );
}
