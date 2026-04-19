import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CriarAtracaoCard from '../components/common/criarAtracaoCard';
import { criarAtracao, buscarOpcoesAtracao, buscarEventos, buscarUsuarios, salvarRascunho } from '../services/atracaoService';
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

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [dadosOpcoes, dadosEventos, dadosUsuarios] = await Promise.all([
                    buscarOpcoesAtracao(),
                    buscarEventos(),
                    buscarUsuarios()
                ]);
                setOpcoes(dadosOpcoes);
                setEventos(dadosEventos);
                setUsuarios(dadosUsuarios);
            } catch (error) {
                console.error('Erro ao carregar dados do formulário:', error);
            }
        };
        carregarDados();
    }, []);

    const handleSalvarRascunho = async () => {
        const dadosRascunho = { ...formState, status: 'RASCUNHO' };
        
        try {
            await salvarRascunho(dadosRascunho);
            alert('Rascunho salvo com sucesso!');
            navigate('/listarAtracoes');
        } catch (erro) {
            console.error('Erro ao salvar rascunho:', erro);
            const msg = erro.response?.data?.detail || JSON.stringify(erro.response?.data) || 'Erro ao salvar rascunho. Por favor, tente novamente.';
            alert(msg);
        }
    };

    const handleSubmeter = async () => {
        console.log('formState:', formState);
        
        if (!formState.titulo || !formState.resumo || !formState.modalidade || !formState.nivel_ensino || !formState.area_conhecimento || !formState.evento) {
            alert('Por favor, preencha todos os campos obrigatórios nas seções 1 e 2.');
            console.log('Faltando:', {
                titulo: !!formState.titulo,
                resumo: !!formState.resumo,
                modalidade: !!formState.modalidade,
                nivel_ensino: !!formState.nivel_ensino,
                area_conhecimento: !!formState.area_conhecimento,
                evento: !!formState.evento
            });
            return;
        }

        if (formState.equipe.length === 0 || !formState.equipe[0].nome) {
            alert('Por favor, adicione pelo menos um autor na seção de Equipe.');
            return;
        }

        try {
            const dadosSubmissao = { ...formState, status: 'PREVISTA' };
            await criarAtracao(dadosSubmissao);
            alert('Trabalho submetido com sucesso!');
            navigate('/listarAtracoes');
        } catch (erro) {
            console.error('Erro ao submeter trabalho:', erro);
            const msg = erro.response?.data?.detail || JSON.stringify(erro.response?.data) || 'Erro ao cadastrar. Por favor, tente novamente.';
            alert(msg);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="flex-fill bg-light">
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