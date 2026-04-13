import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CustomFormCard from '../components/common/CustomFormCard';
import NavBar from '../components/nav_bar/NavBar';
import { LuPencil } from 'react-icons/lu';
import { MdCheckCircle } from 'react-icons/md';
import { MdArrowBack } from 'react-icons/md';

export default function AdicionarModalidade({ campus = 'Campus Restinga' }) {
    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col className="d-flex flex-column gap-3">
                            <CustomFormCard
                                titulo="Campos Padronizados"
                                Icone={<LuPencil size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        titulo: 'Título da Modalidade',
                                        tipo: 'text',
                                    },
                                    {
                                        titulo: 'Requer Avaliação',
                                        tipo: 'switch',
                                    },
                                    {
                                        titulo: 'Emite Certificado',
                                        tipo: 'switch',
                                    },
                                ]}
                            />
                            <CustomFormCard
                                add
                                titulo="Campos Customizado"
                                Icone={<LuPencil size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        titulo: 'Nome do Campo',
                                        tipo: 'text',
                                    },
                                    {
                                        titulo: 'Tipo Campo',
                                        tipo: 'select',
                                        opcoes: [
                                            {
                                                value: '#',
                                                text: 'Selecione um Tipo de campo',
                                                disabled: true,
                                                selected: true,
                                            },
                                            { value: 1, text: 'Opcao 1' },
                                        ],
                                    },
                                    {
                                        titulo: 'Campo Obrigatório',
                                        tipo: 'switch',
                                    },
                                ]}
                            />
                            <CustomFormCard
                                add
                                titulo="Critérios de Avaliação"
                                Icone={<LuPencil size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        titulo: 'Nome do Critério',
                                        tipo: 'text',
                                    },

                                    {
                                        titulo: 'Descrição do Critério',
                                        tipo: 'text',
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
                                    Criar Modalidade
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
