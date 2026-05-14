import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    salvarInformacoesComplementares,
    buscarOpcoesCadastro,
} from '../services/cadastroComplementarService';
import { checkSession } from '../services/authService';

export function useCadastroComplementar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [carregando, setCarregando] = useState(false);
    const [opcoes, setOpcoes] = useState({ niveis: [], areas: [] });
    const [notificacao, setNotificacao] = useState({
        mensagem: '',
        variacao: '',
    });

    const [usuarioHub, setUsuarioHub] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [erros, setErros] = useState({});

    useEffect(() => {
        async function inicializarDados() {
            setCarregandoUsuario(true);

            try {
                const dadosOpcoes = await buscarOpcoesCadastro();
                if (dadosOpcoes && dadosOpcoes.areas && dadosOpcoes.niveis) {
                    setOpcoes(dadosOpcoes);
                } else {
                    setOpcoes({ niveis: [], areas: [] });
                }
            } catch (e) {
                console.error('Erro ao carregar níveis/areas', e);
                setOpcoes({ niveis: [], areas: [] });
            }

            try {
                const authResult = await checkSession();

                if (authResult.authenticated && authResult.user) {
                    const { user } = authResult;
                    setUsuarioHub({
                        id: user.id,
                        nome:
                            user.first_name ||
                            user.display_name ||
                            user.username ||
                            'Usuário',
                        email: user.email,
                        cpf: user.cpf,
                    });
                } else {
                    setUsuarioHub(null);
                }
            } catch (e) {
                console.error('Erro ao verificar sessão do usuário', e);
                setUsuarioHub(null);
            } finally {
                setCarregandoUsuario(false);
            }
        }

        inicializarDados();
    }, []);

    // 1. Validações do Frontend antes de se comunicar com frontend
    const tratamentoErrosFrontend = (dados) => {
        let errosLocais = {};
        let valido = true;
        let mensagemGeral = '';

        if (!dados.nivel_ensino && !dados.area_conhecimento) {
            mensagemGeral = 'Preencha as opções.';
            errosLocais.nivel_ensino = 'Selecione um Nível de Ensino.';
            errosLocais.area_conhecimento =
                'Selecione uma Área de Conhecimento.';
            valido = false;
        } else if (!dados.nivel_ensino) {
            mensagemGeral = 'Selecione um Nível de Ensino.';
            errosLocais.nivel_ensino = 'Selecione um Nível de Ensino.';
            valido = false;
        } else if (!dados.area_conhecimento) {
            mensagemGeral = 'Selecione uma Área de Conhecimento.';
            errosLocais.area_conhecimento =
                'Selecione uma Área de Conhecimento.';
            valido = false;
        }

        if (!valido) {
            setErros(errosLocais);
            setNotificacao({
                mensagem: mensagemGeral,
                variacao: 'danger',
            });
        }
        return valido;
    };

    // Tratamento de mensagens para erros do backend
    const tratamentoMensagensBackend = (erro) => {
        const dadosErroServidor = erro.response?.data; // Resposta dos Erros vindo do Backend
        let textoNotificacao =
            'Erro ao processar a requisição. Tente novamente mais tarde.'; // Mensagem genérica caso não seja preenchida nenhum momento por um if especifico.
        let textoSelectNivel = '';
        let textoSelectArea = '';

        let mensagensErrosServidor = {
            textoNotificacao: textoNotificacao,
            textoSelectNivel: textoSelectNivel,
            textoSelectArea: textoSelectArea,
        };

        if (!dadosErroServidor) {
            return setNotificacao({
                mensagem: mensagensErrosServidor.textoNotificacao,
                variacao: 'danger',
            });
        }

        // Verifica erros e converte em Booleano
        const estadoSelectNivel = !!dadosErroServidor.nivel_ensino;
        const estadoSelectArea = !!dadosErroServidor.area_conhecimento;
        const erroGlobal = !!dadosErroServidor.mensagem; // Erros na regra de negocio

        // Lógica para definir os textos dos erros
        if (estadoSelectNivel && estadoSelectArea) {
            mensagensErrosServidor.textoNotificacao = 'Preencha as opções.';
            mensagensErrosServidor.textoSelectNivel =
                'Selecione um Nível de Ensino.';
            mensagensErrosServidor.textoSelectArea =
                'Selecione uma Área de Conhecimento.';
        } else {
            // Verifica campo a campo se algo está faltando
            if (estadoSelectNivel) {
                mensagensErrosServidor.textoNotificacao =
                    'Selecione um Nível de Ensino.';
                mensagensErrosServidor.textoSelectNivel =
                    'Selecione um Nível de Ensino.';
            } else if (estadoSelectArea) {
                mensagensErrosServidor.textoNotificacao =
                    'Selecione uma Área de Conhecimento.';
                mensagensErrosServidor.textoSelectArea =
                    'Selecione uma Área de Conhecimento.';
            } else if (erroGlobal) {
                // Erros Gerais sem campo especifico
                mensagensErrosServidor.textoNotificacao = Array.isArray(
                    dadosErroServidor.mensagem,
                )
                    ? dadosErroServidor.mensagem[0]
                    : dadosErroServidor.mensagem;
            }
        }

        // Distribuição dos Textos para Notificação e Campos
        setNotificacao({
            mensagem: mensagensErrosServidor.textoNotificacao,
            variacao: 'danger',
        });

        setErros({
            nivel_ensino: mensagensErrosServidor.textoSelectNivel,
            area_conhecimento: mensagensErrosServidor.textoSelectArea,
        });
    };

    // Gerenciador do fluxo de Salvamento
    const executarSalvamento = async (dados, token) => {
        const dadosSaoValidos = tratamentoErrosFrontend(dados);
        if (!dadosSaoValidos) return; // Bloqueia a execução se a validação frontend falhar

        // Limpa mensagem dos Selects
        setErros({});
        setCarregando(true);
        setNotificacao({ mensagem: '', variacao: '' });

        // Tenta Salvar
        try {
            await salvarInformacoesComplementares(dados, token);

            setNotificacao({
                mensagem: 'Perfil Criado com Sucesso!',
                variacao: 'success',
            });

            // Redireciona para a página anterior ou para home após 1.5 segundos
            setTimeout(() => {
                const previousLocation = location.state?.from?.pathname || '/';
                navigate(previousLocation, { replace: true });
            }, 1500);
        } catch (erro) {
            tratamentoMensagensBackend(erro); // Tratamento das Mensagens de validação backend
        } finally {
            setCarregando(false);
        }
    };

    return {
        executarSalvamento,
        carregando,
        opcoes,
        notificacao,
        usuarioHub,
        carregandoUsuario,
        erros,
    };
}
