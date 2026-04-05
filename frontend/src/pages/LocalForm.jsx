import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import LocalCard from '../components/common/LocalCard';
import Button from 'react-bootstrap/esm/Button';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { atualizarLocal, criarLocal, pegarLocal } from '../services/localService';   // não usei o uselocais pq eu não soube implementar 
import { useNavigate, useParams } from 'react-router-dom';


export default function LocalForm({ campus = 'Campus Restinga' }) {
    // Estados para os campos
    const { id } = useParams(); // Se houver ID, é edição. Se não, é criação.
    const navigate = useNavigate(); // para navegar de volta para a página de listagem após criar o local
    const editando = Boolean(id); // Verifica se estamos editando ou criando

    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');


    // Para carregar dados apenas se for edição
    useEffect(() => {
        if (editando) {
            async function carregarDados() {
                try {
                    const dados = await pegarLocal(id); //
                    setNome(dados.nome);
                    setEndereco(dados.endereco);
                } catch (erro) {
                    console.error('Erro ao buscar local:', erro);
                }
            }
            carregarDados();
        }
    }, [id, editando]);

    const handleSalvar = async () => {
        if (!nome || !endereco) {
            alert('Por favor, preencha todos os campos antes de salvar.');
            return;
        }
        try {
            const dadosLocal = { nome, endereco };

            if (editando) {
                try {
                    await atualizarLocal(id, dadosLocal);
                    alert('Local atualizado com sucesso!');
                    navigate('/listarLocais');

                } catch (erro) {
                    console.error('Erro ao atualizar local:', erro);
                    alert('Erro ao atualizar local. Por favor, tente novamente.');
                }
            } else {
                try {
                    await criarLocal(dadosLocal);
                    alert('Local criado com sucesso!');
                    navigate('/listarLocais');

                } catch (erro) {
                    console.error('Erro ao criar local:', erro);
                    alert('Erro ao criar local. Por favor, tente novamente.');
                }
            }
        } catch (erro) {
            console.error('Erro na operação:', erro);
            alert('Erro na operação. Por favor, tente novamente.');
        }
    };


    return (
        <>
            <NavBar />
            <main className="flex-fill">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col className="">
                            {<LocalCard
                                nome={nome}
                                setNome={setNome}
                                endereco={endereco}
                                setEndereco={setEndereco}
                                titulo={editando ? "Editar Local" : "Criar Local"}
                            />}
                            <Row className="my-3">
                                <Col className="d-flex justify-content-end gap-3">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="fw-bold"
                                        onClick={() => navigate('/listarLocais')}
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
                                    >
                                        <MdCheckCircle
                                            size={20}
                                            className="me-2"
                                        />
                                        {editando ? "Atualizar Local" : "Criar Local"}
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>
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
