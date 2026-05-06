import React, { useState } from 'react';
import { Container, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { MdEdit, MdDelete, MdArrowBack, MdLocationOn } from 'react-icons/md';
import ListaGenerica from '../components/lista_generica/ListaGenerica';
import { Link } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import useLocais from '../hooks/useLocais';
import Card from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import ModalPopup from '../components/common/ModalPopup';
import Alerta from '../components/common/Alerta';

export default function LocaisListar() {
    const { locais, loading, error, excluiLocal } = useLocais();
    const navigate = useNavigate();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [idSelecionado, setIdSelecionado] = useState(null);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill py-4">
                <Container>
                    <ListaGenerica
                        corBorda="#00A44B"
                        titulo="Locais cadastrados"
                        itens={locais}
                        loading={loading}
                        error={error}
                        rotaAdicionar="/adicionar_local"
                        rotaEditarBase="/editar_local"
                        onDeletar={(id) => {
                            setMostrarModal(true);
                            setIdSelecionado(id);
                        }}
                    />
                    {/* Botão Voltar Inferior */}{' '}
                    {/*implementar rota para voltar*/}
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            onClick={() => navigate(`/`)}
                            variant="secondary"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                        >
                            <MdArrowBack /> Voltar
                        </Button>
                    </div>
                </Container>
            </main>
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

            <ModalPopup
                show={mostrarModal}
                titulo="Aviso!"
                tituloSecundario="Excluir Local"
                onAcao={() => {
                    excluiLocal(idSelecionado);
                    setMostrarModal(false);
                }}
                onFechar={() => setMostrarModal(false)}
                textoAcao="Excluir"
            />

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
