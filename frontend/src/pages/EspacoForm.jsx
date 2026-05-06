import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import EspacoCard from '../components/cards_listagem/EspacoCard';
import Button from 'react-bootstrap/esm/Button';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useLocais from '../hooks/useLocais';
import useEspacos from '../hooks/useEspacos';
import Alerta from '../components/common/Alerta';

export default function EspacoForm({ campus = 'Campus Restinga' }) {
    const { buscarLocal, localSelecionado } = useLocais();
    const {
        espacoSelecionado,
        buscarEspaco,
        handleSave,
        loading,
        error,
        message,
    } = useEspacos();

    const { id } = useParams(); // Se houver ID, é edição. Se não, é criação.
    const navigate = useNavigate(); // para navegar de volta para a página de listagem após criar o local
    const location = useLocation();
    const localId = location.state?.localId; // Pega o localId passado pela navegação
    const editando = Boolean(id); // Verifica se estamos editando ou criando
    const [errors, setErrors] = useState({}); // Para armazenar erros de validação

    // estados dos campos
    const [nome, setNome] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [predioBloco, setPredioBloco] = useState('');
    const [recursosDisponiveis, setRecursosDisponiveis] = useState('');
    const [ativo, setAtivo] = useState(true);

    useEffect(() => {
        if (localId) {
            buscarLocal(localId);
        }
    }, [localId]);

    useEffect(() => {
        if (editando) {
            buscarEspaco(id);
        }
    }, [id]);

    // carrega se for edição
    useEffect(() => {
        if (espacoSelecionado) {
            setNome(espacoSelecionado.nome);
            setCapacidade(espacoSelecionado.capacidade);
            setPredioBloco(espacoSelecionado.predio_bloco);
            setRecursosDisponiveis(espacoSelecionado.recursos_disponiveis);
            setAtivo(espacoSelecionado.ativo);
        }
    }, [espacoSelecionado]);

    const validar = () => {
        const novosErros = {};

        if (!nome || nome.length < 3) {
            novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
        }

        if (!isNaN(nome)) {
            novosErros.nome = 'Nome não pode ser apenas números';
        }

        if (!capacidade || Number(capacidade) <= 0) {
            novosErros.capacidade = 'Capacidade deve ser maior que zero';
        }

        if (!predioBloco || predioBloco.length < 3) {
            novosErros.predioBloco =
                'Prédio/Bloco deve ter pelo menos 3 caracteres';
        }

        if (!localId) {
            novosErros.local = 'Local é obrigatório';
        }

        setErrors(novosErros);

        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        const dados = await handleSave({
            id,
            nome,
            capacidade: Number(capacidade),
            predio_bloco: predioBloco,
            recursos_disponiveis: recursosDisponiveis,
            ativo,
            local: localId,
        });

        if (dados.sucesso) {
            const timeout = setTimeout(() => {
                navigate('/listar_locais_espacos');
            }, 3000);
        } else {
            if (dados.erro) {
                setErrors(dados.erro);
            }
        }
    };

    return (
        <>
            <NavBar />
            <main className="flex-fill">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col className="">
                            {loading && (
                                <p className="text-muted">Carregando...</p>
                            )}
                            <h1
                                className="fw-bold ms-1 mb-0"
                                style={{ color: '#00A44B' }}
                            >
                                {localSelecionado?.nome ||
                                    'Carregando local...'}
                            </h1>
                            {
                                <EspacoCard
                                    nome={nome}
                                    setNome={setNome}
                                    capacidade={capacidade}
                                    setCapacidade={setCapacidade}
                                    predioBloco={predioBloco}
                                    setPredioBloco={setPredioBloco}
                                    recursosDisponiveis={recursosDisponiveis}
                                    setRecursosDisponiveis={
                                        setRecursosDisponiveis
                                    }
                                    ativo={ativo}
                                    setAtivo={setAtivo}
                                    titulo={
                                        editando
                                            ? 'Editar Espaço'
                                            : 'Criar Espaço'
                                    }
                                    erros={errors}
                                />
                            }

                            <Row className="my-3">
                                <Col className="d-flex justify-content-end gap-3">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="fw-bold"
                                        onClick={() =>
                                            navigate('/listar_locais_espacos')
                                        }
                                    >
                                        <MdArrowBack
                                            size={20}
                                            className="me-2"
                                        />
                                        Voltar
                                    </Button>
                                    <Button
                                        onClick={handleSalvar}
                                        size="lg"
                                        variant="success"
                                        className="fw-bold"
                                        style={{
                                            backgroundColor: '#00A44B',
                                            border: 'none',
                                        }}
                                        disabled={loading}
                                    >
                                        <MdCheckCircle
                                            size={20}
                                            className="me-2"
                                        />
                                        {editando
                                            ? 'Atualizar Espaço'
                                            : 'Criar Espaço'}
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>
            {/* mensagens de sucesso e erro*/}
            {message && (
                <Alerta mensagem={message} variacao="success" duracao={7000} />
            )}
            {error && (
                <Alerta
                    mensagem={
                        typeof error === 'string'
                            ? error
                            : 'Erro ao salvar ou carregar dados'
                    }
                    variacao="danger"
                    duracao={7000}
                />
            )}
            {/* Mude esses dados posteriormente */}
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
