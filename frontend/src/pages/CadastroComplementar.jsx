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
        erroValidacao,
        setErroValidacao,
    } = useCadastroComplementar();

    const { csrfToken } = useCsrf();

    const [nivelSelecionado, setNivelSelecionado] = useState('');
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [errosIndividuais, setErrosIndividuais] = useState({});

    const clicarEmSalvar = () => {
        if (!usuarioHub) return;

        const camposFaltantes = [];
        const errosLocais = {};

        if (!nivelSelecionado) {
            camposFaltantes.push('o Nível de Ensino');
            errosLocais.nivel = 'Campo obrigatório';
        } else if (
            !opcoes.niveis.some(
                (n) => String(n.id) === String(nivelSelecionado),
            )
        ) {
            errosLocais.nivel = 'Opção inválida';
        }

        if (!areaSelecionada) {
            camposFaltantes.push('a Área de Conhecimento');
            errosLocais.area = 'Campo obrigatório';
        } else if (
            !opcoes.areas.some((a) => String(a.id) === String(areaSelecionada))
        ) {
            errosLocais.area = 'Opção inválida';
        }

        setErrosIndividuais(errosLocais);

        if (camposFaltantes.length > 0) {
            const mensagem = `Por favor, selecione ${camposFaltantes.join(
                ' e ',
            )}.`;
            setErroValidacao('');
            setTimeout(() => setErroValidacao(mensagem), 50);
            return;
        }

        if (errosLocais.nivel || errosLocais.area) {
            setErroValidacao('');
            setTimeout(
                () =>
                    setErroValidacao(
                        'Opção selecionada inválida. Por favor, recarregue a página.',
                    ),
                50,
            );
            return;
        }

        setErroValidacao('');
        setErrosIndividuais({});

        const dados = {
            nivel_ensino: nivelSelecionado,
            area_conhecimento: areaSelecionada,
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
                                        {erroValidacao && (
                                            <Alerta
                                                mensagem={erroValidacao}
                                                variacao="warning"
                                            />
                                        )}

                                        <Form>
                                            <Form.Group
                                                className={`text-start ${
                                                    errosIndividuais.nivel
                                                        ? 'mb-3'
                                                        : 'mb-3 pb-4'
                                                }`}
                                                controlId="nivelEnsino"
                                            >
                                                <Form.Label className="fw-bold small mb-1">
                                                    Nível de Ensino
                                                </Form.Label>
                                                <Select
                                                    textFundo="Selecione o Nível de Ensino"
                                                    grupos={opcoes.niveis}
                                                    value={nivelSelecionado}
                                                    onChange={(e) => {
                                                        setNivelSelecionado(
                                                            e.target.value,
                                                        );
                                                        setErroValidacao('');
                                                        setErrosIndividuais(
                                                            (prev) => ({
                                                                ...prev,
                                                                nivel: '',
                                                            }),
                                                        );
                                                    }}
                                                    isInvalid={
                                                        !!errosIndividuais.nivel
                                                    }
                                                    mensagemErro={
                                                        errosIndividuais.nivel
                                                    }
                                                />
                                            </Form.Group>

                                            <Form.Group
                                                className={`text-start ${
                                                    errosIndividuais.area
                                                        ? 'mb-4'
                                                        : 'mb-4 pb-4'
                                                }`}
                                                controlId="areaConhecimento"
                                            >
                                                <Form.Label className="fw-bold small mb-1">
                                                    Área do conhecimento
                                                </Form.Label>
                                                <Select
                                                    textFundo="Selecione a Área"
                                                    grupos={opcoes.areas}
                                                    value={areaSelecionada}
                                                    onChange={(e) => {
                                                        setAreaSelecionada(
                                                            e.target.value,
                                                        );
                                                        setErroValidacao('');
                                                        setErrosIndividuais(
                                                            (prev) => ({
                                                                ...prev,
                                                                area: '',
                                                            }),
                                                        );
                                                    }}
                                                    isInvalid={
                                                        !!errosIndividuais.area
                                                    }
                                                    mensagemErro={
                                                        errosIndividuais.area
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
