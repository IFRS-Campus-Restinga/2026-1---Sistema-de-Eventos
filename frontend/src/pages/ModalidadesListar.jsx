import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import ListaGenerica from '../components/lista_generica/ListaGenerica';
import { Button } from 'react-bootstrap';
import { MdArrowBack } from 'react-icons/md';
import { useModalidades } from '../hooks/useModalidades';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';

export default function ModalidadesListar({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();
    const { modalidades, excluirModalidades } = useModalidades();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [idSelecionado, setIdSelecionado] = useState(null);
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

    async function handleExcluirModalidade(id) {
        try {
            await excluirModalidades(id);
            mostrarAlerta('Modalidade excluída com sucesso.', 'success');
            navigate('/listarModalidades');
        } catch {
            mostrarAlerta('Não foi possível excluir a modalidade.');
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    <ListaGenerica
                        corBorda="#00A44B"
                        titulo="Modalidades"
                        itens={modalidades}
                        textoAdicionar="Adicionar Modalidade"
                        rotaAdicionar="/adicionar_modalidade"
                        rotaEditarBase="/editar_modalidade"
                        onDeletar={(id) => {
                            setMostrarModal(true);
                            setIdSelecionado(id);
                        }}
                        paginacao={3}
                    />
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            onClick={() => navigate(`/dashboard`)}
                            variant="secondary"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                        >
                            <MdArrowBack /> Voltar
                        </Button>
                    </div>
                </Container>
            </main>
            <ModalPopup
                show={mostrarModal}
                titulo="Aviso!"
                tituloSecundario="Excluir Modalidade"
                onAcao={() => {
                    handleExcluirModalidade(idSelecionado);
                    setMostrarModal(false);
                }}
                onFechar={() => setMostrarModal(false)}
                textoAcao="Excluir"
            />
            {alerta.mensagem && (
                <Alerta
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    reacao={alerta.reacao}
                />
            )}
            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus={campus}
            />
        </div>
    );
}
