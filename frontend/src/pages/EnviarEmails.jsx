//Bibliotecas
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/esm/Form';
import { Spinner } from 'react-bootstrap';
import { BsGearFill } from 'react-icons/bs';

//Componentes comuns
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta.jsx';
import FormularioCustomizado from '../components/custom-form-card/FormularioCustomizado';

//Hooks
import { useCsrf } from '../hooks/useCsrf';
import { useEnviarEmails } from '../hooks/useEnviarEmails';

export default function EnviarEmails({ campus = 'Campus Restinga' }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();

    // Extração das propriedades e métodos encapsulados no hook
    const {
        atracoes,
        nomeEvento,
        carregando,
        notificacao,
        assunto,
        setAssunto,
        mensagem,
        setMensagem,
        atracoesSelecionadas,
        enviando,
        handleCheckboxChange,
        handleSelecionarTodos,
        handleSubmit,

        // Fazendo agora
        templates = [],
        templateSelecionado,
        handleTemplateChange,
    } = useEnviarEmails(id);

    // Campos da coluna direita
    const camposComposicao = [
        {
            tipo: 'select',
            titulo: (
                <span className="d-flex align-items-center gap-2">
                    Templates
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="d-flex align-items-center justify-content-center p-0"
                        style={{ width: '28px', height: '28px' }}
                        title="Configurar Meus Templates"
                        onClick={() => navigate('/configurar_templates')} // Redirecionamento aplicado
                    >
                        <BsGearFill size={14} />
                    </Button>
                </span>
            ),
            name: 'template',
            preValue: templateSelecionado,
            onChange: (valor) => handleTemplateChange(valor),
            opcoes: [
                {
                    text: '-- Selecione um template para preencher a mensagem --',
                    value: '',
                    disabled: true,
                },
                ...templates
                    .filter((t) => t.tipo === 'sistema')
                    .map((t) => ({
                        text: `[Sistema] ${t.nome_exibicao}`,
                        value: `sistema_${t.id}`,
                    })),
                ...templates
                    .filter((t) => t.tipo === 'perfil')
                    .map((t) => ({
                        text: t.nome_exibicao,
                        value: `perfil_${t.id}`,
                    })),
            ],
        },

        {
            tipo: 'text',
            titulo: 'Assunto',
            name: 'assunto',
            preValue: assunto,
            onChange: (valor) => setAssunto(valor),
        },
        {
            tipo: 'textarea',
            titulo: 'Mensagem',
            name: 'mensagem',
            preValue: mensagem,
            onChange: (valor) => setMensagem(valor),
        },
    ];

    const selecaoAtracoes = (turno, titulo) => {
        const atracoesDoTurno = atracoes.filter((a) => a.turno === turno);

        return (
            <div className="mb-4">
                <h6 className="text-secondary border-bottom pb-1 mb-3">
                    {titulo}
                </h6>
                {atracoesDoTurno.length === 0 ? (
                    <p className="text-muted small ms-2">
                        Nenhuma atração para este turno.
                    </p>
                ) : (
                    atracoesDoTurno.map((atracao) => (
                        <Form.Check
                            key={atracao.id}
                            type="switch"
                            id={`switch-${atracao.id}`}
                            label={atracao.titulo}
                            checked={atracoesSelecionadas.includes(atracao.id)}
                            onChange={() => handleCheckboxChange(atracao.id)}
                            className="mb-2 ms-2"
                        />
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />

            {notificacao?.mensagem && (
                <Alerta
                    mensagem={notificacao.mensagem}
                    variacao={notificacao.variacao}
                />
            )}

            <main className="flex-grow-1 py-4">
                <Container>
                    <h1>Envio de E-mails </h1>
                    <h3> {nomeEvento} </h3>

                    <Form onSubmit={(e) => handleSubmit(e, csrfToken)}>
                        <Row>
                            {/* Coluna Esquerda: Seleção de Público Nativa */}
                            <Col md={5} lg={4} className="mb-4">
                                <div className="p-4 border rounded bg-light h-100 shadow-sm">
                                    <h5 className="mb-4 text-dark fw-bold">
                                        Grupos de Envio
                                    </h5>

                                    {carregando ? (
                                        <div className="text-center py-5">
                                            <Spinner
                                                animation="border"
                                                variant="secondary"
                                            />
                                        </div>
                                    ) : atracoes && atracoes.length > 0 ? (
                                        <>
                                            <div className="mb-4 pb-3 border-bottom">
                                                <Form.Check
                                                    type="switch"
                                                    id="selecionar-todos"
                                                    label="Todo o Evento"
                                                    checked={
                                                        atracoesSelecionadas.length ===
                                                        atracoes.length
                                                    }
                                                    onChange={
                                                        handleSelecionarTodos
                                                    }
                                                    className="fw-bold text-primary"
                                                />
                                            </div>

                                            <div
                                                className="lista-atracoes"
                                                style={{
                                                    maxHeight: '500px',
                                                    overflowY: 'auto',
                                                    paddingRight: '5px',
                                                }}
                                            >
                                                {selecaoAtracoes(
                                                    'manha',
                                                    'Manhã',
                                                )}
                                                {selecaoAtracoes(
                                                    'tarde',
                                                    'Tarde',
                                                )}
                                                {selecaoAtracoes(
                                                    'noite',
                                                    'Noite',
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-muted small">
                                            Nenhuma atração encontrada para este
                                            evento.
                                        </p>
                                    )}
                                </div>
                            </Col>

                            {/* Coluna Direita: Composição via FormularioCustomizado */}
                            <Col md={7} lg={8}>
                                <div className="d-flex flex-column h-100">
                                    <FormularioCustomizado
                                        titulo="Composição da Mensagem"
                                        corTexto="#106D47"
                                        campos={camposComposicao}
                                        orientacao="column"
                                        add={false}
                                    />

                                    <div className="d-flex justify-content-end mt-3">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={enviando || carregando}
                                        >
                                            {enviando ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Enviando...
                                                </>
                                            ) : (
                                                'Enviar Comunicado'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Form>
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
