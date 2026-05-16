import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import { useState, useEffect } from 'react';
import Tag from '../components/common/Tag';
import Alerta from '../components/common/Alerta';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { API_URL } from '../config';
import axios from 'axios';
import avaliacaoAtracaoService from '../services/avaliacaoAtracaoService';
import { listarEtapas } from '../services/etapaEventoService';
import { pegarTokenCsrf } from '../services/csrfService';

export default function AvaliarAtracao({}) {
    const navigate = useNavigate();
    const [atracao, setAtracao] = useState(null);
    const [criterios, setCriterios] = useState([]);
    const [itens, setItens] = useState([]);
    const [parecer, setParecer] = useState('');
    const [destaque, setDestaque] = useState(false);
    const [compareceu, setCompareceu] = useState(true);
    const [loading, setLoading] = useState(false);
    const [avaliacaoId, setAvaliacaoId] = useState(null);
    const [editingAllowed, setEditingAllowed] = useState(false);
    const [alerta, setAlerta] = useState(null);
    const parseNota = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const s = String(value).replace(',', '.');
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    };

    const podeEnviar = (() => {
        if (!editingAllowed) return false;
        if (!parecer || String(parecer).trim() === '') return false;
        if (!itens || itens.length === 0) return false;
        const notasValidas = itens.every((i) => Number.isFinite(i.nota));
        return notasValidas;
    })();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const atracaoId = params.get('atracao_id');
        const avaliacaoIdParam = params.get('avaliacao_id');
        if (!atracaoId) return;

        (async () => {
            try {
                setLoading(true);
                const resp = await axios.get(
                    `${API_URL}/api/atracoes/${atracaoId}/`,
                    { withCredentials: true },
                );
                setAtracao(resp.data);
                const criteriosData =
                    await avaliacaoAtracaoService.pegarCriteriosPorModalidade(
                        resp.data.modalidade,
                    );
                setCriterios(criteriosData || []);
                // inicializar itens (inclui item_id para updates)
                const inicial = (criteriosData || []).map((c) => ({
                    criterio_avaliacao: c.id,
                    nota: null,
                    item_id: null,
                }));

                // verificar etapa de realizacao para permitir edição
                try {
                    const etapas = await listarEtapas();
                    const now = new Date();
                    const etapa = (etapas || []).find(
                        (e) =>
                            String(e.evento) === String(resp.data.evento) &&
                            e.tipo_etapa === 'REALIZACAO_EVENTO',
                    );
                    const etapaAberta =
                        etapa &&
                        new Date(etapa.data_inicio) <= now &&
                        new Date(etapa.data_fim) >= now;
                    setEditingAllowed(!!etapaAberta);
                } catch (err) {
                    console.error('erro ao verificar etapas', err);
                }

                // se vier avaliacao_id, buscar avaliacao e preencher itens
                if (avaliacaoIdParam) {
                    try {
                        const respAv = await axios.get(
                            `${API_URL}/api/avaliacao_atracao/${avaliacaoIdParam}`,
                            { withCredentials: true },
                        );
                        const dadosAv = respAv.data;
                        setParecer(dadosAv.parecer || '');
                        setDestaque(!!dadosAv.destaque_do_dia);
                        setCompareceu(!!dadosAv.compareceu);
                        setAvaliacaoId(dadosAv.id);
                        // buscar itens da avaliacao (filtrar por avaliacao_atracao no client, caso o endpoint não filtre)
                        const respItens = await axios.get(
                            `${API_URL}/api/item_avaliacao_atracao/`,
                            {
                                params: { avaliacao_atracao: avaliacaoIdParam },
                                withCredentials: true,
                            },
                        );
                        const itensData = respItens.data || [];
                        const itensFiltrados = itensData.filter(
                            (it) =>
                                String(it.avaliacao_atracao) ===
                                String(avaliacaoIdParam),
                        );
                        // mapear para inicial
                        itensFiltrados.forEach((it) => {
                            const idx = inicial.findIndex(
                                (x) =>
                                    String(x.criterio_avaliacao) ===
                                    String(it.criterio_avaliacao),
                            );
                            if (idx >= 0) {
                                inicial[idx].nota = parseNota(it.nota);
                                inicial[idx].item_id = it.id;
                            }
                        });
                    } catch (err) {
                        // se o recurso por id não existir (404), tentar localizar avaliação por atração
                        if (err?.response && err.response.status === 404) {
                            try {
                                const respAll = await axios.get(
                                    `${API_URL}/api/avaliacao_atracao/`,
                                    { withCredentials: true },
                                );
                                const all = respAll.data || [];
                                const found = all.find(
                                    (av) =>
                                        String(av.atracao) ===
                                        String(resp.data.id),
                                );
                                if (found) {
                                    const dadosAv = found;
                                    setParecer(dadosAv.parecer || '');
                                    setDestaque(!!dadosAv.destaque_do_dia);
                                    setCompareceu(!!dadosAv.compareceu);
                                    setAvaliacaoId(dadosAv.id);
                                    // buscar itens da avaliacao encontrada
                                    const respItens2 = await axios.get(
                                        `${API_URL}/api/item_avaliacao_atracao/`,
                                        {
                                            params: {
                                                avaliacao_atracao: found.id,
                                            },
                                            withCredentials: true,
                                        },
                                    );
                                    const itensData2 = respItens2.data || [];
                                    const itensFiltrados2 = itensData2.filter(
                                        (it) =>
                                            String(it.avaliacao_atracao) ===
                                            String(found.id),
                                    );
                                    itensFiltrados2.forEach((it) => {
                                        const idx = inicial.findIndex(
                                            (x) =>
                                                String(x.criterio_avaliacao) ===
                                                String(it.criterio_avaliacao),
                                        );
                                        if (idx >= 0) {
                                            inicial[idx].nota = parseNota(
                                                it.nota,
                                            );
                                            inicial[idx].item_id = it.id;
                                        }
                                    });
                                } else {
                                    console.warn(
                                        'Nenhuma avaliação encontrada para a atração',
                                    );
                                }
                            } catch (err2) {
                                console.error(
                                    'erro ao localizar avaliacao alternativa',
                                    err2,
                                );
                            }
                        } else {
                            console.error(
                                'erro ao carregar avaliacao existente',
                                err,
                            );
                        }
                    }
                }
                // se não veio avaliacao_id na query, tentar localizar avaliação existente para edição
                if (!avaliacaoIdParam) {
                    try {
                        const respAll = await axios.get(
                            `${API_URL}/api/avaliacao_atracao/`,
                            { withCredentials: true },
                        );
                        const all = respAll.data || [];
                        const found = all.find(
                            (av) => String(av.atracao) === String(resp.data.id),
                        );
                        if (found) {
                            setParecer(found.parecer || '');
                            setDestaque(!!found.destaque_do_dia);
                            setCompareceu(!!found.compareceu);
                            setAvaliacaoId(found.id);
                            const respItens2 = await axios.get(
                                `${API_URL}/api/item_avaliacao_atracao/`,
                                {
                                    params: { avaliacao_atracao: found.id },
                                    withCredentials: true,
                                },
                            );
                            const itensData2 = respItens2.data || [];
                            const itensFiltrados2 = itensData2.filter(
                                (it) =>
                                    String(it.avaliacao_atracao) ===
                                    String(found.id),
                            );
                            itensFiltrados2.forEach((it) => {
                                const idx = inicial.findIndex(
                                    (x) =>
                                        String(x.criterio_avaliacao) ===
                                        String(it.criterio_avaliacao),
                                );
                                if (idx >= 0) {
                                    inicial[idx].nota = parseNota(it.nota);
                                    inicial[idx].item_id = it.id;
                                }
                            });
                        }
                    } catch (err) {
                        console.error(
                            'erro ao buscar avaliacao existente sem id na query',
                            err,
                        );
                    }
                }
                setItens(inicial);
            } catch (err) {
                console.error('erro ao carregar atracao/criterios', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleNotaChange = (idx, value) => {
        let v = null;
        if (value !== '' && value !== null && value !== undefined) {
            const normalized = String(value).replace(',', '.');
            const num = Number(normalized);
            v = Number.isFinite(num) ? num : null;
        }
        setItens((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], nota: v };
            return copy;
        });
    };

    const handleSubmit = async () => {
        if (!atracao) return;
        const avaliacaoDados = {
            atracao: atracao.id,
            parecer: parecer,
            destaque_do_dia: !!destaque,
            compareceu: !!compareceu,
            data_avaliacao: new Date().toISOString(),
        };
        try {
            setLoading(true);
            if (avaliacaoId) {
                // update existing evaluation
                const csrfData = await pegarTokenCsrf();
                const csrfToken = csrfData?.csrfToken || '';
                await axios.put(
                    `${API_URL}/api/avaliacao_atracao/${avaliacaoId}`,
                    avaliacaoDados,
                    {
                        headers: { 'X-CSRFToken': csrfToken },
                        withCredentials: true,
                    },
                );

                // update/create items
                for (const it of itens) {
                    const payload = {
                        nota: it.nota,
                        criterio_avaliacao: it.criterio_avaliacao,
                        avaliacao_atracao: avaliacaoId,
                    };
                    if (it.item_id) {
                        await axios.put(
                            `${API_URL}/api/item_avaliacao_atracao/${it.item_id}`,
                            payload,
                            {
                                headers: { 'X-CSRFToken': csrfToken },
                                withCredentials: true,
                            },
                        );
                    } else {
                        await axios.post(
                            `${API_URL}/api/item_avaliacao_atracao/`,
                            payload,
                            {
                                headers: { 'X-CSRFToken': csrfToken },
                                withCredentials: true,
                            },
                        );
                    }
                }
            } else {
                // create new
                const itensPayload = itens.map((it) => ({
                    criterio_avaliacao: it.criterio_avaliacao,
                    nota: it.nota,
                }));
                await avaliacaoAtracaoService.criarAvaliacaoAtracaoComItens(
                    avaliacaoDados,
                    itensPayload,
                );
            }

            // mostrar alerta de sucesso e redirecionar após timeout
            const redirectTimeout = 2000; // ms
            setAlerta({
                mensagem: 'Avaliação salva com sucesso',
                variacao: 'success',
                duracao: redirectTimeout,
                reacao: Date.now(),
            });
            setTimeout(
                () =>
                    navigate(`/minhas_avaliacoes?evento_id=${atracao.evento}`),
                redirectTimeout + 100,
            );
        } catch (err) {
            console.error('erro ao enviar avaliacao', err);
            setAlerta({
                mensagem: 'Erro ao enviar avaliação',
                variacao: 'danger',
                reacao: Date.now(),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className=" py-4 px-3 ">
                <Container className="px-5 py-4  d-flex flex-column gap-3 shadow rounded-4 gap-3">
                    <Row>
                        <Col className="px-0">
                            <h1>
                                {atracao ? atracao.titulo : 'Carregando...'}
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="px-0">
                            <Tag
                                corTexto="#fff"
                                corFundo="#000"
                                texto={atracao?.nivel_ensino || 'Nível'}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            className="rounded-2 fw-semibold  p-3"
                            style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                            }}
                        >
                            Atribua notas de 0 a 10 utilizando ponto para
                            decimais (ex: 8,5)
                        </Col>
                    </Row>

                    {(criterios || []).map((c, idx) => (
                        <Row
                            key={c.id}
                            className="p-3 rounded-4 avaliar-criterio-card"
                        >
                            <Col className="d-md-flex justify-content-between ">
                                <Row className="d-flex flex-column gap-3">
                                    <Col>
                                        <span className="fw-bold fs-4">{`${
                                            idx + 1
                                        }. ${c.nome}`}</span>
                                    </Col>
                                    <Col>
                                        <span>{c.descricao}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <input
                                            max={10}
                                            min={0}
                                            step={0.1}
                                            value={itens[idx]?.nota ?? ''}
                                            onChange={(e) =>
                                                handleNotaChange(
                                                    idx,
                                                    e.target.value,
                                                )
                                            }
                                            type="number"
                                            className="score-input fs-4 fw-bold w-100 mt-3 mt-md-0"
                                            disabled={!editingAllowed}
                                            required
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    ))}

                    <Row className="d-flex flex-column gap-2">
                        <Col className="px-0">
                            <label htmlFor="parecer" className="fw-bold fs-5">
                                Parecer Descritivo
                            </label>
                        </Col>
                        <Col className="w-100 px-0">
                            <textarea
                                name="parecer"
                                id="parecer"
                                placeholder="Escreva seus comentários sobre o trabalho..."
                                rows={5}
                                className="avaliar-criterio-card w-100 px-3"
                                value={parecer}
                                onChange={(e) => setParecer(e.target.value)}
                                disabled={!editingAllowed}
                                required
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-start px-0 fw-semibold">
                            <div
                                className="p-2 rounded-3"
                                style={{
                                    background: '#fffbeb',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                }}
                            >
                                <Form.Check
                                    type="switch"
                                    id="destaque-switch"
                                    label="Indicar trabalho como destaque?"
                                    checked={destaque}
                                    onChange={(e) =>
                                        setDestaque(e.target.checked)
                                    }
                                    disabled={!editingAllowed}
                                />
                            </div>
                            <div
                                className="ms-3 p-2 rounded-3"
                                style={{
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                }}
                            >
                                <Form.Check
                                    type="checkbox"
                                    id="compareceu"
                                    label="Compareceu"
                                    checked={compareceu}
                                    onChange={(e) =>
                                        setCompareceu(e.target.checked)
                                    }
                                    disabled={!editingAllowed}
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row className="d-flex flex-column justify-content-center text-center">
                        <Col>NOTA FINAL CALCULADA</Col>
                        <Col className="fw-bold fs-1 text-primary">
                            {(() => {
                                const notas = itens
                                    .map((i) => i.nota)
                                    .filter((n) => Number.isFinite(n));
                                if (!notas.length) return '-';
                                const avg =
                                    notas.reduce((s, v) => s + v, 0) /
                                    notas.length;
                                return (Math.round(avg * 10) / 10)
                                    .toFixed(1)
                                    .replace('.', ',');
                            })()}
                        </Col>
                    </Row>
                    <Row className="d-flex flex-md-row flex-column gap-3">
                        <Col>
                            <Button
                                variant="primary"
                                className="w-100 py-3"
                                onClick={handleSubmit}
                                disabled={loading || !podeEnviar}
                            >
                                Finalizar Avaliação
                            </Button>
                        </Col>
                        <Col className="">
                            <Button
                                onClick={() => navigate(-1)}
                                variant="secondary"
                                className="d-flex text-center justify-content-center align-items-center gap-2 px-4 py-3 w-100"
                            >
                                <MdArrowBack /> Voltar
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
            {alerta && (
                <Alerta
                    key={alerta.reacao ?? Date.now()}
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    duracao={alerta.duracao ?? 5000}
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
