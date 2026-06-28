// Bibliotecas
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/esm/Form';
import { Spinner } from 'react-bootstrap';
import { BsGearFill } from 'react-icons/bs';

// Componentes comuns
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta.jsx';
import FormularioCustomizado from '../components/custom-form-card/FormularioCustomizado';
import ModalPopup from '../components/common/ModalPopup';

// Hooks
import { useCsrf } from '../hooks/useCsrf';
import { useEnviarEmails } from '../hooks/useEnviarEmails';

export default function EnviarEmails({ campus = 'Campus Restinga' }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();

    // Estados do Tutorial
    const [mostrarTutorial, setMostrarTutorial] = useState(false);
    const [etapaTutorial, setEtapaTutorial] = useState(0);

    const etapasTutorial = [
        {
            titulo: '1. Seleção de Destinatários',
            conteudo: (
                <>
                    <p>
                        A coluna da esquerda exibe as atrações do evento,
                        organizadas por turno.
                    </p>

                    <p>
                        Para definir quem receberá o e-mail, selecione as
                        atrações desejadas.
                        <br />O sistema enviará um e-mail para
                        <b> todos os inscritos das atrações selecionadas </b>.
                    </p>

                    <div className="border rounded p-3 bg-light my-3">
                        <Form.Check
                            type="switch"
                            id="tut-selecionar-todos"
                            label="Todo o Evento"
                            checked={true}
                            readOnly
                            className="fw-bold text-primary mb-2"
                        />
                        <span className="text-muted small">
                            Utilize esta opção para selecionar rapidamente todas
                            as atrações do evento.
                        </span>
                    </div>
                </>
            ),
        },
        {
            titulo: '2. Utilizando Templates',
            conteudo: (
                <>
                    <p>
                        Para agilizar a comunicação, você pode utilizar modelos
                        prontos de e-mail.
                    </p>
                    <p>
                        No campo <b>Templates</b>, você encontrará duas
                        categorias:
                    </p>
                    <ul>
                        <li>
                            <b>[Sistema]:</b> Modelos de preenchimento básico
                            disponibilizados por padrão na plataforma.
                        </li>
                        <li>
                            <b>Modelos sem colchetes:</b> Seus templates
                            personalizados guardados em seu perfil.
                        </li>
                    </ul>

                    <p className="mt-2 text-muted small">
                        Dica: Clique no ícone de engrenagem (
                        <BsGearFill size={12} className="mx-1" />) ao lado do
                        título para criar ou editar seus próprios templates.
                    </p>
                </>
            ),
        },
        {
            titulo: '3. Tags Dinâmicas (Personalização)',
            conteudo: (
                <>
                    <p>
                        Você pode personalizar o e-mail para cada destinatário
                        utilizando <b>Tags Dinâmicas</b>. Ao enviar, o sistema
                        substituirá essas tags pelas informações reais de cada
                        participante.
                    </p>

                    <p>
                        Tags disponíveis para uso no <b>Assunto</b> ou na{' '}
                        <b>Mensagem</b>:
                    </p>

                    <ul className="list-group list-group-flush border rounded mb-3">
                        <li className="list-group-item bg-light py-2">
                            <code className="fw-bold fs-6">%nome_usuario%</code>
                            <br />
                            <small className="text-secondary">
                                Nome e sobrenome do destinatário do e-mail.
                            </small>
                        </li>
                        <li className="list-group-item bg-light py-2">
                            <code className="fw-bold fs-6">%nome_evento%</code>
                            <br />
                            <small className="text-secondary">
                                Nome do evento atual.
                            </small>
                        </li>
                        <li className="list-group-item bg-light py-2">
                            <code className="fw-bold fs-6">
                                %nome_trabalho%
                            </code>
                            <br />
                            <small className="text-secondary">
                                Título do trabalho/atração na qual o usuário
                                está inscrito.
                            </small>
                        </li>
                        <li className="list-group-item bg-light py-2">
                            <code className="fw-bold fs-6">%autores%</code>
                            <br />
                            <small className="text-secondary">
                                Lista de autores do trabalho em questão.
                            </small>
                        </li>
                    </ul>

                    <p className="text-muted small mb-0">
                        Exemplo escrevendo a mensagem:{' '}
                        <i>
                            "Olá, %nome_usuario%. O trabalho %nome_trabalho% foi
                            avaliado."
                        </i>
                        Exemplo dessa mensagem no e-mail:{' '}
                        <i>
                            "Olá, Fernando Oliveira. O trabalho Tecnologias
                            sociais para economia solidária foi avaliado."
                        </i>
                    </p>
                </>
            ),
        },
        {
            titulo: '4. Envio do Comunicado',
            conteudo: (
                <>
                    <p>
                        Após selecionar as atrações e escrever sua mensagem (ou
                        carregar um template), clique no botão:
                    </p>

                    <div className="text-center my-3 border rounded p-2 bg-light">
                        <Button variant="primary" className="fw-bold" disabled>
                            Enviar Comunicado
                        </Button>
                    </div>

                    <p>
                        <b>Mensagem de confirmação:</b> No canto inferior
                        direito aparecerá uma notificação confirmando o envio do
                        e-mail
                    </p>
                </>
            ),
        },
    ];

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
                        onClick={() => navigate('/configurar_templates')}
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

            {notificacao?.mensagem && (
                <Alerta
                    mensagem={notificacao.mensagem}
                    variacao={notificacao.variacao}
                />
            )}

            <main className="flex-grow-1 py-4">
                <Container>
                    <div className="d-flex align-items-center gap-3">
                        <h1>Envio de E-mails</h1>
                        <Button
                            variant="outline-info"
                            onClick={() => setMostrarTutorial(true)}
                        >
                            Como usar?
                        </Button>
                    </div>
                    <h3> {nomeEvento} </h3>

                    <Form onSubmit={(e) => handleSubmit(e, csrfToken)}>
                        <Row>
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
                                            Grupos de Envio
                                        </span>
                                        <span>
                                            Gerencie as atrações do evento
                                        </span>
                                    </div>
                                </div>

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
                                                onChange={handleSelecionarTodos}
                                                className="fw-bold text-primary"
                                            />
                                        </div>

                                        <div
                                            className="overflow-auto lista-atracoes"
                                            style={{
                                                maxHeight: '600px',
                                                paddingRight: '5px',
                                            }}
                                        >
                                            {selecaoAtracoes('manha', 'Manhã')}
                                            {selecaoAtracoes('tarde', 'Tarde')}
                                            {selecaoAtracoes('noite', 'Noite')}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted small">
                                        Nenhuma atração encontrada para este
                                        evento.
                                    </p>
                                )}
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
