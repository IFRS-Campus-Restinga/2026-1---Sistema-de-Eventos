import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CriarAtracaoCard from '../components/common/criarAtracaoCard';
import { criarAtracao, buscarOpcoesAtracao, buscarEventos, buscarUsuarios, salvarRascunho } from '../services/atracaoService';
import Alerta from '../components/common/Alerta';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdicionarAtracao() {
    const navigate = useNavigate();
    
    const [formState, setFormState] = useState({
        titulo: '',
        resumo: '',
        palavras_chave: '',
        modalidade: '',
        nivel_ensino: '',
        area_conhecimento: '',
        orientador: null,
        sou_orientador: false,
        anexo_pdf: null,
        acessibilidade: false,
        evento: '',
        status: 'PREVISTA',
        equipe: [{ nome: '', instituicao_curso: '', funcao: 'COAUTOR' }]
    });

    const [opcoes, setOpcoes] = useState({ 
        modalidades: [], 
        niveis_ensino: [], 
        areas_conhecimento: [], 
        funcoes_equipe: [],
        status: [] 
    });
    const [eventos, setEventos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
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

    useEffect(() => {
        const carregarDados = async () => {
            const [dadosOpcoes, dadosEventos, dadosUsuarios] =
                await Promise.allSettled([
                    buscarOpcoesAtracao(),
                    buscarEventos(),
                    buscarUsuarios(),
                ]);

            if (dadosOpcoes.status === 'fulfilled') {
                setOpcoes(dadosOpcoes.value);
            } else {
                console.error('Erro ao carregar opções de atração:', dadosOpcoes.reason);
                mostrarAlerta('Não foi possível carregar as opções da atração.');
            }

            if (dadosEventos.status === 'fulfilled') {
                setEventos(dadosEventos.value);
            } else {
                console.error('Erro ao carregar eventos:', dadosEventos.reason);
                mostrarAlerta('Não foi possível carregar os eventos disponíveis.');
            }

            if (dadosUsuarios.status === 'fulfilled') {
                setUsuarios(dadosUsuarios.value);
            } else {
                console.error('Erro ao carregar usuários (orientador):', dadosUsuarios.reason);
                mostrarAlerta(
                    'Lista de orientadores indisponível no momento. Você ainda pode preencher o restante do formulário.',
                    'warning',
                );
            }
        };
        carregarDados();
    }, []);

    const handleSalvarRascunho = async () => {
        const dadosRascunho = { ...formState, status: 'RASCUNHO' };
        
        try {
            await salvarRascunho(dadosRascunho);
            mostrarAlerta('Rascunho salvo com sucesso!', 'success');
            setTimeout(() => navigate('/listarAtracoes'), 1500);
        } catch (erro) {
            console.error('Erro ao salvar rascunho:', erro);
            const msg = erro.response?.data?.detail || JSON.stringify(erro.response?.data) || 'Erro ao salvar rascunho. Por favor, tente novamente.';
            mostrarAlerta(msg);
        }
    };

    const handleSubmeter = async () => {
        if (!formState.titulo || !formState.resumo || !formState.modalidade || !formState.nivel_ensino || !formState.area_conhecimento || !formState.evento) {
            mostrarAlerta('Por favor, preencha todos os campos obrigatórios nas seções 1 e 2.');
            return;
        }

        if (formState.equipe.length === 0 || !formState.equipe[0].nome) {
            mostrarAlerta('Por favor, adicione pelo menos um autor na seção de Equipe.');
            return;
        }

        try {
            const dadosSubmissao = { ...formState, status: 'PREVISTA' };
            await criarAtracao(dadosSubmissao);
            mostrarAlerta('Trabalho submetido com sucesso!', 'success');
            setTimeout(() => navigate('/listarAtracoes'), 1500);
        } catch (erro) {
            console.error('Erro ao submeter trabalho:', erro);
            const msg = erro.response?.data?.detail || JSON.stringify(erro.response?.data) || 'Erro ao cadastrar. Por favor, tente novamente.';
            mostrarAlerta(msg);
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
                                usuarios={usuarios}
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