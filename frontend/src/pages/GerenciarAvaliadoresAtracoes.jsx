import { Container, Row, Col, Button, Placeholder } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { FaPenNib } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';
import Tabela from '../components/common/Tabela';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    listarAtracoes,
    buscarUsuarios,
    buscarEventos,
} from '../services/atracaoService';
import { pegarModalidades } from '../services/modalidadeService';
import { listarAvaliadoresPorAtracao } from '../services/atracaoAvaliadorService';
import {
    listarAvaliacoesAtracao,
    listarItensAvaliacaoAtracao,
} from '../services/avaliacaoAtracaoService';
import { pegarCriterioAvaliacaoAtracao } from '../services/criterioAvaliacaoAtracaoService';
import useAtracaoAvaliador from '../hooks/useAtracaoAvaliador';
import Tag from '../components/common/Tag';
import formatAreaConhecimento from '../utils/formatAreaConhecimento';
import Filtro from '../components/common/Filtro';
import ModalPopup from '../components/common/ModalPopup';
import Alerta from '../components/common/Alerta';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function AvaliadorChip({ nome, onRemove, onView, canRemove = true }) {
    return (
        <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border shadow-sm"
            style={{ background: '#E9ECEF' }}
        >
            <span className="small fw-semibold ">{nome}</span>
            {onView && (
                <button
                    type="button"
                    className="btn p-0 border-0 text-primary fw-semibold lh-1"
                    aria-label={`Ver avaliação de ${nome}`}
                    onClick={onView}
                >
                    ver
                </button>
            )}
            {!onView && <span className="small text-muted">Não avaliado</span>}
            <button
                type="button"
                className="btn p-0 border-0 text-danger fw-bold lh-1"
                aria-label={`Remover ${nome}`}
                title={
                    canRemove
                        ? 'Remover avaliador'
                        : 'Não é possível remover: avaliação já enviada'
                }
                disabled={!canRemove}
                onClick={canRemove ? onRemove : undefined}
            >
                x
            </button>
        </div>
    );
}

export default function GerenciarAvaliacoesAtracoes({}) {
    const [searchParams] = useSearchParams();
    const eventoId = searchParams.get('evento_id');
    const [exibirModal, setExibirModal] = useState(false);
    const [atracoes, setAtracoes] = useState([]);
    const [allAtracoes, setAllAtracoes] = useState([]);
    const [filtroArea, setFiltroArea] = useState('');
    const [filtroBusca, setFiltroBusca] = useState('');
    const [filtroOrdenacao, setFiltroOrdenacao] = useState('desc');
    const [carregando, setCarregando] = useState(false);
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    );

    const [selecionada, setSelecionada] = useState(null);
    const [sugestoes, setSugestoes] = useState([]);
    const [manualBusca, setManualBusca] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [selecionadasSugestoes, setSelecionadasSugestoes] = useState([]);
    const [avaliadoresAtuais, setAvaliadoresAtuais] = useState([]);
    const [eventosMap, setEventosMap] = useState({});
    const [modalidadesMap, setModalidadesMap] = useState({});
    const [criteriosMap, setCriteriosMap] = useState({});
    const [avaliacoesMap, setAvaliacoesMap] = useState({});
    const [avaliadoresContagemMap, setAvaliadoresContagemMap] = useState({});
    const [avaliacaoModal, setAvaliacaoModal] = useState({
        show: false,
        loading: false,
        avaliador: null,
        atracao: null,
        avaliacao: null,
        itens: [],
    });
    const [alerta, setAlerta] = useState(null);

    const {
        avaliadores,
        carregarAvaliadores,
        adicionarAvaliador,
        retirarAvaliador,
        loading: loadingAvaliadores,
    } = useAtracaoAvaliador();

    const ordenarPorMedia = (lista, ordem = 'desc') => {
        return [...lista].sort((a, b) => {
            const mediaA = Number.isFinite(a.nota_media) ? a.nota_media : null;
            const mediaB = Number.isFinite(b.nota_media) ? b.nota_media : null;

            if (mediaA === null && mediaB === null) return 0;
            if (mediaA === null) return 1;
            if (mediaB === null) return -1;
            return ordem === 'asc' ? mediaA - mediaB : mediaB - mediaA;
        });
    };

    const abrirAvaliacao = async (atracao, avaliador) => {
        setAvaliacaoModal({
            show: true,
            loading: true,
            avaliador,
            atracao,
            avaliacao: null,
            itens: [],
        });

        try {
            const avaliacoes = await listarAvaliacoesAtracao({
                atracao: atracao.id,
            });
            const lista = Array.isArray(avaliacoes) ? avaliacoes : [];
            const found = lista.find(
                (av) => String(av.avaliador) === String(avaliador.id),
            );
            if (!found) {
                setAvaliacaoModal((prev) => ({
                    ...prev,
                    loading: false,
                    avaliacao: null,
                    itens: [],
                }));
                return;
            }

            const itensResp = await listarItensAvaliacaoAtracao(found.id);
            const itens = Array.isArray(itensResp) ? itensResp : [];

            setAvaliacaoModal((prev) => ({
                ...prev,
                loading: false,
                avaliacao: found,
                itens,
            }));
        } catch (e) {
            setAvaliacaoModal((prev) => ({
                ...prev,
                loading: false,
                avaliacao: null,
                itens: [],
            }));
        }
    };

    const carregarLista = useCallback(async () => {
        setCarregando(true);
        try {
            if (!eventoId) {
                setAllAtracoes([]);
                setAtracoes([]);
                setCarregando(false);
                return;
            }
            // buscar modalidades primeiro para podermos filtrar corretamente
            let mMap = {};
            try {
                const mods = await pegarModalidades();
                (Array.isArray(mods) ? mods : []).forEach((m) => {
                    mMap[m.id] = m;
                });
                setModalidadesMap(mMap);
            } catch (e) {
                mMap = {};
                setModalidadesMap({});
            }

            const dados = await listarAtracoes(eventoId);
            const lista = Array.isArray(dados) ? dados : [];

            // filtrar atrações cuja modalidade não requer avaliação
            const listaFiltrada = lista.filter((item) => {
                const modalidadeObj =
                    typeof item.modalidade === 'object' && item.modalidade
                        ? item.modalidade
                        : mMap[item.modalidade];
                if (!modalidadeObj) return true; // manter se não sabemos a modalidade
                return modalidadeObj.requer_avaliacao === true;
            });

            // carregar avaliadores apenas para atrações que passaram no filtro
            const listaComAvaliadores = await Promise.all(
                listaFiltrada.map(async (item) => {
                    try {
                        const resp = await listarAvaliadoresPorAtracao(item.id);
                        item.avaliadores = resp?.avaliadores || [];
                    } catch (e) {
                        item.avaliadores = item.avaliadores || [];
                    }
                    return item;
                }),
            );

            const contagemMap = {};
            listaComAvaliadores.forEach((item) => {
                (item.avaliadores || []).forEach((av) => {
                    const pid = av.perfil_id || av.id;
                    if (!pid) return;
                    contagemMap[pid] = (contagemMap[pid] || 0) + 1;
                });
            });
            setAvaliadoresContagemMap(contagemMap);

            let mediasMap = {};
            try {
                const avaliacoesResp = await listarAvaliacoesAtracao();
                const avaliacoes = Array.isArray(avaliacoesResp)
                    ? avaliacoesResp
                    : [];
                const soma = {};
                const qtd = {};
                const ids = new Set(listaFiltrada.map((item) => item.id));
                const mapAvaliacao = {};

                avaliacoes.forEach((av) => {
                    if (!ids.has(av.atracao)) return;
                    const nota = Number(av.nota_final);
                    if (!Number.isFinite(nota)) return;
                    soma[av.atracao] = (soma[av.atracao] || 0) + nota;
                    qtd[av.atracao] = (qtd[av.atracao] || 0) + 1;
                    if (av.avaliador) {
                        mapAvaliacao[`${av.atracao}-${av.avaliador}`] = av.id;
                    }
                });

                Object.keys(soma).forEach((id) => {
                    mediasMap[id] = soma[id] / qtd[id];
                });

                setAvaliacoesMap(mapAvaliacao);
            } catch (e) {
                mediasMap = {};
                setAvaliacoesMap({});
            }

            const listaComNotas = listaComAvaliadores.map((item) => {
                const media = Object.prototype.hasOwnProperty.call(
                    mediasMap,
                    item.id,
                )
                    ? mediasMap[item.id]
                    : null;
                return { ...item, nota_media: media };
            });

            const listaOrdenada = ordenarPorMedia(
                listaComNotas,
                filtroOrdenacao,
            );
            setAllAtracoes(listaOrdenada);
            setAtracoes(listaOrdenada);
            // carregar eventos para verificar se a etapa de avaliação/realização está aberta
            try {
                const evts = await buscarEventos();
                const map = {};
                const now = new Date();
                (Array.isArray(evts) ? evts : []).forEach((evt) => {
                    const etapas = evt?.etapas || [];
                    const etapa = etapas.find(
                        (e) => e.tipo_etapa === 'REALIZACAO_EVENTO',
                    );
                    // habilitar atribuição enquanto a data final da etapa REALIZACAO_EVENTO
                    // não tiver passado. Se não houver etapa ou data final, consideramos
                    // que ainda é possível atribuir (não desabilitar).
                    if (!etapa || !etapa.data_fim) {
                        map[evt.id] = true;
                        return;
                    }
                    const fim = new Date(etapa.data_fim);
                    map[evt.id] = now <= fim;
                });
                setEventosMap(map);
            } catch (e) {
                setEventosMap({});
            }

            try {
                const criterios = await pegarCriterioAvaliacaoAtracao();
                const map = {};
                (Array.isArray(criterios) ? criterios : []).forEach((c) => {
                    map[c.id] = c;
                });
                setCriteriosMap(map);
            } catch (e) {
                setCriteriosMap({});
            }
            // (modalidadesMap já populado acima)
        } catch (e) {
            setAllAtracoes([]);
            setAtracoes([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarLista();
    }, [carregarLista]);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const aoFiltrar = () => {
        const area = filtroArea?.toLowerCase?.() || '';
        const busca = filtroBusca?.toLowerCase?.() || '';
        const filtrado = (allAtracoes || []).filter((a) => {
            const matchArea = area
                ? (a.area_conhecimento || a.modalidade || '')
                      .toLowerCase()
                      .includes(area)
                : true;
            const matchBusca = busca
                ? (a.titulo || '').toLowerCase().includes(busca) ||
                  (a.autores_text || '').toLowerCase().includes(busca)
                : true;
            return matchArea && matchBusca;
        });
        setAtracoes(ordenarPorMedia(filtrado, filtroOrdenacao));
    };
    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className=" py-4 ">
                <Container
                    fluid
                    className="d-md-flex flex-md-column align-items-md-center gap-3"
                >
                    <Row>
                        <Col>
                            <h1 className="fw-bold">Painel do Organizador</h1>
                            <span>
                                Gerencie trabalhos submetidos e distribua
                                avaliadores
                            </span>
                        </Col>
                    </Row>
                    <Row className={`${!isMobile ? 'w-75' : 'w-100'}`}>
                        <Col>
                            <Filtro
                                filtros={[
                                    {
                                        nome: 'busca',
                                        tipo: 'text',
                                        placeholder:
                                            'Buscar por título ou autor...',
                                        lg: 4,
                                        valor: filtroBusca,
                                        aoMudar: (e) =>
                                            setFiltroBusca(e.target.value),
                                    },
                                    {
                                        nome: 'area',
                                        tipo: 'select',
                                        placeholder: 'Todas as áreas',
                                        opcoes: Array.from(
                                            new Set(
                                                allAtracoes
                                                    .map(
                                                        (a) =>
                                                            a.area_conhecimento,
                                                    )
                                                    .filter(Boolean),
                                            ),
                                        ),
                                        valor: filtroArea,
                                        aoMudar: (e) =>
                                            setFiltroArea(e.target.value),
                                    },

                                    {
                                        nome: 'ordenacao',
                                        tipo: 'select',
                                        placeholder: 'Ordenar por nota',
                                        opcoes: [
                                            'Nota (decrescente)',
                                            'Nota (crescente)',
                                        ],
                                        valor:
                                            filtroOrdenacao === 'asc'
                                                ? 'Nota (crescente)'
                                                : 'Nota (decrescente)',
                                        aoMudar: (e) => {
                                            const valor = e.target.value;
                                            setFiltroOrdenacao(
                                                valor === 'Nota (crescente)'
                                                    ? 'asc'
                                                    : 'desc',
                                            );
                                        },
                                    },
                                ]}
                                aoFiltrar={aoFiltrar}
                            />
                        </Col>
                    </Row>
                    <Row
                        className={`${
                            !isMobile
                                ? 'w-75 overflow-auto'
                                : 'w-100 overflow-auto'
                        }`}
                    >
                        <Col>
                            <Tabela
                                className="rounded-4"
                                style={{
                                    overflow: 'hidden',
                                }}
                                cabecarios={[
                                    'Qtd. avaliadores',
                                    'Trabalho/Autores',
                                    'Área',
                                    'Avaliadores',
                                    'Média',
                                    'Ações',
                                ]}
                                dados={atracoes.map((a) => [
                                    {
                                        value: (() => {
                                            const num =
                                                (a.avaliadores || []).length ||
                                                0;
                                            const modalidadeObj =
                                                typeof a.modalidade ===
                                                    'object' && a.modalidade
                                                    ? a.modalidade
                                                    : modalidadesMap[
                                                          a.modalidade
                                                      ];
                                            const limite = Number(
                                                modalidadeObj?.limite_avaliadores ??
                                                    a.limite_avaliadores ??
                                                    a.modalidade_limite ??
                                                    0,
                                            );
                                            const cor = (() => {
                                                if (num === 0) return 'red';
                                                if (limite > 0 && num >= limite)
                                                    return 'green';
                                                return '#FFC107';
                                            })();
                                            const texto =
                                                limite > 0
                                                    ? `${num}/${limite} avaliadores`
                                                    : `${num}/— avaliadores`;

                                            return (
                                                <div className="d-inline-flex align-items-center gap-2">
                                                    <div
                                                        className="rounded-circle"
                                                        style={{
                                                            width: '10px',
                                                            height: '10px',
                                                            backgroundColor:
                                                                cor,
                                                        }}
                                                    ></div>
                                                    <span className="">
                                                        {texto}
                                                    </span>
                                                </div>
                                            );
                                        })(),
                                        style: { verticalAlign: 'middle' },
                                    },
                                    {
                                        value: (
                                            <div className="d-flex flex-column">
                                                <span>{a.titulo}</span>
                                                <span>{a.autores_text}</span>
                                            </div>
                                        ),
                                        style: { verticalAlign: 'middle' },
                                    },
                                    {
                                        value: (
                                            <Tag
                                                texto={formatAreaConhecimento(
                                                    a.area_conhecimento ||
                                                        a.modalidade,
                                                )}
                                                corFundo="blue"
                                                corTexto="#fff"
                                            />
                                        ),
                                        style: { verticalAlign: 'middle' },
                                    },

                                    {
                                        value: (
                                            <div className="d-flex flex-wrap gap-2 justify-content-start">
                                                {(a.avaliadores || []).map(
                                                    (av) => (
                                                        <AvaliadorChip
                                                            key={av.id}
                                                            nome={
                                                                av.nome ||
                                                                av.name ||
                                                                av.username
                                                            }
                                                            canRemove={
                                                                !avaliacoesMap[
                                                                    `${a.id}-${av.id}`
                                                                ]
                                                            }
                                                            onView={
                                                                avaliacoesMap[
                                                                    `${a.id}-${av.id}`
                                                                ]
                                                                    ? () =>
                                                                          abrirAvaliacao(
                                                                              a,
                                                                              av,
                                                                          )
                                                                    : null
                                                            }
                                                            onRemove={async () => {
                                                                try {
                                                                    await retirarAvaliador(
                                                                        a.id,
                                                                        av.perfil_id ||
                                                                            av.id,
                                                                    );
                                                                    await carregarLista();
                                                                    await carregarAvaliadores(
                                                                        a.id,
                                                                    );
                                                                    setAlerta({
                                                                        mensagem:
                                                                            'Avaliador removido com sucesso.',
                                                                        variacao:
                                                                            'success',
                                                                        reacao: Date.now(),
                                                                    });
                                                                } catch (e) {
                                                                    const msg =
                                                                        e
                                                                            ?.response
                                                                            ?.data
                                                                            ?.erro ||
                                                                        'Não foi possível remover o avaliador.';
                                                                    setAlerta({
                                                                        mensagem:
                                                                            msg,
                                                                        variacao:
                                                                            'danger',
                                                                        reacao: Date.now(),
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        ),
                                        style: { verticalAlign: 'middle' },
                                    },
                                    {
                                        value: Number.isFinite(a.nota_media)
                                            ? a.nota_media.toFixed(1)
                                            : '-',
                                        className: 'text-end',
                                        style: { verticalAlign: 'middle' },
                                    },
                                    {
                                        value: (
                                            <div className="d-flex gap-3">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={async () => {
                                                        setSelecionada(a);
                                                        setExibirModal(true);
                                                        // carregar avaliadores da atração
                                                        await carregarAvaliadores(
                                                            a.id,
                                                        );
                                                        // carregar usuários para sugestoes
                                                        let u = [];
                                                        try {
                                                            const resp =
                                                                await buscarUsuarios();
                                                            u = Array.isArray(
                                                                resp,
                                                            )
                                                                ? resp
                                                                : [];
                                                            setUsuarios(u);
                                                        } catch (e) {
                                                            setUsuarios([]);
                                                        }
                                                        // carregar avaliadores já associados e pré-selecioná-los
                                                        try {
                                                            const avResp =
                                                                await listarAvaliadoresPorAtracao(
                                                                    a.id,
                                                                );
                                                            const avs =
                                                                avResp?.avaliadores ||
                                                                [];
                                                            const pids = avs
                                                                .map(
                                                                    (x) =>
                                                                        x.perfil_id ||
                                                                        x.id,
                                                                )
                                                                .filter(
                                                                    Boolean,
                                                                );
                                                            setAvaliadoresAtuais(
                                                                pids,
                                                            );
                                                            setSelecionadasSugestoes(
                                                                pids,
                                                            );
                                                        } catch (e) {
                                                            // ignore
                                                        }
                                                        // gerar sugestoes por area a partir dos usuarios carregados
                                                        const sugest = (
                                                            u || []
                                                        ).filter((usr) => {
                                                            return (
                                                                (usr.area_conhecimento &&
                                                                    usr.area_conhecimento ===
                                                                        (a.area_conhecimento ||
                                                                            a.modalidade)) ||
                                                                (usr.areas &&
                                                                    Array.isArray(
                                                                        usr.areas,
                                                                    ) &&
                                                                    usr.areas.includes(
                                                                        a.area_conhecimento,
                                                                    ))
                                                            );
                                                        });
                                                        setSugestoes(
                                                            sugest.slice(0, 6),
                                                        );
                                                    }}
                                                    disabled={
                                                        !eventosMap[a.evento]
                                                    }
                                                    title={
                                                        !eventosMap[a.evento]
                                                            ? 'Etapa de realização/avaliação não está aberta para este evento'
                                                            : 'Atribuir avaliadores'
                                                    }
                                                >
                                                    Atribuir
                                                </button>
                                            </div>
                                        ),
                                        style: { verticalAlign: 'middle' },
                                    },
                                ])}
                            />
                        </Col>
                    </Row>
                </Container>
            </main>
            <ModalPopup
                titulo="Atribuir avaliadores"
                show={exibirModal}
                size="xl"
                scrollable
                children={
                    <>
                        <Container>
                            <Row>
                                <Col>
                                    <span className="fw-bold">Trabalho:</span>{' '}
                                    <span>{selecionada?.titulo}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <span className="fw-bold">Área:</span>{' '}
                                    <span>
                                        {formatAreaConhecimento(
                                            selecionada?.area_conhecimento ||
                                                selecionada?.modalidade,
                                        )}
                                    </span>
                                </Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col>
                                    <span className="fw-bold">
                                        Busca Manual
                                    </span>
                                    <InputGroup className="mb-3">
                                        <Form.Control
                                            placeholder="Digite o nome do avaliador"
                                            aria-label="Digite o nome do avaliador"
                                            aria-describedby="basic-addon2"
                                            value={manualBusca}
                                            list="avaliadores-list"
                                            onChange={(e) =>
                                                setManualBusca(e.target.value)
                                            }
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const texto = (
                                                        manualBusca || ''
                                                    ).trim();
                                                    try {
                                                        const resp =
                                                            await buscarUsuarios(
                                                                texto,
                                                            );
                                                        const u = Array.isArray(
                                                            resp,
                                                        )
                                                            ? resp
                                                            : [];
                                                        setUsuarios(u);
                                                    } catch (err) {
                                                        setUsuarios([]);
                                                    }
                                                }
                                            }}
                                        />
                                        <datalist id="avaliadores-list">
                                            {(usuarios || [])
                                                .slice(0, 50)
                                                .map((u) => (
                                                    <option
                                                        key={
                                                            u.perfil_id || u.id
                                                        }
                                                        value={
                                                            u.nome ||
                                                            u.full_name ||
                                                            u.user_nome
                                                        }
                                                    />
                                                ))}
                                        </datalist>
                                        <Button
                                            variant="outline-secondary"
                                            id="button-addon2"
                                            onClick={async () => {
                                                const texto = (
                                                    manualBusca || ''
                                                ).trim();
                                                try {
                                                    const resp =
                                                        await buscarUsuarios(
                                                            texto,
                                                        );
                                                    const u = Array.isArray(
                                                        resp,
                                                    )
                                                        ? resp
                                                        : [];
                                                    setUsuarios(u);
                                                } catch (err) {
                                                    setUsuarios([]);
                                                }
                                            }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputGroup>{' '}
                                </Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col>
                                    <span className="fw-bold text-success">
                                        Sugestões da mesma Área
                                    </span>
                                </Col>
                            </Row>
                            <Row className="px-2 mt-2 d-flex flex-column gap-2">
                                {(sugestoes || []).map((s) => {
                                    const perfilId = s.perfil_id || s.id;
                                    const checked =
                                        selecionadasSugestoes.includes(
                                            perfilId,
                                        );
                                    const totalDesignado =
                                        avaliadoresContagemMap[perfilId] || 0;
                                    return (
                                        <Col
                                            key={perfilId}
                                            className="card py-2 px-3 "
                                        >
                                            <Form.Check
                                                className="fw-bold "
                                                label={
                                                    s.nome ||
                                                    s.full_name ||
                                                    s.user_nome
                                                }
                                                checked={checked}
                                                onChange={() => {
                                                    setSelecionadasSugestoes(
                                                        (prev) => {
                                                            if (
                                                                prev.includes(
                                                                    perfilId,
                                                                )
                                                            ) {
                                                                return prev.filter(
                                                                    (p) =>
                                                                        p !==
                                                                        perfilId,
                                                                );
                                                            }
                                                            return [
                                                                ...prev,
                                                                perfilId,
                                                            ];
                                                        },
                                                    );
                                                }}
                                            />
                                            <small className="ms-3">
                                                Áreas:{' '}
                                                {formatAreaConhecimento(
                                                    s.areas ||
                                                        s.area_conhecimento,
                                                )}
                                            </small>
                                            <small className="ms-3 text-muted">
                                                Designado para: {totalDesignado}{' '}
                                                trabalho(s)
                                            </small>
                                        </Col>
                                    );
                                })}
                            </Row>
                            <hr />
                            <Row>
                                <Col>
                                    <div className="d-flex flex-column gap-2">
                                        {(() => {
                                            const base = Array.isArray(usuarios)
                                                ? usuarios
                                                : [];
                                            const falta = Math.max(
                                                0,
                                                50 - base.length,
                                            );
                                            const mocks = Array.from(
                                                { length: falta },
                                                (_, idx) => ({
                                                    id: `mock-${idx + 1}`,
                                                    nome: `Pessoa ${idx + 1}`,
                                                    areas: [],
                                                }),
                                            );
                                            return [...base, ...mocks];
                                        })()
                                            .filter((u) => {
                                                if (!manualBusca) return true;
                                                return (
                                                    u.nome ||
                                                    u.full_name ||
                                                    u.user_nome ||
                                                    ''
                                                )
                                                    .toLowerCase()
                                                    .includes(
                                                        manualBusca.toLowerCase(),
                                                    );
                                            })
                                            .slice(0, 50)
                                            .map((u) => {
                                                const pid = u.perfil_id || u.id;
                                                const checked =
                                                    selecionadasSugestoes.includes(
                                                        pid,
                                                    );
                                                const totalDesignado =
                                                    avaliadoresContagemMap[
                                                        pid
                                                    ] || 0;
                                                return (
                                                    <Col
                                                        key={pid}
                                                        className="card py-2 px-3 "
                                                    >
                                                        <Form.Check
                                                            className="fw-bold"
                                                            label={
                                                                u.nome ||
                                                                u.full_name ||
                                                                u.user_nome
                                                            }
                                                            checked={checked}
                                                            onChange={() => {
                                                                setSelecionadasSugestoes(
                                                                    (prev) => {
                                                                        if (
                                                                            prev.includes(
                                                                                pid,
                                                                            )
                                                                        ) {
                                                                            return prev.filter(
                                                                                (
                                                                                    p,
                                                                                ) =>
                                                                                    p !==
                                                                                    pid,
                                                                            );
                                                                        }
                                                                        return [
                                                                            ...prev,
                                                                            pid,
                                                                        ];
                                                                    },
                                                                );
                                                            }}
                                                        />
                                                        <small className="ms-">
                                                            Áreas:{' '}
                                                            {formatAreaConhecimento(
                                                                u.areas ||
                                                                    u.area_conhecimento,
                                                            )}
                                                        </small>
                                                        <small className="ms- text-muted">
                                                            Designado para:{' '}
                                                            {totalDesignado}{' '}
                                                            trabalho(s)
                                                        </small>
                                                    </Col>
                                                );
                                            })}
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </>
                }
                onAcao={async () => {
                    if (!selecionada) return;
                    try {
                        const atuaisSet = new Set(avaliadoresAtuais);
                        const selecionadasSet = new Set(selecionadasSugestoes);
                        const paraRemover = avaliadoresAtuais.filter(
                            (pid) => !selecionadasSet.has(pid),
                        );
                        for (const pid of selecionadasSugestoes) {
                            if (!atuaisSet.has(pid)) {
                                await adicionarAvaliador(selecionada.id, pid);
                            }
                        }
                        for (const pid of paraRemover) {
                            await retirarAvaliador(selecionada.id, pid);
                        }
                        // atualizar lista inteira e avaliadores da atração
                        await carregarLista();
                        await carregarAvaliadores(selecionada.id);
                        setAvaliadoresAtuais([]);
                        setSelecionadasSugestoes([]);
                        setExibirModal(false);
                        setAlerta({
                            mensagem: 'Atribuições atualizadas com sucesso.',
                            variacao: 'success',
                            reacao: Date.now(),
                        });
                    } catch (e) {
                        const msg =
                            e?.response?.data?.erro ||
                            'Não foi possível salvar as alterações.';
                        setAlerta({
                            mensagem: msg,
                            variacao: 'danger',
                            reacao: Date.now(),
                        });
                    }
                }}
                textoAcao="Salvar atribuições"
                variante="primary"
                onFechar={() => {
                    setExibirModal(false);
                    setSelecionada(null);
                    setSugestoes([]);
                    setManualBusca('');
                    setAvaliadoresAtuais([]);
                    setSelecionadasSugestoes([]);
                }}
            />
            <ModalPopup
                titulo="Detalhes da avaliação"
                show={avaliacaoModal.show}
                onFechar={() =>
                    setAvaliacaoModal((prev) => ({
                        ...prev,
                        show: false,
                    }))
                }
                textoAcao=""
            >
                <Container>
                    <Row>
                        <Col>
                            <span className="fw-bold">Avaliador:</span>{' '}
                            <span>
                                {avaliacaoModal.avaliador?.nome ||
                                    avaliacaoModal.avaliador?.name ||
                                    avaliacaoModal.avaliador?.username ||
                                    '-'}
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <span className="fw-bold">Trabalho:</span>{' '}
                            <span>{avaliacaoModal.atracao?.titulo || '-'}</span>
                        </Col>
                    </Row>
                    <hr />
                    {avaliacaoModal.loading ? (
                        <Row>
                            <Col>Carregando avaliacao...</Col>
                        </Row>
                    ) : !avaliacaoModal.avaliacao ? (
                        <Row>
                            <Col>Nenhuma avaliacao encontrada.</Col>
                        </Row>
                    ) : (
                        <>
                            <Row>
                                <Col>
                                    <span className="fw-bold">Nota final:</span>{' '}
                                    <span>
                                        {(() => {
                                            const notas = (
                                                avaliacaoModal.itens || []
                                            )
                                                .map((i) => Number(i.nota))
                                                .filter((n) =>
                                                    Number.isFinite(n),
                                                );
                                            if (notas.length === 0) return '--';
                                            const media =
                                                notas.reduce(
                                                    (acc, n) => acc + n,
                                                    0,
                                                ) / notas.length;
                                            return media.toFixed(1);
                                        })()}
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <span className="fw-bold">Destaque:</span>{' '}
                                    <span>
                                        {avaliacaoModal.avaliacao
                                            ?.destaque_do_dia
                                            ? 'Sim'
                                            : 'Não'}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="fw-bold">Compareceu:</span>{' '}
                                    <span>
                                        {avaliacaoModal.avaliacao?.compareceu
                                            ? 'Sim'
                                            : 'Não'}
                                    </span>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col>
                                    <span className="fw-bold">Parecer:</span>
                                    <div className="mt-1">
                                        {avaliacaoModal.avaliacao?.parecer ||
                                            '-'}
                                    </div>
                                </Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col>
                                    <span className="fw-bold">Critérios</span>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col className="d-flex flex-column gap-2">
                                    {(avaliacaoModal.itens || []).map((it) => {
                                        const criterio =
                                            criteriosMap[it.criterio_avaliacao];
                                        return (
                                            <div
                                                key={it.id}
                                                className="d-flex justify-content-between border rounded-3 px-3 py-2"
                                            >
                                                <div>
                                                    <div className="fw-semibold">
                                                        {criterio?.nome ||
                                                            `Criterio ${it.criterio_avaliacao}`}
                                                    </div>
                                                    {criterio?.descricao && (
                                                        <div className="text-muted small">
                                                            {criterio.descricao}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="fw-bold">
                                                    {Number.isFinite(it.nota)
                                                        ? it.nota.toFixed(1)
                                                        : it.nota}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </Col>
                            </Row>
                        </>
                    )}
                </Container>
            </ModalPopup>

            {alerta && (
                <Alerta
                    key={alerta.reacao}
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    reacao={alerta.reacao}
                />
            )}

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
