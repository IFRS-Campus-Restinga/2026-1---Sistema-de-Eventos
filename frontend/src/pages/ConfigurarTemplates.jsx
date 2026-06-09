//Bibliotecas
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';

//Componentes comuns
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import FormularioCustomizado from '../components/custom-form-card/FormularioCustomizado';

//Hooks
import { useCsrf } from '../hooks/useCsrf';
import { useConfigurarTemplates } from '../hooks/useConfigurarTemplates';

export default function ConfigurarTemplates({ campus = 'Campus Restinga' }) {
    const { csrfToken } = useCsrf();

    // Extração das propriedades e métodos estritamente necessários para o CRUD
    const {
        templates,
        templateEmEdicao,
        nomeExibicao,
        setNomeExibicao,
        assunto,
        setAssunto,
        mensagem,
        setMensagem,
        handleSelecionarTemplate,
        handleNovoTemplate,
        handleSalvar,
        handleDeletar,
    } = useConfigurarTemplates();

    // Campos da coluna direita
    const camposEdicao = [
        {
            tipo: 'text',
            titulo: 'Nome de Exibição (Identificação interna)',
            name: 'nomeExibicao',
            preValue: nomeExibicao,
            onChange: (valor) => setNomeExibicao(valor),
        },
        {
            tipo: 'text',
            titulo: 'Assunto do E-mail',
            name: 'assunto',
            preValue: assunto,
            onChange: (valor) => setAssunto(valor),
        },
        {
            tipo: 'textarea',
            titulo: 'Corpo da Mensagem',
            name: 'mensagem',
            preValue: mensagem,
            onChange: (valor) => setMensagem(valor),
        },
    ];

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />

            <main className="flex-grow-1 py-4">
                <Container>
                    <h2 className="mb-4">Configurar Templates de E-mail</h2>

                    <Row>
                        {/* Coluna Esquerda: Listagem de Templates */}
                        <Col md={5} lg={4} className="mb-4">
                            <div className="p-4 border rounded bg-light h-100 shadow-sm d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="text-dark fw-bold mb-0">
                                        Meus Templates
                                    </h5>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleNovoTemplate}
                                    >
                                        + Novo
                                    </Button>
                                </div>

                                <div
                                    className="overflow-auto"
                                    style={{
                                        maxHeight: '600px',
                                        paddingRight: '5px',
                                    }}
                                >
                                    <div className="d-flex flex-column gap-2">
                                        {templates?.map((t) => (
                                            <Button
                                                key={`${t.tipo}_${t.id}`}
                                                variant={
                                                    templateEmEdicao?.id ===
                                                        t.id &&
                                                    templateEmEdicao?.tipo ===
                                                        t.tipo
                                                        ? 'primary'
                                                        : 'white'
                                                }
                                                className="text-start border shadow-sm text-dark"
                                                onClick={() =>
                                                    handleSelecionarTemplate(t)
                                                }
                                            >
                                                <div className="fw-bold">
                                                    {t.nome_exibicao}
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Coluna Direita: Edição via FormularioCustomizado */}
                        <Col md={7} lg={8}>
                            <Form onSubmit={(e) => handleSalvar(e, csrfToken)}>
                                <div className="d-flex flex-column h-100">
                                    <FormularioCustomizado
                                        titulo={
                                            templateEmEdicao
                                                ? 'Editando Template'
                                                : 'Criar Novo Template'
                                        }
                                        corTexto="#106D47"
                                        campos={camposEdicao}
                                        orientacao="column"
                                        add={false}
                                    />

                                    <div className="d-flex justify-content-between mt-3">
                                        <Button
                                            variant="outline-danger"
                                            onClick={() =>
                                                handleDeletar(
                                                    templateEmEdicao?.id,
                                                    csrfToken,
                                                )
                                            }
                                        >
                                            Excluir Template
                                        </Button>

                                        <Button variant="primary" type="submit">
                                            {templateEmEdicao
                                                ? 'Salvar Alterações'
                                                : 'Salvar Novo Template'}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Col>
                    </Row>
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
