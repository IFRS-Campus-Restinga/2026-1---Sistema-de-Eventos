import { VscAccount } from 'react-icons/vsc';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Col,
    Container,
    Form,
    ListGroup,
    Modal,
    Row,
    Spinner,
} from 'react-bootstrap';
import {
    MdAddCircle,
    MdArrowBack,
    MdDelete,
    MdEdit,
    MdEvent,
    MdInfoOutline,
    MdPlace,
} from 'react-icons/md';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alerta from '../components/common/Alerta';
import Card from '../components/common/Card';
import ModalPopup from '../components/common/ModalPopup';
import Footer from '../components/footer/Footer';
import NavBar from '../components/nav_bar/NavBar';
import { listarAtracoes } from '../services/atracaoService';
import {
    criarInscricaoEvento,
    listarMinhasInscricoesEventos,
} from '../services/inscricaoEventoService';
import { getSelectedEventoId } from '../utils/selectedEvento';
import { buscarEventoPorId } from '../services/eventoService';
import useInscricoesAtracao from '../hooks/useInscricoesAtracao';

const LIMITS_EDICAO = {
    titulo: { minWords: 1, maxWords: 150 },
    palavrasChave: { maxChars: 100 },
};

export default function InscricaoAtracoes() {
    const [atracoes, setAtracoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
    const [mensagemModalSucesso, setMensagemModalSucesso] = useState('');
    const [formEdicao, setFormEdicao] = useState({
        id: null,
        titulo: '',
        resumo: '',
        espaco: '',
        status: 'PREVISTA',
        autor_nome: '',
        orientador_nome: '',
        equipe_nomes: [],
        autorias: [],
        vagas_disponiveis: 0,
    });
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
    });

    const navigate = useNavigate();
    const { eventoId } = useParams();
    const [eventoSelecionadoLista, setEventoSelecionadoLista] = useState(null);

    useEffect(() => {
        const carregarEvento = async () => {
            if (!eventoId) {
                setEventoSelecionadoLista(null);
                return;
            }

            try {
                const ev = await buscarEventoPorId(eventoId);
                setEventoSelecionadoLista(ev);
            } catch (err) {
                console.error('Erro ao carregar evento selecionado:', err);
                setEventoSelecionadoLista(null);
            }
        };

        carregarEvento();
    }, [eventoId]);
    const {
        criarInscricao,
        usuarioLogado,
        carregandoUsuario,
        obterStatusInscricao,
        estaInscritoEmAtracao,
        loading: carregandoInscricao,
    } = useInscricoesAtracao();

    const contarPalavras = (texto) =>
        texto
            ?.trim()
            .split(/\s+/)
            .filter((palavra) => palavra.length > 0).length || 0;

    const mostrarAlerta = useCallback((mensagem, variacao = 'danger') => {
        setAlerta((prev) => ({
            ...prev,
            mensagem,
            variacao,
            reacao: (prev.reacao || 0) + 1,
        }));
    }, []);

    const carregarAtracoes = useCallback(async () => {
        try {
            setCarregando(true);
            if (!eventoId) return;

            const dados = await listarAtracoes(eventoId);
            setAtracoes(dados);
            setAlerta((prev) => ({
                ...prev,
                mensagem: '',
            }));
        } catch (error) {
            console.error('Erro ao buscar atrações:', error);
            const status = error?.response?.status;
            const detalhe = error?.response?.data?.detail;
            const mensagem =
                detalhe ||
                (status
                    ? `Não foi possível carregar as atrações (HTTP ${status}).`
                    : 'Não foi possível carregar as atrações. Verifique backend e URL da API.');
            mostrarAlerta(mensagem);
        } finally {
            setCarregando(false);
        }
    }, [eventoId, mostrarAlerta]);

    useEffect(() => {
        carregarAtracoes();
    }, [carregarAtracoes]);

    const inscrito = estaInscritoEmAtracao(formEdicao.id);
    const statusInscricao = obterStatusInscricao(formEdicao.id);

    const getAreasEventoEdicao = () => {
        const areasDoEvento =
            eventoSelecionadoLista?.area_conhecimento_detalhes;
        if (Array.isArray(areasDoEvento) && areasDoEvento.length > 0) {
            return areasDoEvento;
        }

        const areasSimples = eventoSelecionadoLista?.area_conhecimento;
        if (Array.isArray(areasSimples) && areasSimples.length > 0) {
            return areasSimples;
        }

        return [];
    };

    const normalizarAreaEdicao = (area) => ({
        value: area?.area_conhecimento ?? area?.value ?? area?.id ?? area,
        label:
            area?.area_conhecimento_display ||
            area?.nome ||
            area?.descricao ||
            area?.label ||
            String(area),
    });

    const normalizarTexto = (texto) =>
        (texto || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

    const atracoesFiltradas = useMemo(() => {
        const termo = normalizarTexto(termoBusca.trim());
        if (!termo) return atracoes;

        return atracoes.filter((atracao) => {
            const conteudoBusca = [
                atracao.titulo,
                atracao.tipo,
                atracao.local_atracao,
                atracao.vagas_disponiveis,
            ]
                .map((valor) => normalizarTexto(valor))
                .join(' ');

            return conteudoBusca.includes(termo);
        });
    }, [atracoes, termoBusca]);

    // função de visualização simplificada não utilizada (mantida apenas para referência)

    const abrirModalInscricao = (atracao) => {
        setFormEdicao({
            id: atracao.id,
            titulo: atracao.titulo || '',
            resumo: atracao.resumo || '',
            espaco: atracao.espaco || atracao.espaco_detalhe?.id || '',
            status: atracao.status || 'PREVISTA',
            palavras_chave: atracao.palavras_chave || '',
            modalidade: atracao.modalidade || '',
            nivel_ensino: atracao.nivel_ensino || '',
            area_conhecimento: atracao.area_conhecimento || '',
            autor_nome: atracao.autor_nome || '',
            autorias: Array.isArray(atracao.autorias) ? atracao.autorias : [],
            orientador: atracao.orientador,
            orientador_nome: atracao.orientador_nome || '',
            equipe_nomes: Array.isArray(atracao.equipe_nomes)
                ? atracao.equipe_nomes
                : [],
            sou_orientador: atracao.sou_orientador || false,
            acessibilidade: atracao.acessibilidade || false,
            evento: atracao.evento,
            vagas_disponiveis: atracao.vagas_disponiveis,
        });
        setMostrarModalEdicao(true);
    };

    const usuarioEhAutorDaAtracao = () => {
        const userId = usuarioLogado?.id;
        if (!userId) return false;
        const autorias = formEdicao?.autorias || [];
        return autorias.some(
            (a) =>
                String(a.tipo).toUpperCase() === 'AUTOR' &&
                Number(a.usuario) === Number(userId),
        );
    };

    const _normalizarNome = (texto) =>
        (texto || '')
            .toString()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .trim();

    const usuarioEstaNaEquipeDaAtracao = () => {
        const nomesEquipe = Array.isArray(formEdicao?.equipe_nomes)
            ? formEdicao.equipe_nomes
            : [];
        if (!nomesEquipe.length) return false;

        const candidato =
            usuarioLogado?.nome ||
            usuarioLogado?.name ||
            `${usuarioLogado?.first_name || ''} ${
                usuarioLogado?.last_name || ''
            }` ||
            usuarioLogado?.username ||
            '';

        const nomeNormalizado = _normalizarNome(candidato);
        if (!nomeNormalizado) return false;

        return nomesEquipe.some((nome) => {
            if (!nome) return false;
            return _normalizarNome(nome) === nomeNormalizado;
        });
    };

    const handleInscrever = async () => {
        if (!usuarioLogado) {
            mostrarAlerta('Faça login antes de se inscrever.', 'danger');
            return;
        }
        if (!formEdicao?.id) return;

        if (usuarioEhAutorDaAtracao()) {
            mostrarAlerta(
                'Você é autor desta atração e não pode se inscrever nela.',
                'warning',
            );
            return;
        }

        const jaInscrito = estaInscritoEmAtracao(formEdicao.id);
        if (jaInscrito) {
            mostrarAlerta('Você já está inscrito nessa atração.', 'warning');
            return;
        }

        try {
            setSalvandoEdicao(true);

            const inscricoesEvento = await listarMinhasInscricoesEventos();
            const eventoIdDaAtracao = Number(formEdicao.evento);
            const perfilIdSessao = usuarioLogado.perfil_id;

            const jaInscritoNoEvento = Array.isArray(inscricoesEvento)
                ? inscricoesEvento.some(
                      (inscricao) =>
                          Number(inscricao.evento_id) === eventoIdDaAtracao &&
                          Number(inscricao.perfil_id) ===
                              Number(perfilIdSessao),
                  )
                : false;

            let autoInscricaoEvento = false;

            if (!jaInscritoNoEvento && eventoIdDaAtracao) {
                await criarInscricaoEvento({
                    perfil_id: perfilIdSessao,
                    evento_id: eventoIdDaAtracao,
                });
                autoInscricaoEvento = true;
            }

            await criarInscricao({
                perfil_id: perfilIdSessao,
                atracao_id: formEdicao.id,
            });
            setMensagemModalSucesso(
                autoInscricaoEvento
                    ? 'Você não estava inscrito no evento, portanto o sistema fez sua inscrição no evento automaticamente e depois nessa atração.'
                    : 'Inscrição realizada com sucesso.',
            );
            setMostrarModalSucesso(true);
            setMostrarModalEdicao(false);
            await carregarAtracoes();
        } catch (erro) {
            const msg =
                erro?.response?.data?.mensagem ||
                erro?.response?.data ||
                erro?.message ||
                'Erro ao inscrever.';
            mostrarAlerta(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSalvandoEdicao(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    {alerta.mensagem && (
                        <Alerta
                            mensagem={alerta.mensagem}
                            variacao={alerta.variacao}
                            reacao={alerta.reacao}
                        />
                    )}

                    <Card corBorda="#00A44B">
                        <Container fluid className="mb-2 px-4">
                            <Row className="pt-5 pb-2">
                                <Col className="d-flex align-items-center">
                                    <MdEvent color="#00A44B" size={35} />
                                    <h3
                                        className="fw-bold ms-2 mb-0"
                                        style={{ color: '#00A44B' }}
                                    >
                                        {eventoSelecionadoLista?.nome ||
                                            `ID ${eventoId}`}{' '}
                                    </h3>
                                </Col>
                            </Row>

                            <hr className="mb-4" />

                            <Row className="mb-4">
                                <Col md={8} lg={6}>
                                    <Form.Group>
                                        <Form.Label
                                            className="fw-bold"
                                            style={{ color: '#00A44B' }}
                                        >
                                            Buscar atração
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={termoBusca}
                                            onChange={(e) =>
                                                setTermoBusca(e.target.value)
                                            }
                                            placeholder="Digite titulo ou local"
                                            style={{
                                                backgroundColor: '#eeeeee',
                                                border: '1px solid #ced4da',
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {carregando ? (
                                <div className="text-center py-5">
                                    <Spinner
                                        animation="border"
                                        variant="success"
                                    />
                                    <p className="mt-2 text-muted">
                                        Buscando submissões no sistema...
                                    </p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {/* Alterado de '> 0' para '>= 0' para listar mesmo se for 0 */}
                                    {atracoesFiltradas?.filter(
                                        (a) =>
                                            a.vagas_disponiveis != null &&
                                            a.vagas_disponiveis >= 0,
                                    ).length > 0 ? (
                                        atracoesFiltradas
                                            .filter(
                                                (a) =>
                                                    a.vagas_disponiveis !=
                                                        null &&
                                                    a.vagas_disponiveis >= 0,
                                            )
                                            .map((atracao, index) => (
                                                <ListGroup.Item
                                                    key={atracao.id || index}
                                                    className="d-flex justify-content-between align-items-center mb-3 border rounded shadow-sm p-3"
                                                    style={{
                                                        borderLeft:
                                                            '5px solid #00A44B',
                                                    }}
                                                >
                                                    <div className="d-flex flex-column">
                                                        <div className="fs-5 fw-bold text-dark mb-1">
                                                            {atracao.titulo}
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-3 text-muted small">
                                                            <span className="d-flex align-items-center gap-1">
                                                                <MdInfoOutline />{' '}
                                                                <strong>
                                                                    Tipo:
                                                                </strong>{' '}
                                                                {atracao.tipo}
                                                            </span>
                                                            <span className="d-flex align-items-center gap-1">
                                                                <MdPlace />{' '}
                                                                <strong>
                                                                    Local:
                                                                </strong>{' '}
                                                                {
                                                                    atracao.local_atracao
                                                                }
                                                            </span>
                                                            <span className="d-flex align-items-center gap-1">
                                                                <VscAccount />
                                                                <strong>
                                                                    Vagas:
                                                                </strong>{' '}
                                                                {/* Mostra "Esgotado" se for 0 */}
                                                                {atracao.vagas_disponiveis ===
                                                                0 ? (
                                                                    <Badge bg="danger">
                                                                        Esgotado
                                                                    </Badge>
                                                                ) : (
                                                                    atracao.vagas_disponiveis
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2">
                                                        <Button
                                                            variant="outline-success"
                                                            className="d-flex align-items-center gap-1"
                                                            onClick={() =>
                                                                abrirModalInscricao(
                                                                    atracao,
                                                                )
                                                            }
                                                        >
                                                            Visualizar
                                                        </Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                    ) : (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <p className="text-muted mb-0">
                                                {atracoes.length > 0
                                                    ? 'Nenhuma oficina encontrada para o termo informado.'
                                                    : 'Nenhuma oficina cadastrada até o momento.'}
                                            </p>
                                        </div>
                                    )}
                                </ListGroup>
                            )}
                        </Container>
                    </Card>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline-secondary"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                        >
                            <MdArrowBack /> Voltar
                        </Button>
                    </div>
                </Container>
            </main>

            <Modal
                show={mostrarModalEdicao}
                onHide={() => setMostrarModalEdicao(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {formEdicao.titulo || 'Detalhes da atração'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <h6 className="mb-1">Resumo</h6>
                    <p className="text-muted">{formEdicao.resumo || '—'}</p>
                    <hr />

                    <h6 className="mb-1">Autor</h6>
                    <p className="text-muted">{formEdicao.autor_nome || '—'}</p>
                    <hr />

                    <h6 className="mb-1">Orientador</h6>
                    <p className="text-muted">
                        {formEdicao.orientador_nome || '—'}
                    </p>

                    {/* <h6 className="mb-1">Membros da Equipe</h6>
                    <p className="text-muted mb-0">
                        {Array.isArray(formEdicao.equipe_nomes) &&
                        formEdicao.equipe_nomes.length > 0
                            ? formEdicao.equipe_nomes.join(', ')
                            : '—'}
                    </p> */}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setMostrarModalEdicao(false)}
                    >
                        Fechar
                    </Button>

                    {inscrito ? (
                        <Button variant="outline-success" disabled>
                            usuEhAutorDaAtracao
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            onClick={handleInscrever}
                            disabled={
                                salvandoEdicao ||
                                carregandoUsuario ||
                                carregandoInscricao ||
                                !formEdicao?.id ||
                                usuarioEhAutorDaAtracao() ||
                                usuarioEstaNaEquipeDaAtracao()
                            }
                        >
                            {usuarioEstaNaEquipeDaAtracao() ||
                            usuarioEhAutorDaAtracao()
                                ? 'Autor'
                                : 'Inscrever-se'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* esse bisonho que notifica o usuário da dupla inscrição evento/atraçãos */}
            <ModalPopup
                show={mostrarModalSucesso}
                titulo="Inscrição concluída"
                texto={mensagemModalSucesso}
                textoFechar="Fechar"
                onFechar={() => setMostrarModalSucesso(false)}
                variante="success"
                size="md"
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
