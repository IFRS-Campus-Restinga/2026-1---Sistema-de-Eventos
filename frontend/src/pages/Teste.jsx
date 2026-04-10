import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CriarEventoCard from '../components/common/criarEventoCard';
import CustomFormCard from '../components/common/CustomFormCard';
import { criarEvento } from '../services/eventoService';
import { useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { FaRegClock } from 'react-icons/fa';
import { AiFillBook } from 'react-icons/ai';
import { LuBookCopy } from 'react-icons/lu';
import { GiPaperClip } from 'react-icons/gi';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { MdArrowBack } from 'react-icons/md';

export default function CriarEvento({ campus = 'Campus Restinga' }) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('');
    const [carga_horaria, setCargaHoraria] = useState(0);
    const [setor, setSetor] = useState('');
    const [tema, setTema] = useState('');

    const handleSalvar = async () => {
        if (
            !nome ||
            !descricao ||
            !status ||
            !carga_horaria ||
            !setor ||
            !tema
        ) {
            alert('Por favor, preenche todos os campos');
            return;
        }

        try {
            const novoEvento = {
                nome,
                descricao,
                status,
                carga_horaria,
                setor,
                tema,
            };
            await criarEvento(novoEvento);
            alert('Local criado com sucesso!');
            navigate('/#');
            setNome('');
            setDescricao('');
            setCargaHoraria('');
            setStatus('');
            setTema('');
            setSetor('');
        } catch (erro) {
            console.error('Erro ao criar Evento:', erro);
            alert('Erro ao criar evento. Por favor, tente novamente.');
        }
    };

    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col className="d-flex flex-column gap-3">
                            <CustomFormCard
                                titulo="Dados Básicos do Evento"
                                Icone={<MdEdit size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    { titulo: 'Nome do Evento', tipo: 'text' },
                                    { titulo: 'Tema Principal', tipo: 'text' },
                                    [
                                        {
                                            titulo: 'Local',
                                            tipo: 'select',
                                            opcoes: [
                                                {
                                                    value: '#',
                                                    text: 'Selecione um Local',
                                                    disabled: true,
                                                    selected: true,
                                                },
                                                { value: 1, text: 'Opcao 1' },
                                            ],
                                        },
                                        {
                                            tipo: 'button link',
                                            to: '/adicionarLocal',
                                            variant: 'success',
                                            background: '#00A44B',
                                            text: 'Cadastrar Espaço',
                                        },
                                    ],
                                ]}
                            />
                            <CustomFormCard
                                titulo="Controle de Prazos (Fases)"
                                Icone={<FaRegClock size={30} />}
                                corTexto="#00A44B"
                            />
                            <CustomFormCard
                                titulo="Áreas de Conhecimento"
                                Icone={<AiFillBook size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        tipo: 'datalist',
                                        placeholder: 'Selecione Áreas',
                                        list: 'areas',
                                        areas: [
                                            {
                                                value: 1,
                                                text: 'Ciências Exatas e da Terra',
                                            },
                                        ],
                                        opcoes: [
                                            { value: 3, text: 'Engenharias' },
                                            {
                                                value: 2,
                                                text: 'Ciências Humanas',
                                            },
                                        ],
                                    },
                                ]}
                            />
                            <CustomFormCard
                                titulo="Avaliações e Trabalhos"
                                Icone={<LuBookCopy size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        tipo: 'datalist',
                                        placeholder: 'Selecione Modalidades',
                                        list: 'modalidades',
                                        areas: [
                                            {
                                                value: 1,
                                                text: 'Apresentação Oral',
                                            },
                                        ],
                                        opcoes: [
                                            { value: 3, text: 'Poster' },
                                            { value: 2, text: 'Oficina' },
                                        ],
                                    },
                                ]}
                            />
                            <CustomFormCard
                                titulo="Anexos e Finalização"
                                Icone={<GiPaperClip size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        titulo: 'Adicionar Arquivo',
                                        tipo: 'file',
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex justify-content-end gap-3">
                            <Button
                                variant="secondary"
                                className="border-0 p-2"
                            >
                                <MdArrowBack size={20} className="me-2" />
                                <Link className="text-decoration-none text-white">
                                    Voltar
                                </Link>
                            </Button>
                            <Button
                                variant="success"
                                style={{ background: '#00A44B' }}
                                className="p-2"
                            >
                                <MdCheckCircle size={20} className="me-2" />
                                <Link className="text-decoration-none text-white">
                                    Criar Evento
                                </Link>
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
