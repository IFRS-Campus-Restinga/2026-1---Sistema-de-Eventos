import { Container, Row, Col, Button, Placeholder } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { FaPenNib } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';
import Tabela from '../components/common/Tabela';
import { useState, useEffect, useCallback } from 'react';
import {
    listarAtracoes,
    buscarUsuarios,
    buscarEventos,
} from '../services/atracaoService';
import { pegarModalidades } from '../services/modalidadeService';
import { listarAvaliadoresPorAtracao } from '../services/atracaoAvaliadorService';
import useAtracaoAvaliador from '../hooks/useAtracaoAvaliador';
import Tag from '../components/common/Tag';
import Filtro from '../components/common/Filtro';
import ModalPopup from '../components/common/ModalPopup';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function AvaliadorChip({ nome, onRemove }) {
    return (
        <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border shadow-sm"
            style={{ background: '#E9ECEF' }}
        >
            <span className="small fw-semibold ">{nome}</span>
            <button
                type="button"
                className="btn p-0 border-0 text-danger fw-bold lh-1"
                aria-label={`Remover ${nome}`}
                onClick={onRemove}
            >
                x
            </button>
        </div>
    );
}

export default function GerenciarAvaliacoesAtracoes({}) {
    const [exibirModal, setExibirModal] = useState(false);
    const [atracoes, setAtracoes] = useState([]);
    const [allAtracoes, setAllAtracoes] = useState([]);
    const [filtroArea, setFiltroArea] = useState('');
    const [filtroBusca, setFiltroBusca] = useState('');
    const [carregando, setCarregando] = useState(false);

    const [selecionada, setSelecionada] = useState(null);
    const [sugestoes, setSugestoes] = useState([]);
    const [manualBusca, setManualBusca] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [selecionadasSugestoes, setSelecionadasSugestoes] = useState([]);
    const [eventosMap, setEventosMap] = useState({});
    const [modalidadesMap, setModalidadesMap] = useState({});

    const {
        avaliadores,
        carregarAvaliadores,
        adicionarAvaliador,
        retirarAvaliador,
        loading: loadingAvaliadores,
    } = useAtracaoAvaliador();

    const carregarLista = useCallback(async () => {
        setCarregando(true);
        try {
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

            const dados = await listarAtracoes();
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

            setAllAtracoes(listaComAvaliadores);
            setAtracoes(listaComAvaliadores);
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
        setAtracoes(filtrado);
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
                    <Row className="w-75">
                        <Col>
                            <Filtro
                                filtros={[
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
                                        nome: 'busca',
                                        tipo: 'text',
                                        placeholder:
                                            'Buscar por título ou autor...',
                                        lg: 4,
                                        valor: filtroBusca,
                                        aoMudar: (e) =>
                                            setFiltroBusca(e.target.value),
                                    },
                                ]}
                                aoFiltrar={aoFiltrar}
                            />
                        </Col>
                    </Row>
                    <Row className="w-75">
                        <Col>
                            <Tabela
                                className="rounded-4 "
                                style={{
                                    overflow: 'hidden',
                                }}
                                cabecarios={[
                                    'Status',
                                    'Trabalho/Autores',
                                    'Área',
                                    'Avaliadores',
                                    'Ações',
                                ]}
                                dados={atracoes.map((a) => [
                                    {
                                        value: (
                                            <div
                                                className="rounded-circle"
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    backgroundColor: (() => {
                                                        const num =
                                                            (
                                                                a.avaliadores ||
                                                                []
                                                            ).length || 0;
                                                        const modalidadeObj =
                                                            typeof a.modalidade ===
                                                                'object' &&
                                                            a.modalidade
                                                                ? a.modalidade
                                                                : modalidadesMap[
                                                                      a
                                                                          .modalidade
                                                                  ];
                                                        const limite = Number(
                                                            modalidadeObj?.limite_avaliadores ??
                                                                a.limite_avaliadores ??
                                                                a.modalidade_limite ??
                                                                0,
                                                        );
                                                        if (num === 0)
                                                            return 'red';
                                                        if (
                                                            limite > 0 &&
                                                            num >= limite
                                                        )
                                                            return 'green';
                                                        return '#FFC107';
                                                    })(),
                                                }}
                                            ></div>
                                        ),
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
                                                texto={
                                                    a.area_conhecimento ||
                                                    a.modalidade
                                                }
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
                                                                } catch (e) {}
                                                            }}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        ),
                                        style: { verticalAlign: 'middle' },
                                    },
                                    <div className="d-flex gap-3">
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={async () => {
                                                setSelecionada(a);
                                                setExibirModal(true);
                                                // carregar avaliadores da atração
                                                await carregarAvaliadores(a.id);
                                                // carregar usuários para sugestoes
                                                let u = [];
                                                try {
                                                    const resp =
                                                        await buscarUsuarios();
                                                    u = Array.isArray(resp)
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
                                                        .filter(Boolean);
                                                    setSelecionadasSugestoes(
                                                        pids,
                                                    );
                                                } catch (e) {
                                                    // ignore
                                                }
                                                // gerar sugestoes por area a partir dos usuarios carregados
                                                const sugest = (u || []).filter(
                                                    (usr) => {
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
                                                    },
                                                );
                                                setSugestoes(
                                                    sugest.slice(0, 6),
                                                );
                                            }}
                                            disabled={!eventosMap[a.evento]}
                                            title={
                                                !eventosMap[a.evento]
                                                    ? 'Etapa de realização/avaliação não está aberta para este evento'
                                                    : 'Atribuir avaliadores'
                                            }
                                        >
                                            Atribuir
                                        </button>
                                    </div>,
                                ])}
                            />
                        </Col>
                    </Row>
                </Container>
            </main>
            <ModalPopup
                titulo="Atribuir avaliadores"
                show={exibirModal}
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
                                        {selecionada?.area_conhecimento ||
                                            selecionada?.modalidade}
                                    </span>
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
                                                {Array.isArray(s.areas)
                                                    ? s.areas.join(', ')
                                                    : s.area_conhecimento}
                                            </small>
                                        </Col>
                                    );
                                })}
                            </Row>
                            <hr />
                            <Row>
                                <Col>
                                    <div className="d-flex flex-column gap-2">
                                        {(usuarios || [])
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
                                            .slice(0, 8)
                                            .map((u) => {
                                                const pid = u.perfil_id || u.id;
                                                const checked =
                                                    selecionadasSugestoes.includes(
                                                        pid,
                                                    );
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
                                                            {Array.isArray(
                                                                u.areas,
                                                            )
                                                                ? u.areas.join(
                                                                      ', ',
                                                                  )
                                                                : u.area_conhecimento}
                                                        </small>
                                                    </Col>
                                                );
                                            })}
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-3">
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
                        </Container>
                    </>
                }
                onAcao={async () => {
                    if (!selecionada) return;
                    try {
                        for (const pid of selecionadasSugestoes) {
                            await adicionarAvaliador(selecionada.id, pid);
                        }
                        // atualizar lista inteira e avaliadores da atração
                        await carregarLista();
                        await carregarAvaliadores(selecionada.id);
                        setSelecionadasSugestoes([]);
                        setExibirModal(false);
                    } catch (e) {
                        // falha ao salvar: manter modal aberto
                    }
                }}
                textoAcao="Salvar atribuições"
                variante="primary"
                onFechar={() => {
                    setExibirModal(false);
                    setSelecionada(null);
                    setSugestoes([]);
                    setManualBusca('');
                    setSelecionadasSugestoes([]);
                }}
            />

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
