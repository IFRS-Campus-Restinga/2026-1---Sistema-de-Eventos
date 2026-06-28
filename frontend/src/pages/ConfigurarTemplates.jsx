// Bibliotecas
import { useState } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';

// Componentes comuns
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import FormularioCustomizado from '../components/custom-form-card/FormularioCustomizado';
import ModalPopup from '../components/common/ModalPopup';

// Hooks
import { useCsrf } from '../hooks/useCsrf';
import { useConfigurarTemplates } from '../hooks/useConfigurarTemplates';

export default function ConfigurarTemplates({ campus = 'Campus Restinga' }) {
    const { csrfToken } = useCsrf();

    // Estados do Tutorial
    const [mostrarTutorial, setMostrarTutorial] = useState(false);
    const [etapaTutorial, setEtapaTutorial] = useState(0);

    const etapasTutorial = [
        {
            titulo: '1. Gerenciamento de Templates',
            conteudo: (
                <>
                    <p>
                        A coluna da esquerda exibe a lista de templates salvos
                        no seu perfil.
                    </p>
                    <p>
                        Para editar um template existente, clique sobre o nome
                        dele na lista. Para criar um modelo em branco, clique no
                        botão <b>+ Novo</b>.
                    </p>
                </>
            ),
        },
        {
            titulo: '2. Edição de Conteúdo',
            conteudo: (
                <>
                    <p>
                        A coluna da direita contém o formulário de edição do
                        template selecionado.
                    </p>
                    <ul>
                        <li>
                            <b>Nome do Template:</b> É a identificação interna
                            que aparecerá na lista de seleção.
                        </li>
                        <li>
                            <b>Assunto do E-mail:</b> O título que o
                            destinatário verá na caixa de entrada.
                        </li>
                        <li>
                            <b>Corpo da Mensagem:</b> O conteúdo principal do
                            e-mail.
                        </li>
                    </ul>
                </>
            ),
        },
        {
            titulo: '3. Uso de Tags Dinâmicas',
            conteudo: (
                <>
                    <p>
                        Ao redigir o template, é possível incluir tags que serão
                        substituídas por dados reais no momento do envio:
                    </p>
                    <ul>
                        <li>
                            <code>%nome_usuario%</code> - Nome do destinatário
                        </li>
                        <li>
                            <code>%nome_evento%</code> - Nome do evento
                        </li>
                        <li>
                            <code>%nome_trabalho%</code> - Título da
                            submissão/atração
                        </li>
                        <li>
                            <code>%autores%</code> - Lista de autores do
                            trabalho
                        </li>
                    </ul>
                    <p className="text-muted small">
                        Estas tags garantem que o comunicado seja devidamente
                        personalizado para cada participante da atração.
                    </p>
                </>
            ),
        },
        {
            titulo: '4. Salvar ou Excluir',
            conteudo: (
                <>
                    <p>
                        Após preencher as informações, utilize o botão{' '}
                        <b>Salvar Alterações</b> (ou Salvar Novo Template) para
                        gravar o registro no sistema.
                    </p>
                    <p>
                        Caso um template não seja mais necessário, selecione-o
                        na lista e clique em <b>Excluir Template</b>. Esta ação
                        removerá o modelo permanentemente do seu perfil.
                    </p>
                </>
            ),
        },
    ];

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
        showModalExcluir,
        setShowModalExcluir,
    } = useConfigurarTemplates();

    // Campos da coluna direita
    const camposEdicao = [
        {
            tipo: 'text',
            titulo: 'Nome do Template',
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
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            {/* Modal do Tutorial */}
            {mostrarTutorial && (
                <ModalPopup
                    show={mostrarTutorial}
                    titulo={etapasTutorial[etapaTutorial]?.titulo}
                    textoFechar=""
                    onFechar={() => {
                        setMostrarTutorial(false);
                        setEtapaTutorial(0);
                    }}
                >
                    {etapasTutorial[etapaTutorial]?.conteudo}

                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                        <Button
                            variant="secondary"
                            disabled={etapaTutorial === 0}
                            onClick={() => setEtapaTutorial((prev) => prev - 1)}
                        >
                            Anterior
                        </Button>

                        {etapaTutorial === etapasTutorial.length - 1 ? (
                            <Button
                                variant="success"
                                onClick={() => {
                                    setMostrarTutorial(false);
                                    setEtapaTutorial(0);
                                }}
                            >
                                Concluir
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() =>
                                    setEtapaTutorial((prev) => prev + 1)
                                }
                            >
                                Próximo
                            </Button>
                        )}
                    </div>
                </ModalPopup>
            )}

            <main className="flex-grow-1 py-4">
                <Container>
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <h2 className="mb-0">Configurar Templates de E-mail</h2>
                        <Button
                            variant="outline-info"
                            onClick={() => setMostrarTutorial(true)}
                        >
                            Como usar?
                        </Button>
                    </div>

                    <Row>
                        {/* Coluna Esquerda: Listagem de Templates */}
                        <Col
                            md={5}
                            lg={4}
                            className="mb-4 d-flex flex-column text-secondary bg-white rounded-4 py-3 px-3"
                            style={{
                                border: '1px solid rgba(0,0,0,0.09)',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)',
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex flex-column text-secondary">
                                    <span className="fw-bold fs-3 text-black">
                                        Meus Templates
                                    </span>
                                    <span>Gerencie seus e-mails</span>
                                </div>
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
                                                templateEmEdicao?.id === t.id &&
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
                        </Col>

                        {/* Coluna Direita: Edição via FormularioCustomizado */}
                        <Col md={7} lg={8}>
                            <Form
                                key={
                                    templateEmEdicao
                                        ? templateEmEdicao.id
                                        : 'novo'
                                }
                                onSubmit={(e) => handleSalvar(e, csrfToken)}
                            >
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

                                    <div className="d-flex justify-content-end gap-3 mt-3">
                                        {/* O botão de excluir só aparece se houver um template em edição */}
                                        {templateEmEdicao && (
                                            <Button
                                                variant="outline-danger"
                                                onClick={() =>
                                                    setShowModalExcluir(true)
                                                }
                                            >
                                                Excluir Template
                                            </Button>
                                        )}

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

            <ModalPopup
                show={showModalExcluir}
                titulo={templateEmEdicao?.nome_exibicao || 'Excluir Template'}
                tituloSecundario=""
                texto="Quer realmente excluir este template?"
                textoFechar="Voltar"
                onFechar={() => setShowModalExcluir(false)}
                textoAcao="Excluir"
                onAcao={() => handleDeletar(csrfToken)}
                variante="danger"
            />

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus={campus}
            />
        </div>
    );
}
