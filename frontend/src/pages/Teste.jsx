import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import FormularioCustomizado from '../components/custom-form-card/FormularioCustomizado';
import { useState } from 'react';
import { GiPaperClip } from 'react-icons/gi';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { MdEdit, MdArrowBack, MdLocalOffer } from 'react-icons/md';
import { FaUsers } from 'react-icons/fa';
import { useModalidades } from '../hooks/useModalidades';

export default function CriarEvento({ campus = 'Campus Restinga' }) {
    const navegate = useNavigate();
    const { modalidades } = useModalidades();
    const [modalidade, setModalidade] = useState('#');
    const modalidadeSelecionada = modalidades.find(
        (m) => String(m?.id) === String(modalidade),
    );
    console.log(modalidade);
    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col className="d-flex flex-column gap-3">
                            <FormularioCustomizado
                                titulo="Classificação do Trabalho"
                                Icone={<MdLocalOffer size={30} />}
                                corTexto="#00A44B"
                                orientacao="row"
                                campos={[
                                    {
                                        name: 'tipo_dado',
                                        titulo: 'Modalidade *',
                                        tipo: 'select',
                                        onChange: (valor) =>
                                            setModalidade(valor),

                                        preValue: '#',
                                        opcoes: [
                                            {
                                                value: '#',
                                                text: 'Selecione uma modalidade',
                                                disabled: true,
                                                selected: true,
                                            },
                                            ...modalidades.map((m) => ({
                                                value: m.id,
                                                text: m.nome,
                                            })),
                                        ],
                                    },
                                    {
                                        name: 'nivel_ensino',
                                        titulo: 'Nivel de Ensino *',
                                        tipo: 'select',

                                        preValue: '#',
                                        opcoes: [
                                            {
                                                value: '#',
                                                text: 'Selecione um nivel de ensino',
                                                disabled: true,
                                                selected: true,
                                            },
                                        ],
                                    },
                                    {
                                        name: 'area_conhecimento',
                                        titulo: 'Área do Conhecimento *',
                                        tipo: 'select',

                                        preValue: '#',
                                        opcoes: [
                                            {
                                                value: '#',
                                                text: 'Selecione uma Area de conhecimento',
                                                disabled: true,
                                                selected: true,
                                            },
                                        ],
                                    },
                                ]}
                            />
                            <FormularioCustomizado
                                titulo="Detalhes do Trabalho"
                                Icone={<MdEdit size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        titulo: 'Titulo do trabalho *',
                                        tipo: 'text',
                                        placeholder:
                                            'Digite o título do seu trabalho',
                                    },
                                    {
                                        titulo: 'Resumo *',
                                        tipo: 'textarea',
                                        placeholder:
                                            'Informe o resumo do seu trabalho',
                                    },
                                    {
                                        titulo: 'Palavras-chave *',
                                        tipo: 'text',
                                        placeholder:
                                            'Informe as palavras-chave',
                                    },
                                ]}
                            />
                            <FormularioCustomizado
                                titulo="Equipe"
                                Icone={<FaUsers size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        tipo: 'equipe',
                                        name: 'equipe',
                                    },
                                    ...(
                                        modalidadeSelecionada?.campos || []
                                    ).map((c) => ({
                                        titulo: c.nome,
                                        tipo: c.tipo_dado,
                                        obrigatorio: c.obrigatorio,
                                    })),
                                ]}
                            />
                            <FormularioCustomizado
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
                                onClick={() => navegate(-1)}
                            >
                                <MdArrowBack size={20} className="me-2" />
                                Voltar
                            </Button>
                            <Button
                                variant="success"
                                style={{ background: '#00A44B' }}
                                className="p-2"
                                as={Link}
                                to="#"
                            >
                                <MdCheckCircle size={20} className="me-2" />
                                Criar Evento
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
