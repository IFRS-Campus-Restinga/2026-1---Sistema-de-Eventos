import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CriarAtracaoCard from '../components/common/criarAtracaoCard';
import {
    criarAtracao,
    buscarOpcoesAtracao,
    buscarEventos,
    buscarUsuarios,
    salvarRascunho,
} from '../services/atracaoService';
import { buscarEventoPorId } from '../services/eventoService';
import { pegarModalidade } from '../services/modalidadeService';
import Alerta from '../components/common/Alerta';
import { useNavigate } from 'react-router-dom';
import { getSelectedEventoId, setSelectedEventoId } from '../utils/selectedEvento';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

export default function AdicionarAtracao() {
    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        titulo: '',
        resumo: '',
        palavras_chave: '',
        modalidade: '',
        nivel_ensino: [],
        area_conhecimento: '',
        anexo_pdf: null,
        acessibilidade: false,
        evento: '',
        status: 'PREVISTA',
        sugestao_vagas: '',
        respostas_campos: {},
        equipe: []
    });

    const [opcoes, setOpcoes] = useState({
        modalidades: [],
        niveis_ensino: [],
        areas_conhecimento: [],
        funcoes_equipe: [],
        status: [],
    });
    const [eventos, setEventos] = useState([]);
    const [eventoSelecionadoDetalhe, setEventoSelecionadoDetalhe] = useState(null);
    const [modalidadeSelecionadaDetalhe, setModalidadeSelecionadaDetalhe] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
    });

    const mostrarAlerta = (mensagem, variacao = 'danger') =>
        setAlerta((prev) => ({
            ...prev,
            mensagem,
            variacao,
            reacao: (prev.reacao || 0) + 1,
        }));

    const normalizarAreaConhecimentoPayload = (valorArea) => {
        if (valorArea === null || valorArea === undefined) {
            return valorArea;
        }

        const valorTexto = String(valorArea).trim();
        if (valorTexto === '') {
            return valorArea;
        }

        const ehNumero = /^\d+$/.test(valorTexto);
        if (!ehNumero) {
            return valorArea;
        }

        const areaPorDetalhe = (eventoSelecionadoDetalhe?.area_conhecimento_detalhes || []).find(
            (area) => String(area?.id) === valorTexto,
        );

        if (areaPorDetalhe?.area_conhecimento) {
            return areaPorDetalhe.area_conhecimento;
        }

        return valorArea;
    };

    useEffect(() => {
        const carregarDados = async () => {
            const [dadosOpcoes, dadosEventos, dadosUsuarios, dadosUsuarioLogado] =
                await Promise.allSettled([
                    buscarOpcoesAtracao(),
                    buscarEventos(),
                    buscarUsuarios(),
                    getCurrentUser(),
                ]);

            if (dadosOpcoes.status === 'fulfilled') {
                setOpcoes(dadosOpcoes.value);
            } else {
                console.error(
                    'Erro ao carregar opções de atração:',
                    dadosOpcoes.reason,
                );
                mostrarAlerta(
                    'Não foi possível carregar as opções da atração.',
                );
            }

            if (dadosEventos.status === 'fulfilled') {
                setEventos(dadosEventos.value);
                const eventoSalvo = getSelectedEventoId();
                if (eventoSalvo) {
                    setFormState((prev) => ({ ...prev, evento: eventoSalvo }));
                }
            } else {
                console.error('Erro ao carregar eventos:', dadosEventos.reason);
                mostrarAlerta(
                    'Não foi possível carregar os eventos disponíveis.',
                );
            }

            if (dadosUsuarios.status === 'fulfilled') {
                setUsuarios(dadosUsuarios.value);
            } else {
                console.error(
                    'Erro ao carregar usuários para equipe:',
                    dadosUsuarios.reason,
                );
                mostrarAlerta(
                    'Lista de usuários da equipe indisponível no momento. Você ainda pode preencher o restante do formulário.',
                    'warning',
                );
            }

            if (dadosUsuarioLogado?.status === 'fulfilled') {
                setUsuarioLogado(dadosUsuarioLogado.value || null);
            }
        };
        carregarDados();
    }, []);

    useEffect(() => {
        const carregarDetalheEventoSelecionado = async () => {
            if (!formState.evento) {
                setEventoSelecionadoDetalhe(null);
                return;
            }

            const eventoResumo = eventos.find(
                (evento) => String(evento.id) === String(formState.evento),
            );

            if (eventoResumo?.area_conhecimento_detalhes?.length) {
                setEventoSelecionadoDetalhe(eventoResumo);
                return;
            }

            try {
                const detalhe = await buscarEventoPorId(formState.evento);
                setEventoSelecionadoDetalhe(detalhe);
            } catch (error) {
                console.error('Erro ao carregar detalhe do evento selecionado:', error);
                setEventoSelecionadoDetalhe(null);
            }
        };

        carregarDetalheEventoSelecionado();
    }, [formState.evento, eventos]);

    useEffect(() => {
        const carregarDetalheModalidade = async () => {
            if (!formState.modalidade) {
                setModalidadeSelecionadaDetalhe(null);
                setFormState((prev) => ({ ...prev, respostas_campos: {} }));
                return;
            }

            try {
                const detalheModalidade = await pegarModalidade(formState.modalidade);
                const camposFiltrados = (detalheModalidade?.campos || []).filter(
                    (campo) => campo?.ativo !== false,
                );

                setModalidadeSelecionadaDetalhe({
                    ...detalheModalidade,
                    campos: camposFiltrados,
                });

                setFormState((prev) => {
                    const respostasAtuais = prev.respostas_campos || {};
                    const respostasFiltradas = {};

                    camposFiltrados.forEach((campo) => {
                        const chave = `campo_${campo.id}`;
                        if (chave in respostasAtuais) {
                            respostasFiltradas[chave] = respostasAtuais[chave];
                        } else {
                            respostasFiltradas[chave] = campo.tipo_dado === 'BOOLEANO' ? false : '';
                        }
                    });

                    return {
                        ...prev,
                        respostas_campos: respostasFiltradas,
                    };
                });
            } catch (error) {
                console.error('Erro ao carregar detalhe da modalidade:', error);
                setModalidadeSelecionadaDetalhe(null);
            }
        };

        carregarDetalheModalidade();
    }, [formState.modalidade]);

    const handleSalvarRascunho = async () => {
        if (isLoading) return;
        const dadosRascunho = {
            ...formState,
            area_conhecimento: normalizarAreaConhecimentoPayload(
                formState.area_conhecimento,
            ),
            status: 'RASCUNHO',
        };

        try {
            setIsLoading(true);
            await salvarRascunho(dadosRascunho);
            setSelectedEventoId(formState.evento);
            mostrarAlerta('Rascunho salvo com sucesso!', 'success');
            setTimeout(() => navigate('/listar_atracoes'), 1500);
        } catch (erro) {
            console.error('Erro ao salvar rascunho:', erro);
            const msg =
                erro.response?.data?.detail ||
                JSON.stringify(erro.response?.data) ||
                'Erro ao salvar rascunho. Por favor, tente novamente.';
            mostrarAlerta(msg);
            setIsLoading(false);
        }
    };

    const handleSubmeter = async () => {
        if (isLoading) return;
        const nivelEnsinoVazio =
            !Array.isArray(formState.nivel_ensino) || formState.nivel_ensino.length === 0;

        if (!formState.titulo || !formState.resumo || !formState.modalidade || nivelEnsinoVazio || !formState.area_conhecimento || !formState.evento) {
            mostrarAlerta('Por favor, preencha todos os campos obrigatórios nas seções 1 e 2.');
            return;
        }

        const equipeComUsuario = (formState.equipe || []).filter((membro) => {
            const possuiUsuario = String(membro?.user_id || '').trim() !== '';
            const possuiNome = String(membro?.nome || '').trim() !== '';
            return possuiUsuario || possuiNome;
        });

        if (equipeComUsuario.length === 0) {
            mostrarAlerta('Por favor, adicione pelo menos um membro na seção de Equipe.');
            return;
        }

        const membrosSemFuncao = equipeComUsuario.filter((membro) => !membro?.funcao);
        if (membrosSemFuncao.length > 0) {
            mostrarAlerta('Defina um papel para todos os membros da equipe.');
            return;
        }

        const totalAutores = equipeComUsuario.filter((membro) => membro.funcao === 'AUTOR').length;
        if (totalAutores !== 1) {
            mostrarAlerta('A equipe deve possuir exatamente 1 Autor.');
            return;
        }

        try {
            setIsLoading(true);
            const dadosSubmissao = {
                ...formState,
                area_conhecimento: normalizarAreaConhecimentoPayload(
                    formState.area_conhecimento,
                ),
                status: 'PREVISTA',
            };
            await criarAtracao(dadosSubmissao);
            setSelectedEventoId(formState.evento);
            mostrarAlerta('Trabalho submetido com sucesso!', 'success');
            setTimeout(() => navigate('/listar_atracoes'), 1500);
        } catch (erro) {
            console.error('Erro ao submeter trabalho:', erro);
            const msg =
                erro.response?.data?.detail ||
                JSON.stringify(erro.response?.data) ||
                'Erro ao cadastrar. Por favor, tente novamente.';
            mostrarAlerta(msg);
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="flex-fill bg-light">
                {alerta.mensagem && (
                    <Alerta
                        mensagem={alerta.mensagem}
                        variacao={alerta.variacao}
                        reacao={alerta.reacao}
                    />
                )}
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col>
                            <CriarAtracaoCard
                                formState={formState}
                                setFormState={setFormState}
                                opcoes={opcoes}
                                eventos={eventos}
                                eventoSelecionadoDetalhe={eventoSelecionadoDetalhe}
                                modalidadeSelecionadaDetalhe={modalidadeSelecionadaDetalhe}
                                camposModalidade={modalidadeSelecionadaDetalhe?.campos || []}
                                usuarios={usuarios}
                                usuarioLogado={usuarioLogado}
                                isLoading={isLoading}
                                handleSalvarRascunho={handleSalvarRascunho}
                                handleSubmeter={handleSubmeter}
                            />
                        </Col>
                    </Row>
                </Container>
            </main>
            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
