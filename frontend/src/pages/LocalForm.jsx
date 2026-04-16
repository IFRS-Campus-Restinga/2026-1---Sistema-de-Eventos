import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import LocalCard from '../components/common/LocalCard';
import Button from 'react-bootstrap/esm/Button';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useLocais from '../hooks/useLocais';
import Alerta from '../components/common/Alerta';

export default function LocalForm({ campus = 'Campus Restinga' }) {
    const {
        buscarLocal,
        localSelecionado,
        handleSave,
        loading,
        error,
        message,
    } = useLocais();

    const { id } = useParams(); // Se houver ID, é edição. Se não, é criação.
    const navigate = useNavigate(); // para navegar de volta para a página de listagem após criar o local
    const editando = Boolean(id); // Verifica se estamos editando ou criando
    const [errors, setErrors] = useState({}); // Para armazenar erros de validação

    // estados dos campos
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');

    // Para carregar dados apenas se for edição
    useEffect(() => {
        if (editando) {
            buscarLocal(id);
        }
    }, [id]);

    useEffect(() => {
        if (localSelecionado) {
            setNome(localSelecionado.nome || '');
            setEndereco(localSelecionado.endereco || '');
        }
    }, [localSelecionado]);

    // faz as validações de campo e incrementa os erros na variável de estado errors.
    const validar = () => {
        let novosErros = {};

        if (!nome.trim()) {
            novosErros.nome = 'Nome é obrigatório';
        } else if (nome.length < 3) {
            novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
        } else if (/^\d+$/.test(nome)) {
            novosErros.nome = 'Nome não pode ser só números';
        }

        if (!endereco.trim()) {
            novosErros.endereco = 'Endereço é obrigatório';
        } else if (endereco.length < 10) {
            novosErros.endereco = 'Endereço deve ter pelo menos 10 caracteres';
        } else if (!/\d/.test(endereco)) {
            novosErros.endereco = 'Endereço deve conter número';
        }

        setErrors(novosErros);

        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        const resultado = await handleSave({
            id: editando ? id : null,
            nome,
            endereco,
        });

        if (resultado.sucesso) {
            const timeout = setTimeout(() => {
                navigate('/listarLocais');
            }, 1000);
        } else {
            if (resultado.erro) {
                setErrors(resultado.erro);
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
                            {
                                <LocalCard
                                    nome={nome}
                                    setNome={setNome}
                                    endereco={endereco}
                                    setEndereco={setEndereco}
                                    titulo={
                                        editando
                                            ? 'Editar Local'
                                            : 'Criar Local'
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
                                            navigate('/listarLocais')
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
                                            ? 'Atualizar Local'
                                            : 'Criar Local'}
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
