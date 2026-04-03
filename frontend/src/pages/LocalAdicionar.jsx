import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import LocalCard from '../components/common/LocalCard';
import Button from 'react-bootstrap/esm/Button';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { useState, } from 'react';
import { criarLocal } from '../services/localService';   // não usei o uselocais pq eu não soube implementar 
import { useNavigate } from 'react-router-dom';


export default function LocalAdicionar({ campus = 'Campus Restinga' }) {
    // Estados para os campos
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const navigate = useNavigate(); // para navegar de volta para a página de listagem após criar o local

    const handleSalvar = async () => {
        if (!nome || !endereco) {
            alert('Por favor, preencha todos os campos antes de salvar.');
            return;
        }
        try {
            const novoLocal = { nome, endereco };
            await criarLocal(novoLocal);
            alert('Local criado com sucesso!');
            navigate('/#');
            // Limpar os campos após salvar
            setNome('');
            setEndereco('');
        } catch (erro) {
            console.error('Erro ao criar local:', erro);
            alert('Erro ao criar local. Por favor, tente novamente.');
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
                            />}
                            <Row className="my-3">
                                <Col className="d-flex justify-content-end gap-3">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="fw-bold"
                                    >
                                        <MdArrowBack
                                            size={20}
                                            className="me-2"
                                        />
                                        Voltar
                                    </Button>
                                    <Button
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
                                            onClick={handleSalvar}
                                        />
                                        Criar Local
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
