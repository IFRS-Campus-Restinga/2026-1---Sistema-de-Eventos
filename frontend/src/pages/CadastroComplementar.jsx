import { useState } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Button from 'react-bootstrap/esm/Button';
import { Spinner } from 'react-bootstrap';

import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Select from '../components/common/Select';
import Alerta from '../components/common/Alerta.jsx';

import { useCsrf } from '../hooks/useCsrf';
import { useCadastroComplementar } from '../hooks/useCadastroComplementar';

export default function CadastroComplementar({ campus = 'Campus Restinga' }) {
    const {
        executarSalvamento,
        carregando,
        opcoes,
        notificacao,
        usuarioHub,
        carregandoUsuario,
        erros,
    } = useCadastroComplementar();

    const { csrfToken } = useCsrf();
    const [nivelSelecionado, setNivelSelecionado] = useState('');
    const [areaSelecionada, setAreaSelecionada] = useState('');

    const clicarEmSalvar = () => {
        if (!usuarioHub) return;

        const dados = {
            nivel_ensino: nivelSelecionado,
            area_conhecimento: areaSelecionada,
        };
        executarSalvamento(dados, csrfToken);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />

            {/* O Alerta global é mantido apenas para erros de negócio ou de servidor */}
            {notificacao.mensagem && (
                <Alerta
                    mensagem={notificacao.mensagem}
                    variacao={notificacao.variacao}
                />
            )}

            <main className="d-flex flex-column flex-grow-1">
                <Container className="d-flex flex-grow-1 align-items-center justify-content-center">
                    <Col xs={12} sm={12} md={10} lg={8} xl={8}>
                        <Row className="shadow-lg rounded overflow-hidden mx-2 my-3">
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
                                            inscrever em atrações e eventos
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

                                {carregandoUsuario ? (
                                    <div className="d-flex justify-content-center align-items-center h-50">
                                        <Spinner
                                            animation="border"
                                            variant="success"
                                        />
                                        <span className="ms-3">
                                            Carregando...
                                        </span>
                                    </div>
                                ) : !usuarioHub ? (
                                    <Alerta
                                        mensagem="Sessão inválida. Por favor, realize o login novamente no Hub."
                                        variacao="danger"
                                    />
                                ) : (
                                    <>
                                        <Form>
                                            <Form.Group
                                                className="text-start mb-3 pb-4"
                                                controlId="nivelEnsino"
                                                style={{ minHeight: '95px' }}
                                            >
                                                <Form.Label className="fw-bold small mb-1">
                                                    Nível de Ensino
                                                </Form.Label>
                                                <Select
                                                    textFundo="Selecione o Nível de Ensino"
                                                    grupos={opcoes.niveis}
                                                    value={nivelSelecionado}
                                                    onChange={(e) =>
                                                        setNivelSelecionado(
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!erros?.nivel_ensino
                                                    } // 2. Aplicação da regra visual de erro
                                                    mensagemErro={
                                                        erros?.nivel_ensino
                                                    } // 3. Passagem do texto do erro
                                                />
                                            </Form.Group>

                                            <Form.Group
                                                className="text-start mb-3 pb-4"
                                                controlId="areaConhecimento"
                                                style={{ minHeight: '95px' }}
                                            >
                                                <Form.Label className="fw-bold small mb-1">
                                                    Área do conhecimento
                                                </Form.Label>
                                                <Select
                                                    textFundo="Selecione a Área"
                                                    grupos={opcoes.areas}
                                                    value={areaSelecionada}
                                                    onChange={(e) =>
                                                        setAreaSelecionada(
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!erros?.area_conhecimento
                                                    }
                                                    mensagemErro={
                                                        erros?.area_conhecimento
                                                    }
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
                                    </>
                                )}
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
