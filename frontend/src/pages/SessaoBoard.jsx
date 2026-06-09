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
import { listarAtracoes } from '../services/atracaoService';
import ModalPopup from '../components/common/ModalPopup';
import { obterCorPorTag } from '../utils/themeTags';

// ordem fica sem id no frontend enquanto nõ salva no banco
export default function SessaoBoard({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { id: eventoId } = useParams(); //pega o id da url para carregar o evento correto
    // dados gerais de evento, dias, sessoes, espaços
    const {
        evento,
        espaco,
        dias,
        loading,
        error,
        message,
        sessoes,
        sessaoSelecionada,
        fetchSessoes,
        buscarSessao,
        editarSessao,
        carregarEvento,
        adicionaSessao,
        salvarOrdemApresentacoes,
    } = useSessoes();
    const { espacos, setEspacos, localSelecionado, fetchEspacos } =
        useEspacos();
    const [atracoesNaoAlocadas, setAtracoesNaoAlocadas] = useState([]);
    // data selecionada no dropdown
    const [dataSelecionada, setDataSelecionada] = useState('');
    // modal informativo/ tutorial de como usar o board
    const [mostrarTutorial, setMostrarTutorial] = useState(false);
    const [etapaTutorial, setEtapaTutorial] = useState(0);
    // modal de escolha de espaço
    const [mostrarModalEspacos, setMostrarModalEspacos] = useState(false);
    // modal de inserção / edição de sessão - para quando clicar no card da sessão, ou no botão de adicionar sessão dentro do espaço
    const [mostrarModalSessao, setMostrarModalSessao] = useState(false);
    const [sessaoEditando, setSessaoEditando] = useState(null);
    // modal de inserção / edição do atributo publicado_em das sessões
    const [mostrarModalPublicacao, setMostrarModalPublicacao] = useState(false);
    const [publicadoEditando, setPublicadoEditando] = useState(null);
    // dados do form de sessao
    const [formSessao, setFormSessao] = useState({
        nome: '',
        data_horario_inicio: '',
        data_horario_fim: '',
        espaco: null,
        ordem_apresentacoes: [],
    });
    // dados do form de publicação
    const [formPublicacao, setFormPublicacao] = useState({
        publicado_em: '',
    });
    // armazenamento de espaços do board e espaços disponíveis para alocação
    const [boardPorDia, setBoardPorDia] = useState({}); // de todos os dias do evento: estrutura: { '2024-10-01': [espacos], '2024-10-02': [espacos], ... }
    const [boardAtual, setBoardAtual] = useState([]); // de acordo com a data selecionada: estrutura: [espacos]

    const [espacoSelecionado, setEspacoSelecionado] = useState(null); // para saber em qual espaço estou adicionando a sessão no modal
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

    // modal de tutorial: divisão das visualizações em etapas, para mostrar aos poucos as funcionalidades
    const etapasTutorial = [
        {
            titulo: '1. Seleção do dia',
            conteudo: (
                <>
                    <p>A programação é organizada por dia.</p>

                    <p>
                        No canto superior esquerdo da tela está o seletor de
                        datas.
                    </p>

                    <div className="border rounded p-2 bg-light">
                        <Form.Select disabled>
                            <option>01/08</option>
                        </Form.Select>
                    </div>

                    <p className="mt-2">
                        Cada data representa um dia do evento. Ao trocar a data,
                        o quadro de espaços e sessões exibido será atualizado
                        para aquele dia específico.
                    </p>
                </>
            ),
        },

        {
            titulo: '2. Adicionar espaços ao board',
            conteudo: (
                <>
                    <p>
                        O quadro central da página é composto pelos espaços onde
                        ocorrerão as atividades do evento.
                    </p>

                    <p>
                        Antes de criar sessões, é necessário adicionar pelo
                        menos um espaço ao quadro.
                    </p>

                    <p>Clique em:</p>
                    <div className="text-center my-3">
                        <Button
                            className="w-100 mt-2 fw-bold"
                            style={{
                                backgroundColor: '#0d6efd',
                                border: 'none',
                                fontSize: '14px',
                            }}
                        >
                            + Adicionar Espaço
                        </Button>
                    </div>

                    <p className="mt-2">
                        Será exibida uma lista com todos os espaços disponíveis
                        do local do evento.
                    </p>

                    <p>
                        Ao selecionar um espaço, ele será adicionada uma nova
                        coluna ao quadro.
                    </p>
                </>
            ),
        },

        {
            titulo: '3. Criar sessões',
            conteudo: (
                <>
                    <p>Cada coluna representa um espaço físico do evento.</p>
                    <p>
                        Para criar uma sessão, clique no ícone{' '}
                        <MdAddCircle
                            color="rgb(120, 142, 238)"
                            size={20}
                            title="Adicionar uma sessão"
                        />{' '}
                        exibido no cabeçalho da coluna desejada.
                    </p>
                    <p>Informe:</p>
                    <ul>
                        <li>Nome da sessão</li>
                        <li>Horário de início</li>
                        <li>Horário de término</li>
                    </ul>
                    <p>
                        O sistema verifica conflitos de horário automaticamente.
                    </p>
                    Observação:
                    <ul>
                        <li>
                            Caso seja necessário alterar informações de uma
                            sessão já criada, utilize o ícone de edição presente
                            no canto superior do cartão da sessão{' '}
                            <MdEdit
                                size="16"
                                className="text-secondary cursor-pointer"
                            />
                            .
                        </li>
                    </ul>
                </>
            ),
        },

        {
            titulo: '4. Alocar atrações',
            conteudo: (
                <>
                    <p>
                        Na parte inferior da página está localizada a área{' '}
                        <b>AGUARDANDO ALOCAÇÃO</b>, onde são exibidas todas as
                        atrações que ainda não foram distribuídas em sessões.
                    </p>

                    <p> Para incluir uma atração em uma sessão: </p>

                    <ol>
                        <li>Clique e arraste a atração.</li>
                        <li>Solte-a na sessão desejada.</li>
                    </ol>

                    <p>
                        Também é possível mover atrações entre sessões já
                        existentes.
                    </p>
                </>
            ),
        },

        {
            titulo: '5. Salvar rascunho',
            conteudo: (
                <>
                    <p>Durante a montagem da programação utilize:</p>

                    <div className="text-center my-3 border rounded p-2 bg-light">
                        <Button
                            variant="outline-secondary"
                            className="fw-bold"
                            disabled
                        >
                            <MdSave className="me-1" />
                            Salvar rascunho
                        </Button>
                    </div>

                    <p className="mt-2">
                        Isso grava as alterações realizadas sem publicar a
                        agenda.
                    </p>
                    <p>
                        As informações e criações serão salvar apenas após{' '}
                        <b>Salvar rascunho</b>.
                    </p>
                </>
            ),
        },

        {
            titulo: '6. Publicar programação',
            conteudo: (
                <>
                    <p>Quando a programação estiver pronta clique em:</p>

                    <div className="text-center my-3 border rounded p-2 bg-light">
                        <Button variant="primary" className="fw-bold">
                            <MdPublish className="me-1" />
                            Publicar Agenda
                        </Button>
                    </div>

                    <p className="mt-2">
                        Será necessário informar a data e horário em que a
                        programação ficará disponível para consulta.
                    </p>

                    <p>
                        Após a publicação, a programação ficará disponível para
                        consulta pelos participantes.
                    </p>
                </>
            ),
        },
    ];

    const extrairNomesAutores = (atracaoEntrada) => {
        const atracao = atracaoEntrada?.atracao || atracaoEntrada || {};

        if (Array.isArray(atracao.autorias) && atracao.autorias.length > 0) {
            const nomesAutoria = atracao.autorias
                .map((item) => item?.nome || item?.usuario_nome || item?.autor)
                .filter((nome) => String(nome || '').trim() !== '');

            if (nomesAutoria.length > 0) {
                return nomesAutoria;
            }
        }

        if (atracao.equipe_json) {
            try {
                const equipe =
                    typeof atracao.equipe_json === 'string'
                        ? JSON.parse(atracao.equipe_json)
                        : atracao.equipe_json;

                const nomesEquipe = (Array.isArray(equipe) ? equipe : [])
                    .map((membro) => membro?.nome || membro?.autor)
                    .filter((nome) => String(nome || '').trim() !== '');

                if (nomesEquipe.length > 0) {
                    return nomesEquipe;
                }
            } catch (e) {
                // Ignora parsing inválido e segue com fallbacks.
            }
        }

        if (Array.isArray(atracao.equipe) && atracao.equipe.length > 0) {
            const nomesEquipeDireta = atracao.equipe
                .map((membro) => membro?.nome || membro?.autor)
                .filter((nome) => String(nome || '').trim() !== '');

            if (nomesEquipeDireta.length > 0) {
                return nomesEquipeDireta;
            }
        }

        if (atracao.autor) {
            return [atracao.autor];
        }

        return [];
    };

    useEffect(() => {
        if (eventoId) {
            carregarEvento(eventoId);
            fetchSessoes(eventoId);
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

    useEffect(() => {
        async function carregarAtracoes() {
            try {
                const dados = await listarAtracoes(eventoId);

                const atracoesAlocadas = sessoes.flatMap(
                    (sessao) => sessao.atracoes || [],
                );

                const atracoesLivres = dados.filter(
                    (atracao) => !atracoesAlocadas.includes(atracao.id),
                );
                setAtracoesNaoAlocadas(atracoesLivres);
            } catch (erro) {
                console.error('Erro ao carregar atrações:', erro);
            }
        }

        if (eventoId) {
            carregarAtracoes();
        }
    }, [eventoId, sessoes]);

    // carreagr o board se já existir dados salvos
    useEffect(() => {
        if (!sessoes?.length) return;

        const agrupado = {};

        sessoes.forEach((sessao) => {
            const data = sessao.data_horario_inicio.split('T')[0];

            if (!agrupado[data]) {
                agrupado[data] = [];
            }

            const espacoId = sessao.espaco;

            let espaco = agrupado[data].find((e) => e.id === espacoId);

            if (!espaco) {
                espaco = {
                    id: sessao.espaco,
                    nome: sessao.espaco_display?.nome,
                    capacidade: sessao.espaco_display?.capacidade,
                    sessoes: [],
                };

                agrupado[data].push(espaco);
            }

            espaco.sessoes.push({
                ...sessao,
                ordem_apresentacoes: (
                    sessao.ordem_apresentacoes_display || []
                ).map((ordem) => ({
                    ...ordem,
                    atracao: ordem.atracao_display,
                })),
            });
        });
        console.log('SESSAO', sessoes);
        setBoardPorDia(agrupado);
    }, [sessoes]);

    async function salvarRascunho(publicadoEm = null) {
        try {
            for (const espacosDoDia of Object.values(boardPorDia)) {
                for (const espaco of espacosDoDia) {
                    for (const sessao of espaco.sessoes) {
                        let sessaoSalva;

                        const dadosSessao = {
                            evento: evento.id,
                            nome: sessao.nome,
                            espaco: espaco.id,
                            data_horario_inicio: sessao.data_horario_inicio,
                            data_horario_fim: sessao.data_horario_fim,
                            publicado_em:
                                publicadoEm ?? sessao.publicado_em ?? null,
                        };

                        if (!sessao.id) {
                            // sessao nova
                            sessaoSalva = await adicionaSessao(dadosSessao);

                            // atualiza o ID no frontend (tirando o tempid de sessao)
                            sessao.id = sessaoSalva.id;
                            delete sessao.tempId;
                        } else {
                            // sessao editada
                            sessaoSalva = await editarSessao(
                                sessao.id,
                                dadosSessao,
                            );
                        }

                        console.log('Dados enviados', sessaoSalva);
                        await salvarOrdemApresentacoes({
                            ...sessao,
                            id: sessaoSalva.id,
                            ordem_apresentacoes:
                                sessao.ordem_apresentacoes || [],
                        });
                    }
                }
            }

            setAlterado(false);
        } catch (erro) {
            console.error(erro);
        }
    }

    function atualizarBoardAtual(novoBoard) {
        setBoardPorDia((prev) => ({
            ...prev,
            [dataSelecionada]: novoBoard,
        }));

        setAlterado(true);
    }

    function calcularAlturaSessao(inicio, fim) {
        const duracaoMinutos = (new Date(fim) - new Date(inicio)) / 60000;

        const pixelsPorMinuto = 2;

        return Math.max(duracaoMinutos * pixelsPorMinuto, 80);
    }

    function validarPublicacao() {
        const novosErros = {};

        if (!formPublicacao.publicado_em) {
            novosErros.publicado_em =
                'Data e horário de publicação são obrigatórios';
        } else {
            const dataPublicacao = new Date(formPublicacao.publicado_em);
            const agora = new Date();

            if (dataPublicacao < agora) {
                novosErros.publicado_em =
                    'A data de publicação deve ser futura';
            }
        }

        setErrors(novosErros);

        return Object.keys(novosErros).length === 0;
    }

    const validarSessao = () => {
        const novosErros = {};

        const { nome, data_horario_inicio, data_horario_fim } = formSessao;

        // Campos obrigatórios
        if (!nome) {
            novosErros.nome = 'Nome da sessão é obrigatório';
        }

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
            nome: formSessao.nome,
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
                        tempId: Date.now(),
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

    function salvarPublicacao() {
        if (!validarPublicacao()) return;

        salvarRascunho(formPublicacao.publicado_em);

        setMostrarModalPublicacao(false);
        setFormPublicacao({ publicado_em: '' });
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

        const sessaoDestinoId = overId.replace('sessao-', '');

        // CASO 1: veio da lista (livre)
        if (active.id.toString().startsWith('livre-')) {
            const atracaoId = parseInt(active.id.replace('livre-', ''));

            const atracao = atracoesNaoAlocadas.find((a) => a.id === atracaoId);

            if (!atracao) return;

            const novaApresentacao = {
                atracao,
                ordem: 0,
            };

            const novoBoard = boardAtual.map((espaco) => ({
                ...espaco,
                sessoes: espaco.sessoes.map((sessao) => {
                    const sessaoKey = String(sessao.id || sessao.tempId);
                    if (sessaoKey === sessaoDestinoId) {
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
                    (a) => a.atracao.id === apresentacaoId,
                );

                if (encontrada) {
                    apresentacaoMovida = encontrada;

                    return {
                        ...sessao,
                        ordem_apresentacoes: sessao.ordem_apresentacoes.filter(
                            (a) => a.atracao.id !== apresentacaoId,
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
                const sessaoKey = String(sessao.id || sessao.tempId);

                if (sessaoKey === sessaoDestinoId) {
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
                    height: `${calcularAlturaSessao(
                        sessao.data_horario_inicio,
                        sessao.data_horario_fim,
                    )}px`,
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    borderLeft: '6px solid #0d6efd',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong style={{ fontSize: '14px' }}>
                        {formatarHora(sessao.data_horario_inicio)} -{' '}
                        {formatarHora(sessao.data_horario_fim)}: {sessao.nome}
                    </strong>

                    <MdEdit
                        size="16"
                        className="text-secondary cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={onEditar}
                    />
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        minHeight: 0,
                    }}
                >
                    <SessaoDrop sessaoId={sessao.id || sessao.tempId}>
                        {children}
                    </SessaoDrop>
                </div>
            </div>
        );
    }

    // Card atração arrastável
    function AtracaoDrag({ atracao, origem = 'sessao' }) {
        const id =
            origem === 'livre'
                ? `livre-${atracao.id}`
                : `apresentacao-${atracao.atracao.id}`;

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

        const nomesAutores = extrairNomesAutores(atracao);

        return (
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                <div
                    className="mb-2 p-2 bg-white"
                    style={{
                        borderLeft: `6px solid ${obterCorPorTag(
                            atracao.tipo || atracao.atracao?.tipo,
                        )}`,
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        fontSize: '12px',
                    }}
                >
                    <div style={{ fontWeight: 500 }}>
                        {atracao.titulo || atracao.atracao?.titulo}
                    </div>

                    <small style={{ fontSize: '10px' }}>
                        {nomesAutores.join(', ') ||
                            atracao.autor ||
                            atracao.atracao?.autor ||
                            'Autor não informado'}
                    </small>

                    <small className="text-muted">
                        #{atracao.tipo || atracao.atracao?.tipo}
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

                    maxHeight: '100%',
                    overflowY: 'auto',
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
            {dias ? (
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
                                    variant="outline-info"
                                    onClick={() => setMostrarTutorial(true)}
                                >
                                    Como usar?
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="fw-bold"
                                    onClick={() => salvarRascunho()}
                                >
                                    <MdSave className="me-1" />
                                    Salvar rascunho
                                </Button>

                                <Button
                                    variant="primary"
                                    className="fw-bold"
                                    onClick={() => {
                                        const publicadoEmExistente =
                                            sessoes.find((s) => s.publicado_em)
                                                ?.publicado_em || '';

                                        setPublicadoEditando(
                                            publicadoEmExistente,
                                        );

                                        setFormPublicacao({
                                            publicado_em: publicadoEmExistente
                                                ? publicadoEmExistente.slice(
                                                      0,
                                                      16,
                                                  )
                                                : '',
                                        });

                                        setMostrarModalPublicacao(true);
                                    }}
                                >
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
                                <Col md={12}>
                                    <Row
                                        className="g-3 flex-nowrap overflow-auto"
                                        style={{
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        {boardAtual.map((espaco) => {
                                            const sessoesOrdenadas = [
                                                ...(espaco.sessoes || []),
                                            ].sort(
                                                (a, b) =>
                                                    new Date(
                                                        a.data_horario_inicio,
                                                    ) -
                                                    new Date(
                                                        b.data_horario_inicio,
                                                    ),
                                            );
                                            return (
                                                <Col
                                                    key={espaco.id}
                                                    md={2}
                                                    style={{
                                                        minWidth: '300px',
                                                        flexShrink: 0,
                                                    }}
                                                >
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
                                                                {
                                                                    espaco.capacidade
                                                                }
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
                                                                    setFormSessao(
                                                                        {
                                                                            data_horario_inicio:
                                                                                '',
                                                                            data_horario_fim:
                                                                                '',
                                                                            espaco: espaco.id,
                                                                            ordem_apresentacoes:
                                                                                [],
                                                                        },
                                                                    );
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
                                                                key={
                                                                    sessao.id ||
                                                                    sessao.tempId
                                                                }
                                                                sessao={sessao}
                                                                onEditar={() => {
                                                                    setSessaoEditando(
                                                                        sessao,
                                                                    );
                                                                    setFormSessao(
                                                                        {
                                                                            nome: sessao.nome,
                                                                            data_horario_inicio:
                                                                                sessao.data_horario_inicio.split(
                                                                                    'T',
                                                                                )[1],
                                                                            data_horario_fim:
                                                                                sessao.data_horario_fim.split(
                                                                                    'T',
                                                                                )[1],
                                                                            espaco: espaco.id,
                                                                        },
                                                                    );
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
                                                                            key={`atracao-${ordem.atracao.id}`}
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
                                                    {espaco.sessoes.length ===
                                                    0 ? (
                                                        <div
                                                            className="mt-2 text-center"
                                                            style={{
                                                                border: '2px dashed #ccc',
                                                                padding: '10px',
                                                                borderRadius:
                                                                    '5px',
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
                                                                    setFormSessao(
                                                                        {
                                                                            data_horario_inicio:
                                                                                '',
                                                                            data_horario_fim:
                                                                                '',
                                                                            espaco: espaco.id,
                                                                            ordem_apresentacoes:
                                                                                [],
                                                                        },
                                                                    );
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
                                            <strong
                                                style={{ fontSize: '12px' }}
                                            >
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
                                                .filter((atracao) => {
                                                    const busca =
                                                        buscaAtracao.toLowerCase();

                                                    const buscaAutores =
                                                        extrairNomesAutores(
                                                            atracao,
                                                        )
                                                            .join(' ')
                                                            .toLowerCase();

                                                    return (
                                                        atracao.titulo
                                                            ?.toLowerCase()
                                                            .includes(busca) ||
                                                        buscaAutores.includes(
                                                            busca,
                                                        ) ||
                                                        atracao.tipo //modalidade pelo nome
                                                            ?.toLowerCase()
                                                            .includes(busca) ||
                                                        atracao.area_conhecimento?.area_conhecimento_display
                                                            ?.toLowerCase()
                                                            .includes(busca) ||
                                                        atracao.nivel_ensino_display
                                                            ?.toLowerCase()
                                                            .includes(busca)
                                                    );
                                                })
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
            ) : (
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: '60vh' }}
                >
                    Não é possvel cadastrar uma programação para este evento,
                    pois o evento não possui data de realização
                    {console.log(dias)}
                </div>
            )}

            {/* Modal com tutorial de uso */}
            <ModalPopup
                show={mostrarTutorial}
                titulo={etapasTutorial[etapaTutorial].titulo}
                textoFechar=""
                onFechar={() => {
                    setMostrarTutorial(false);
                    setEtapaTutorial(0);
                }}
            >
                <div
                    style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                    }}
                >
                    {etapasTutorial[etapaTutorial].conteudo}
                </div>

                <div className="d-flex justify-content-between mt-3">
                    <Button
                        variant="secondary"
                        disabled={etapaTutorial === 0}
                        onClick={() => setEtapaTutorial((prev) => prev - 1)}
                    >
                        Voltar
                    </Button>

                    <span>
                        {etapaTutorial + 1} de {etapasTutorial.length}
                    </span>

                    <Button
                        variant="primary"
                        disabled={etapaTutorial === etapasTutorial.length - 1}
                        onClick={() => setEtapaTutorial((prev) => prev + 1)}
                    >
                        Próximo
                    </Button>
                </div>
            </ModalPopup>

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
                            .filter(
                                (espaco) =>
                                    !boardAtual.some(
                                        (espacoBoard) =>
                                            espacoBoard.id === espaco.id,
                                    ),
                            )
                            .filter((espaco) =>
                                espaco.nome
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
                variante="success"
                onFechar={() => {
                    setMostrarModalSessao(false);
                    setErrors({});
                }}
                onAcao={salvarSessao}
            >
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>Nome da sessão</Form.Label>
                        <Form.Control
                            type="text"
                            value={formSessao.nome || ''}
                            isInvalid={!!errors.nome}
                            placeholder="Ex.: Sessão 1"
                            onChange={(e) =>
                                setFormSessao({
                                    ...formSessao,
                                    nome: e.target.value,
                                })
                            }
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.nome}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Horário início</Form.Label>
                        <Form.Control
                            type="time"
                            value={formSessao.data_horario_inicio || ''}
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
                            value={formSessao.data_horario_fim || ''}
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

            {/* Modal de inserção/edição do atributo publicado_em das sessões */}
            <ModalPopup
                show={mostrarModalPublicacao}
                titulo={
                    publicadoEditando
                        ? 'Editar data de publicação da programação do evento'
                        : 'Definir data de publicação da programação do evento'
                }
                textoFechar="Cancelar"
                textoAcao="Salvar"
                variante="success"
                onFechar={() => {
                    setMostrarModalPublicacao(false);
                    setFormPublicacao({ publicado_em: '' });
                    setErrors({});
                }}
                onAcao={salvarPublicacao}
            >
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>Dia e horário de publicação</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={formPublicacao.publicado_em || ''}
                            isInvalid={!!errors.publicado_em}
                            placeholder="Ex.: Sessão 1"
                            onChange={(e) =>
                                setFormPublicacao({
                                    ...formPublicacao,
                                    publicado_em: e.target.value,
                                })
                            }
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.publicado_em}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {errors.conflito && (
                        <div className="text-danger mt-2">
                            {errors.conflito}
                        </div>
                    )}
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
