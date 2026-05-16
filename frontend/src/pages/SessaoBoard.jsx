import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';

import {
    MdArrowBack,
    MdSave,
    MdPublish,
    MdAddCircle,
    MdEdit,
} from 'react-icons/md';

import {
    useNavigate,
    useLocation,
    useSearchParams,
    useParams,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    DndContext,
    useDraggable,
    useDroppable,
    DragOverlay,
} from '@dnd-kit/core';

import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import Alerta from '../components/common/Alerta';
import useSessoes from '../hooks/useSessoes';
import useEspacos from '../hooks/useEspacos';
import ModalPopup from '../components/common/ModalPopup';

export default function SessaoBoard({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { id: eventoId } = useParams(); //pega o id da url para carregar o evento correto
    // dados gerais de evento, dias, sessoes, espaços
    const { evento, espaco, dias, loading, error, message, carregarEvento } =
        useSessoes();
    const { espacos, setEspacos, localSelecionado, fetchEspacos } =
        useEspacos();
    // data selecionada no dropdown
    const [dataSelecionada, setDataSelecionada] = useState('');
    // modal de escolha de espaço
    const [mostrarModalEspacos, setMostrarModalEspacos] = useState(false);
    // modal de inserção / edição de sessão - para quando clicar no card da sessão, ou no botão de adicionar sessão dentro do espaço
    const [mostrarModalSessao, setMostrarModalSessao] = useState(false);
    const [sessaoEditando, setSessaoEditando] = useState(null);

    // dados do form de sessao
    const [formSessao, setFormSessao] = useState({
        data_horario_inicio: '',
        data_horario_fim: '',
        espaco: null,
        ordem_apresentacoes: [],
    });

    // armazenamento de espaços do board e espaços disponíveis para alocação
    const [boardPorDia, setBoardPorDia] = useState({}); // de todos os dias do evento: estrutura: { '2024-10-01': [espacos], '2024-10-02': [espacos], ... }
    const [boardAtual, setBoardAtual] = useState([]); // de acordo com a data selecionada: estrutura: [espacos]

    const [espacoSelecionado, setEspacoSelecionado] = useState(null); // para saber em qual espaço estou adicionando a sessão no modal
    const [espacosDisponiveis, setEspacosDisponiveis] = useState([]);
    const [espacosExistentes, setEspacosExistentes] = useState([]); // teste, busca todos os espaços do local
    const [alterado, setAlterado] = useState(false); // estdo do board, botão
    // pesquisa no modalEspacos
    const [buscaEspaco, setBuscaEspaco] = useState('');
    // pesquisa nas atrações não alocadas
    const [buscaAtracao, setBuscaAtracao] = useState('');

    // para controlar o drag and drop
    const [activeItem, setActiveItem] = useState(null);
    // Para armazenar erros de validação
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (eventoId) {
            carregarEvento(eventoId);
        }
    }, [eventoId]);

    useEffect(() => {
        async function carregar() {
            if (evento?.local) {
                const dados = await fetchEspacos(evento.local.id);
                setEspacosExistentes(dados || []);
            }
        }
        carregar();
    }, [evento]);

    useEffect(() => {
        if (dias.length > 0) {
            setDataSelecionada(formatarData(dias[0]));
        }
    }, [dias]);

    useEffect(() => {
        setBoardAtual(boardPorDia[dataSelecionada] || []);
    }, [boardPorDia, dataSelecionada]);

    // MOCK DE DADOS
    const [atracoesNaoAlocadas, setAtracoesNaoAlocadas] = useState([
        {
            id: 999,
            titulo: 'era uma vez um dois tres quatro cinco seis, mais mais sete oito nove dez',
            autor: 'Maria Souza',
        },
        {
            id: 998,
            titulo: 'Nova atração teste 2',
            autor: 'Carlos Lima',
        },
    ]);

    {
        /*
    const [espacos, setEspacos] = useState([
        {
            id: 1,
            nome: 'Sala 101',
            capacidade: 50,
            sessoes: [
                {
                    id: 10,
                    data_horario_inicio: '08:00',
                    data_horario_fim: '10:30',
                    ordem_apresentacoes: [
                        {
                            id: 10,
                            horario_inicio: '08:00',
                            horario_fim: '08:30',
                            ordem: 1,
                            atracao: {
                                id: 1,
                                titulo: 'Abertura da Sessão',
                                autor: 'Diretoria',
                            },
                        },
                        {
                            id: 11,
                            horario_inicio: '08:30',
                            horario_fim: '09:00',
                            ordem: 2,
                            atracao: {
                                id: 10,
                                titulo: 'Vida marinha: uma narrativa',
                                autor: 'João da Silva',
                            },
                        },
                    ],
                },
            ],
        },
        {
            id: 2,
            nome: 'Sala 102 (Lab. Info)',
            capacidade: 30,
            sessoes: [
                {
                    id: 20,
                    data_horario_inicio: '08:00',
                    data_horario_fim: '10:30',
                    ordem_apresentacoes: [
                        {
                            id: 20,
                            horario_inicio: '08:00',
                            horario_fim: '08:30',
                            ordem: 1,
                            atracao: {
                                id: 22,
                                titulo: 'Oficina de teatro',
                                autor: 'NEABI',
                            },
                        },
                        {
                            id: 21,
                            horario_inicio: '08:30',
                            horario_fim: '09:00',
                            ordem: 2,
                            atracao: {
                                id: 220,
                                titulo: 'Tudo sobre Python',
                                autor: 'Jean Oliveira',
                            },
                        },
                    ],
                },
            ],
        },
        {
            id: 3,
            nome: 'Ginásio',
            capacidade: 200,
            sessoes: [
                {
                    id: 30,
                    data_horario_inicio: '08:00',
                    data_horario_fim: '10:30',
                    ordem_apresentacoes: [],
                },
            ],
        },
    ]);
    */
    }

    useEffect(() => {
        const salvo = localStorage.getItem(`board_evento_${eventoId}`);
        if (salvo) {
            setBoardPorDia(JSON.parse(salvo));
        }
    }, [eventoId]);

    {
        /* solução que o chatgpt trouxe */
    }
    function salvarRascunho() {
        localStorage.setItem(
            `board_evento_${eventoId}`,
            JSON.stringify(boardPorDia),
        );

        setAlterado(false);
    }

    function atualizarBoardAtual(novoBoard) {
        setBoardPorDia((prev) => ({
            ...prev,
            [dataSelecionada]: novoBoard,
        }));

        setAlterado(true);
    }

    const validarSessao = () => {
        const novosErros = {};

        const { data_horario_inicio, data_horario_fim } = formSessao;

        // 1. Campos obrigatórios
        if (!data_horario_inicio) {
            novosErros.inicio = 'Horário de início é obrigatório';
        }

        if (!data_horario_fim) {
            novosErros.fim = 'Horário de fim é obrigatório';
        }

        if (data_horario_inicio && data_horario_fim) {
            const inicio = new Date(
                `${dataSelecionada}T${data_horario_inicio}`,
            );
            const fim = new Date(`${dataSelecionada}T${data_horario_fim}`);

            // Fim maior que início
            if (fim <= inicio) {
                novosErros.fim = 'Horário de fim deve ser maior que o início';
            }

            // Duração mínima (10 min)
            const duracao = (fim - inicio) / 60000;
            if (duracao < 10) {
                novosErros.fim = 'Sessão deve ter no mínimo 10 minutos';
            }

            // Conflito com outras sessões do mesmo espaço
            const espaco = boardAtual.find((e) => e.id === formSessao.espaco);

            if (espaco) {
                const conflito = espaco.sessoes.some((sessao) => {
                    if (sessao.id === sessaoEditando?.id) return false; // ignora a própria sessão ao editar
                    if (!sessao.data_horario_inicio || !sessao.data_horario_fim)
                        return false;

                    const inicioExistente = new Date(
                        sessao.data_horario_inicio,
                    );
                    const fimExistente = new Date(sessao.data_horario_fim);

                    return inicio < fimExistente && fim > inicioExistente;
                });

                if (conflito) {
                    novosErros.conflito =
                        'Já existe uma sessão nesse horário neste espaço';
                }
            }
        }
        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    function salvarSessao() {
        if (!validarSessao()) return;

        const dadosSessao = {
            data_horario_inicio: `${dataSelecionada}T${formSessao.data_horario_inicio}`,
            data_horario_fim: `${dataSelecionada}T${formSessao.data_horario_fim}`,
        };

        const novoBoard = boardAtual.map((espaco) => {
            if (espaco.id !== formSessao.espaco) return espaco;

            if (sessaoEditando) {
                return {
                    ...espaco,
                    sessoes: espaco.sessoes.map((sessao) => {
                        if (sessao.id === sessaoEditando.id) {
                            return {
                                ...sessao,
                                ...dadosSessao,
                            };
                        }
                        return sessao;
                    }),
                };
            }

            return {
                ...espaco,
                sessoes: [
                    ...espaco.sessoes,
                    {
                        id: Date.now(),
                        ...dadosSessao,
                        ordem_apresentacoes: [],
                    },
                ],
            };
        });

        setSessaoEditando(null);
        atualizarBoardAtual(novoBoard);
        setMostrarModalSessao(false);
        setErrors({});
    }

    // ao selecionar um espaço no modal, adiciona ao board do dia
    const handleSelecionarEspaco = (espacoSelecionado) => {
        // evita duplicado
        if (boardAtual.some((e) => e.id === espacoSelecionado.id)) return;
        const novoEspaco = {
            id: espacoSelecionado.id,
            nome: espacoSelecionado.nome,
            capacidade: espacoSelecionado.capacidade,
            sessoes: [],
        };

        atualizarBoardAtual([...boardAtual, novoEspaco]);
        setMostrarModalEspacos(false);
    };

    // formata data para value do select
    function formatarData(data) {
        return data.toISOString().split('T')[0];
    }
    // formata data para label do select
    function formatarDataLabel(data) {
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        });
    }

    // para mover os cards entre as colunas
    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;

        const overId = over.id.toString();

        // Só aceita drop em sessão
        if (!overId.startsWith('sessao-')) return;

        const sessaoDestinoId = parseInt(overId.replace('sessao-', ''));

        // CASO 1: veio da lista (livre)
        if (active.id.toString().startsWith('livre-')) {
            const atracaoId = parseInt(active.id.replace('livre-', ''));

            const atracao = atracoesNaoAlocadas.find((a) => a.id === atracaoId);

            if (!atracao) return;

            const novaApresentacao = {
                id: atracao.id,
                atracao,
            };

            const novoBoard = boardAtual.map((espaco) => ({
                ...espaco,
                sessoes: espaco.sessoes.map((sessao) => {
                    if (sessao.id === sessaoDestinoId) {
                        return {
                            ...sessao,
                            ordem_apresentacoes: [
                                ...sessao.ordem_apresentacoes,
                                novaApresentacao,
                            ],
                        };
                    }
                    return sessao;
                }),
            }));

            atualizarBoardAtual(novoBoard);

            // remove da lista livre
            setAtracoesNaoAlocadas((prev) =>
                prev.filter((a) => a.id !== atracaoId),
            );

            return;
        }

        // CASO 2: mover entre sessões
        const apresentacaoId = parseInt(active.id.replace('apresentacao-', ''));

        let apresentacaoMovida = null;

        // Remove da origem
        const boardSemOrigem = boardAtual.map((espaco) => ({
            ...espaco,
            sessoes: espaco.sessoes.map((sessao) => {
                const encontrada = sessao.ordem_apresentacoes.find(
                    (a) => a.id === apresentacaoId,
                );

                if (encontrada) {
                    apresentacaoMovida = encontrada;

                    return {
                        ...sessao,
                        ordem_apresentacoes: sessao.ordem_apresentacoes.filter(
                            (a) => a.id !== apresentacaoId,
                        ),
                    };
                }

                return sessao;
            }),
        }));

        if (!apresentacaoMovida) return;

        // 2. ADICIONA no destino
        const boardFinal = boardSemOrigem.map((espaco) => ({
            ...espaco,
            sessoes: espaco.sessoes.map((sessao) => {
                if (sessao.id === sessaoDestinoId) {
                    return {
                        ...sessao,
                        ordem_apresentacoes: [
                            ...sessao.ordem_apresentacoes,
                            apresentacaoMovida,
                        ],
                    };
                }
                return sessao;
            }),
        }));

        atualizarBoardAtual(boardFinal);
    }

    function SessaoCard({ sessao, onEditar, children }) {
        const formatarHora = (data) => {
            if (!data) return '--:--';
            return new Date(data).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        return (
            <div
                className="mb-3 p-2 bg-white"
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    borderLeft: '6px solid #0d6efd',
                }}
            >
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong style={{ fontSize: '14px' }}>
                        {formatarHora(sessao.data_horario_inicio)} -{' '}
                        {formatarHora(sessao.data_horario_fim)}
                    </strong>

                    <MdEdit
                        size="16"
                        className="text-secondary cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={onEditar}
                    />
                </div>

                <SessaoDrop sessaoId={sessao.id}>{children}</SessaoDrop>
            </div>
        );
    }

    // Card atração arrastável
    function AtracaoDrag({ atracao, origem = 'sessao' }) {
        const id =
            origem === 'livre'
                ? `livre-${atracao.id}`
                : `apresentacao-${atracao.id}`;

        const { attributes, listeners, setNodeRef, transform, isDragging } =
            useDraggable({
                id,
            });

        const style = {
            transform: transform
                ? `translate(${transform.x}px, ${transform.y}px)`
                : undefined,
            cursor: 'grab',
            opacity: isDragging ? 0.5 : 1,
            zIndex: isDragging ? 1000 : 0,
        };

        return (
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                <div
                    className="mb-2 p-2 bg-white"
                    style={{
                        borderLeft: '6px solid #198754',
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        fontSize: '12px',
                    }}
                >
                    <small className="text-muted">#{atracao.id}</small>

                    <div style={{ fontWeight: 500 }}>
                        {atracao.titulo || atracao.atracao?.titulo}
                    </div>

                    <small style={{ fontSize: '10px' }}>
                        {atracao.autor || atracao.atracao?.autor}
                    </small>
                </div>
            </div>
        );
    }

    // Colunas do quadro(espaço)
    function SessaoDrop({ sessaoId, children }) {
        const { setNodeRef, isOver } = useDroppable({
            id: `sessao-${sessaoId}`,
        });

        const vazio = !children || children.length === 0;

        return (
            <div
                ref={setNodeRef}
                style={{
                    border: '2px dashed #ccc',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: isOver ? '#e6f7ff' : '',
                    minHeight: '60px',

                    border: vazio ? '2px dashed #ccc' : 'none',
                    display: vazio ? 'flex' : 'block',
                    alignItems: vazio ? 'center' : 'initial',
                    justifyContent: vazio ? 'center' : 'initial',
                    textAlign: vazio ? 'center' : 'left',
                }}
            >
                {vazio && 'Arraste aqui'}
                {children}
            </div>
        );
    }

    return (
        <>
            <NavBar />
            <main className="flex-fill">
                <Container className="mx-auto">
                    {/* Menu de datas */}
                    <Row className="mx-auto my-4 align-items-center">
                        <h1>{evento?.nome || 'Carregando evento...'}</h1>

                        <Col md={4}>
                            <Form.Select
                                value={dataSelecionada}
                                onChange={(e) =>
                                    setDataSelecionada(e.target.value)
                                }
                            >
                                {dias.map((dia, index) => (
                                    <option
                                        key={index}
                                        value={formatarData(dia)}
                                    >
                                        {formatarDataLabel(dia)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            {/* BOTÃO ADICIONAR ESPAÇO*/}
                            <Button
                                className="w-100 mt-2 fw-bold"
                                style={{
                                    backgroundColor: '#0d6efd',
                                    border: 'none',
                                    fontSize: '14px',
                                }}
                                onClick={() => setMostrarModalEspacos(true)}
                            >
                                + Adicionar Espaço
                            </Button>
                        </Col>

                        {/* Botões de ação */}
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-secondary"
                                className="fw-bold"
                                onClick={salvarRascunho}
                            >
                                <MdSave className="me-1" />
                                Salvar rascunho
                            </Button>

                            <Button variant="primary" className="fw-bold">
                                <MdPublish className="me-1" />
                                Publicar Agenda
                            </Button>
                        </Col>
                    </Row>

                    {/* Quadro de espaços */}
                    <DndContext
                        onDragStart={({ active }) => {
                            setActiveItem(active.id);
                        }}
                        onDragEnd={(event) => {
                            handleDragEnd(event);
                            setActiveItem(null);
                        }}
                    >
                        <Row className="g-3">
                            {/* COLUNAS DE ESPAÇO */}
                            <Col md={9}>
                                <Row className="g-3">
                                    {boardAtual.map((espaco) => {
                                        const sessoesOrdenadas = [
                                            ...(espaco.sessoes || []),
                                        ].sort(
                                            (a, b) =>
                                                new Date(
                                                    a.data_horario_inicio,
                                                ) -
                                                new Date(b.data_horario_inicio),
                                        );
                                        return (
                                            <Col key={espaco.id} md={4}>
                                                {/* HEADER DA SALA */}
                                                <div
                                                    className="p-2 rounded text-white mb-2 d-flex justify-content-between align-items-start"
                                                    style={{
                                                        backgroundColor:
                                                            '#198754',
                                                    }}
                                                >
                                                    <div>
                                                        <strong>
                                                            {espaco.nome}
                                                        </strong>
                                                        <br />
                                                        <small>
                                                            Capacidade:{' '}
                                                            {espaco.capacidade}
                                                        </small>
                                                    </div>
                                                    {espaco.sessoes.length >
                                                        0 && (
                                                        <MdAddCircle
                                                            color="rgb(120, 142, 238)"
                                                            size={20}
                                                            title="Adicionar uma sessão"
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => {
                                                                setSessaoEditando(
                                                                    null,
                                                                );
                                                                setFormSessao({
                                                                    data_horario_inicio:
                                                                        '',
                                                                    data_horario_fim:
                                                                        '',
                                                                    espaco: espaco.id,
                                                                    ordem_apresentacoes:
                                                                        [],
                                                                });
                                                                setMostrarModalSessao(
                                                                    true,
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                    <br />
                                                </div>

                                                {/* Cards */}
                                                {sessoesOrdenadas.map(
                                                    (sessao) => (
                                                        <SessaoCard
                                                            key={sessao.id}
                                                            sessao={sessao}
                                                            onEditar={() => {
                                                                setSessaoEditando(
                                                                    sessao,
                                                                );
                                                                setFormSessao({
                                                                    data_horario_inicio:
                                                                        sessao.data_horario_inicio.split(
                                                                            'T',
                                                                        )[1],
                                                                    data_horario_fim:
                                                                        sessao.data_horario_fim.split(
                                                                            'T',
                                                                        )[1],
                                                                    espaco: espaco.id,
                                                                });
                                                                setEspacoSelecionado(
                                                                    espaco.id,
                                                                );
                                                                setMostrarModalSessao(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            {sessao.ordem_apresentacoes.map(
                                                                (ordem) => (
                                                                    <AtracaoDrag
                                                                        key={
                                                                            ordem.id
                                                                        }
                                                                        atracao={
                                                                            ordem
                                                                        }
                                                                        origem="sessao"
                                                                    />
                                                                ),
                                                            )}
                                                        </SessaoCard>
                                                    ),
                                                )}

                                                {/* Drop area */}
                                                {espaco.sessoes.length === 0 ? (
                                                    <div
                                                        className="mt-2 text-center"
                                                        style={{
                                                            border: '2px dashed #ccc',
                                                            padding: '10px',
                                                            borderRadius: '5px',
                                                        }}
                                                    >
                                                        Arraste aqui
                                                        <br />
                                                        <MdAddCircle
                                                            color="rgb(120, 142, 238)"
                                                            size={20}
                                                            title="Adicionar uma sessão"
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => {
                                                                setSessaoEditando(
                                                                    null,
                                                                );
                                                                setFormSessao({
                                                                    data_horario_inicio:
                                                                        '',
                                                                    data_horario_fim:
                                                                        '',
                                                                    espaco: espaco.id,
                                                                    ordem_apresentacoes:
                                                                        [],
                                                                });
                                                                setMostrarModalSessao(
                                                                    true,
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                ) : null}
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Col>
                        </Row>
                        <Row className="g-3 mt-4">
                            <Col>
                                <div className="p-2 border rounded bg-white h-100">
                                    {/* CONTADOR DE ATRAÇÕES NÃO ALOCADAS */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <strong style={{ fontSize: '12px' }}>
                                            AGUARDANDO ALOCAÇÃO (
                                            {atracoesNaoAlocadas.length})
                                        </strong>
                                    </div>

                                    {/* BUSCA */}
                                    <Form.Control
                                        size="sm"
                                        type="text"
                                        placeholder="Buscar espaço..."
                                        className="mb-2"
                                        value={buscaAtracao}
                                        onChange={(e) =>
                                            setBuscaAtracao(e.target.value)
                                        }
                                    />

                                    {/* LISTA */}
                                    <div
                                        style={{
                                            maxHeight: '60vh',
                                            overflowY: 'auto',
                                            display: 'grid',
                                            gridTemplateColumns:
                                                'repeat(3, 1fr)',
                                            gap: '8px',
                                        }}
                                    >
                                        {atracoesNaoAlocadas
                                            .filter((e) =>
                                                e.titulo
                                                    .toLowerCase()
                                                    .includes(
                                                        buscaAtracao.toLowerCase(),
                                                    ),
                                            )
                                            .map((atracao) => (
                                                <AtracaoDrag
                                                    key={atracao.id}
                                                    atracao={atracao}
                                                    origem="livre"
                                                />
                                            ))}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </DndContext>

                    <DragOverlay>
                        {activeItem ? (
                            <div
                                style={{
                                    padding: 8,
                                    background: 'white',
                                    borderRadius: 10,
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                }}
                            >
                                Arrastando...
                            </div>
                        ) : null}
                    </DragOverlay>

                    {/* Botão de voltar */}
                    <Row className="my-4">
                        <Col className="d-flex justify-content-end">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="fw-bold"
                                onClick={() => navigate('/dashboard')}
                            >
                                <MdArrowBack className="me-2" />
                                Voltar
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>

            {/* Modal de escolha de espaço */}
            <ModalPopup
                show={mostrarModalEspacos}
                titulo="Adicionar Espaço"
                textoFechar="Cancelar"
                onFechar={() => setMostrarModalEspacos(false)}
            >
                <div>
                    <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Buscar espaço..."
                        className="mb-2"
                        value={buscaEspaco}
                        onChange={(e) => setBuscaEspaco(e.target.value)}
                    />

                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {espacosExistentes.length === 0 && (
                            <p className="text-muted">
                                Nenhum espaço disponível
                            </p>
                        )}

                        {espacosExistentes
                            .filter((e) =>
                                e.nome
                                    .toLowerCase()
                                    .includes(buscaEspaco.toLowerCase()),
                            )
                            .map((espaco) => (
                                <div
                                    key={espaco.id}
                                    onClick={() =>
                                        handleSelecionarEspaco(espaco)
                                    }
                                    className="p-2 mb-1 border rounded"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ fontWeight: 450 }}>
                                        {espaco.nome}
                                    </div>
                                    <small className="text-muted">
                                        Cap: {espaco.capacidade}
                                    </small>
                                </div>
                            ))}
                    </div>
                </div>
            </ModalPopup>

            {/* Modal de inserção/edição de sessão */}
            <ModalPopup
                show={mostrarModalSessao}
                titulo={sessaoEditando ? 'Editar Sessão' : 'Criar Sessão'}
                textoFechar="Cancelar"
                textoAcao="Salvar"
                onFechar={() => {
                    setMostrarModalSessao(false);
                    setErrors({});
                }}
                onAcao={salvarSessao}
            >
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>Horário início</Form.Label>
                        <Form.Control
                            type="time"
                            value={formSessao.data_horario_inicio}
                            isInvalid={!!errors.inicio}
                            onChange={(e) =>
                                setFormSessao({
                                    ...formSessao,
                                    data_horario_inicio: e.target.value,
                                })
                            }
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.inicio}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Horário fim</Form.Label>
                        <Form.Control
                            type="time"
                            value={formSessao.data_horario_fim}
                            isInvalid={!!errors.fim}
                            onChange={(e) =>
                                setFormSessao({
                                    ...formSessao,
                                    data_horario_fim: e.target.value,
                                })
                            }
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.fim}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {errors.conflito && (
                        <div className="text-danger mt-2">
                            {errors.conflito}
                        </div>
                    )}

                    <small className="text-muted">
                        Data: {dataSelecionada}
                    </small>
                </Form>
            </ModalPopup>

            {/* ALERTAS MOCK */}
            {message && (
                <Alerta mensagem={message} variacao="success" duracao={5000} />
            )}

            {error && (
                <Alerta mensagem={error} variacao="danger" duracao={5000} />
            )}

            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
