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
import { useState } from 'react';
import useFormularioDinamico from '../hooks/useFormularioDinamico';
import { useModalidades } from '../hooks/useModalidades';
import Alerta from '../components/common/Alerta';
import { useTipoCampo } from '../hooks/useTipoCampo';
import eArray from '../utils/eArray';

export default function ModalidadeFormulario({ campus = 'Campus Restinga' }) {
    const [titulo, setTitulo] = useState('');
    const [requerAvaliacao, setRequerAvaliacao] = useState(false);
    const [emiteCertificado, setEmiteCertificado] = useState(false);
    const [numeroVagas, setNumeroVagas] = useState(0);
    const { submeterModalidade } = useModalidades();
    const { tipoCampo } = useTipoCampo();
    const [erros, setErros] = useState({});
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
    });

    const formularioCampos = useFormularioDinamico();
    const formularioCriterios = useFormularioDinamico();

    const basePayload = () => ({
        nome: titulo,
        requer_avaliacao: requerAvaliacao,
        emite_certificado: emiteCertificado,
        limite_vagas: numeroVagas,
    });

    const mostrarAlerta = (mensagem, variacao = 'danger') =>
        setAlerta((prev) => ({
            ...prev,
            mensagem,
            variacao,
            reacao: (prev.reacao || 0) + 1,
        }));

    async function handleSubmeterModalidade() {
        const campos = formularioCampos.paraArray();
        const criterios = formularioCriterios.paraArray();

        const res = await submeterModalidade({
            ...basePayload(),
            campos,
            criterios,
        });

        if (!res.valido) {
            setErros(res.erros || {});
            mostrarAlerta('Erros de validação. Verifique os campos.');
            return;
        }

        mostrarAlerta('Modalidade criada com sucesso.', 'success');
    }

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
                                erros={erros}
                                campos={[
                                    {
                                        name: 'nome',
                                        titulo: 'Título da Modalidade',
                                        tipo: 'text',
                                        preValue: titulo,
                                        onChange: (e) => setTitulo(e),
                                    },
                                    {
                                        name: 'requer_avaliacao',
                                        titulo: 'Requer Avaliação',
                                        tipo: 'switch',
                                        preValue: requerAvaliacao,
                                        onChange: (e) => setRequerAvaliacao(e),
                                    },
                                    {
                                        name: 'emite_certificado',
                                        titulo: 'Emite Certificado',
                                        tipo: 'switch',
                                        preValue: emiteCertificado,
                                        onChange: (e) => setEmiteCertificado(e),
                                    },
                                    {
                                        name: 'limite_vagas',
                                        titulo: 'Número de vagas',
                                        tipo: 'number',
                                        preValue: numeroVagas,
                                        onChange: (e) => setNumeroVagas(e),
                                    },
                                ]}
                            />
                            <CustomFormCard
                                add
                                titulo="Campos Customizado"
                                Icone={<LuPencil size={30} />}
                                corTexto="#00A44B"
                                erros={erros.campos || {}}
                                campos={[
                                    {
                                        name: 'nome',
                                        titulo: 'Nome do Campo',
                                        tipo: 'text',
                                        preValue: '',
                                        onChange: (val, instKey, fieldName) =>
                                            formularioCampos.aoAlterar(
                                                val,
                                                instKey,
                                                fieldName,
                                            ),
                                    },
                                    {
                                        name: 'tipo_dado',
                                        titulo: 'Tipo Campo',
                                        tipo: 'select',

                                        preValue: '#',
                                        onChange: (val, instKey, fieldName) =>
                                            formularioCampos.aoAlterar(
                                                val,
                                                instKey,
                                                fieldName,
                                            ),
                                        opcoes: [
                                            {
                                                value: '#',
                                                text: 'Selecione um Tipo de campo',
                                                disabled: true,
                                                selected: true,
                                            },
                                            ...(tipoCampo?.map((c) => ({
                                                text: c.label,
                                                value: c.value,
                                            })) || []),
                                        ],
                                    },
                                    {
                                        name: 'obrigatorio',
                                        titulo: 'Campo Obrigatório',
                                        tipo: 'switch',
                                        preValue: false,
                                        onChange: (val, instKey, fieldName) =>
                                            formularioCampos.aoAlterar(
                                                val,
                                                instKey,
                                                fieldName,
                                            ),
                                    },
                                ]}
                            />
                            {requerAvaliacao && (
                                <CustomFormCard
                                    add
                                    titulo="Critérios de Avaliação"
                                    Icone={<LuPencil size={30} />}
                                    corTexto="#00A44B"
                                    erros={erros.criterios || {}}
                                    campos={[
                                        {
                                            name: 'nome',
                                            titulo: 'Nome do Critério',
                                            tipo: 'text',
                                            preValue: '',
                                            onChange: (
                                                val,
                                                instKey,
                                                fieldName,
                                            ) =>
                                                formularioCriterios.aoAlterar(
                                                    val,
                                                    instKey,
                                                    fieldName,
                                                ),
                                        },

                                        {
                                            name: 'descricao',
                                            titulo: 'Descrição do Critério',
                                            tipo: 'text',
                                            preValue: '',
                                            onChange: (
                                                val,
                                                instKey,
                                                fieldName,
                                            ) =>
                                                formularioCriterios.aoAlterar(
                                                    val,
                                                    instKey,
                                                    fieldName,
                                                ),
                                        },
                                    ]}
                                />
                            )}
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
                                onClick={handleSubmeterModalidade}
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
            {alerta.mensagem && (
                <Alerta
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    reacao={alerta.reacao}
                />
            )}
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
