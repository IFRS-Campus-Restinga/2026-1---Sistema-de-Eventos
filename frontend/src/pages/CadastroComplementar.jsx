import { useState } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Button from 'react-bootstrap/esm/Button';
import Select from '../components/common/Select';
import { useCsrf } from '../hooks/useCsrf';
import { useCadastro } from '../hooks/useCadastro';

// Mock para Informações do Usuário vindo do Hub de Sistemas
const usuarioHub = {
    id: 10293,
    nome: 'Sandro',
    email: 'sandro.aluno@ifrs.edu.br',
    cpf: '123.456.789-00',
};

export default function CadastroComplementar() {
    const { csrfToken } = useCsrf(); //Token CSRF
    const { executarSalvamento, carregando, opcoes } = useCadastro(); // Hook para lidar com o processo de cadastro

    // Estados para guardar o que o usuário selecionou
    const [nivelSelecionado, setNivelSelecionado] = useState('');
    const [areaSelecionada, setAreaSelecionada] = useState('');

    const clicarEmSalvar = () => {
        const dados = {
            usuario_id: usuarioHub.id,
            nivel_ensino: nivelSelecionado,
            area_conhecimento: areaSelecionada,
            // TODO: Por hora apenas para preencher espaço não está de fato complementando o cadastro, depois a gente vê o que mais precisa ser enviado para o backend
        };
        executarSalvamento(dados, csrfToken);
    };

    return (
        <main
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: '100vh', backgroundColor: '#059547' }} // Usando o mesmo verde da Home
        >
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6} xl={5}>
                        <div className="bg-white p-4 rounded-4 shadow position-relative">
                            {/* TODO: Botão de de Fechar X não sei a serventia, não sei se pode desvirtuar das telas, depois eu arrumo/}
                            <button
                                type="button"
                                className="btn-close position-absolute top-0 end-0 m-3"
                                aria-label="Fechar"
                            ></button>

                            <h4 className="fw-bold text-center mb-4 mt-2">
                                Complete seu Cadastro
                            </h4>

                            {/* Mensagem de boas vidas e aviso de cadastro complementar */}
                            <div className="mb-4 text-center">
                                <p className="mb-1 fs-5">
                                    Olá, <strong>{usuarioHub.nome}</strong>!
                                </p>
                                <p className="text-muted small mb-0 px-3">
                                    Identificamos o seu login pelo Hub de
                                    Sistemas. Para continuar navegando e
                                    participando dos eventos, precisamos apenas
                                    de mais algumas informações.
                                </p>
                            </div>

                            <div>
                                <Form>
                                    {/* Select de Nível de Ensino */}
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
                                            } // 2. Aqui ele altera o estado
                                        />
                                    </Form.Group>

                                    {/* Select de Área do Conhecimento */}
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

                                    {/* Botão de Salvar */}
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
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </main>
    );
}
