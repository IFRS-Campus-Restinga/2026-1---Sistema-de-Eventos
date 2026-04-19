import { useState, useEffect } from 'react';
import {
    salvarInformacoesComplementares,
    buscarOpcoesCadastro,
} from '../services/cadastroComplementarService';
import { checkSession } from '../services/authService';

export function useCadastroComplementar() {
    const [carregando, setCarregando] = useState(false);
    const [opcoes, setOpcoes] = useState({ niveis: [], areas: [] });
    const [notificacao, setNotificacao] = useState({
        mensagem: '',
        variacao: '',
    });

    const [erroValidacao, setErroValidacao] = useState('');

    const [usuarioHub, setUsuarioHub] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);

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

    const executarSalvamento = async (dados, token) => {
        setCarregando(true);
        setNotificacao({ mensagem: '', variacao: '' });

        try {
            await salvarInformacoesComplementares(dados, token);
            setNotificacao({
                mensagem: 'Perfil Criado com Sucesso!',
                variacao: 'success',
            });
        } catch (e) {
            setNotificacao({
                mensagem: 'Erro ao Criar Perfil.',
                variacao: 'danger',
            });
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
        erroValidacao,
        setErroValidacao,
    };
}
