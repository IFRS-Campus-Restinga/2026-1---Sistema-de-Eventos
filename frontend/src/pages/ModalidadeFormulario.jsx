import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CustomFormCard from '../components/custom-form-card/FormularioCustomizado';
import NavBar from '../components/nav_bar/NavBar';
import { LuPencil } from 'react-icons/lu';
import { MdCheckCircle } from 'react-icons/md';
import { MdArrowBack } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import useFormularioDinamico from '../hooks/useFormularioDinamico';
import { useModalidades } from '../hooks/useModalidades';
import Alerta from '../components/common/Alerta';
import { useTipoCampo } from '../hooks/useTipoCampo';
import { pegarModalidade } from '../services/modalidadeService';
import { pegarCampoFormulario } from '../services/campoFormularioService';
import { pegarCriterioAvaliacao } from '../services/criterioAvaliacaoService';
import eArray from '../utils/eArray';
import ModalPopup from '../components/common/ModalPopup';

export default function ModalidadeFormulario({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const modoEdicao = Boolean(id);
    const [mostrarModal, setMostrarModal] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [requerAvaliacao, setRequerAvaliacao] = useState(false);
    const [emiteCertificado, setEmiteCertificado] = useState(false);
    const [numeroVagas, setNumeroVagas] = useState(0);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [camposIniciais, setCamposIniciais] = useState([]);
    const [criteriosIniciais, setCriteriosIniciais] = useState([]);
    const {
        submeterModalidade,
        submeterAtualizacaoModalidade,
        excluirModalidades,
    } = useModalidades();
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

    useEffect(() => {
        async function carregarDadosEdicao() {
            if (!modoEdicao) return;

            setCarregandoEdicao(true);
            try {
                const [modalidadeData, campoData, criterioData] =
                    await Promise.all([
                        pegarModalidade(id),
                        pegarCampoFormulario(),
                        pegarCriterioAvaliacao(),
                    ]);

                const campos = eArray(campoData)
                    ? campoData
                    : eArray(campoData?.results)
                      ? campoData.results
                      : [];

                const criterios = eArray(criterioData)
                    ? criterioData
                    : eArray(criterioData?.results)
                      ? criterioData.results
                      : [];

                setTitulo(modalidadeData?.nome || '');
                setRequerAvaliacao(Boolean(modalidadeData?.requer_avaliacao));
                setEmiteCertificado(Boolean(modalidadeData?.emite_certificado));
                setNumeroVagas(Number(modalidadeData?.limite_vagas || 0));
                setCamposIniciais(
                    campos.filter(
                        (campo) => Number(campo.modalidade) === Number(id),
                    ),
                );
                setCriteriosIniciais(
                    criterios.filter(
                        (criterio) =>
                            Number(criterio.modalidade) === Number(id),
                    ),
                );
            } catch {
                mostrarAlerta('Não foi possível carregar a modalidade.');
            } finally {
                setCarregandoEdicao(false);
            }
        }

        carregarDadosEdicao();
    }, [id, modoEdicao]);

    async function handleSubmeterModalidade() {
        if (carregandoEdicao) return;

        const campos = formularioCampos.paraArray();
        const criterios = formularioCriterios.paraArray();

        let res;

        try {
            if (modoEdicao) {
                res = await submeterAtualizacaoModalidade(id, {
                    ...basePayload(),
                    campos,
                    criterios,
                });
            } else {
                res = await submeterModalidade({
                    ...basePayload(),
                    campos,
                    criterios,
                });
            }
        } catch {
            mostrarAlerta('Não foi possível salvar a modalidade.');
            return;
        }

        if (!res.valido) {
            setErros(res.erros || {});
            mostrarAlerta('Erros de validação. Verifique os campos.');
            return;
        }

        mostrarAlerta(
            modoEdicao
                ? 'Modalidade atualizada com sucesso.'
                : 'Modalidade criada com sucesso.',
            'success',
        );
        setTimeout(() => {
            navigate('/listarModalidades');
        }, 1000);
    }

    async function handleExcluirModalidade() {
        if (!modoEdicao) return;

        try {
            await excluirModalidades(id);
            mostrarAlerta('Modalidade excluída com sucesso.', 'success');
            setTimeout(() => {
                navigate('/listarModalidades');
            }, 1000);
        } catch {
            mostrarAlerta('Não foi possível excluir a modalidade.');
        }
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
                                iniciarSemGrupo
                                titulo="Campos Customizado"
                                Icone={<LuPencil size={30} />}
                                corTexto="#00A44B"
                                erros={erros.campos || {}}
                                gruposIniciais={camposIniciais}
                                aoRemoverGrupo={(chaveInst) =>
                                    formularioCampos.removerInstancia(chaveInst)
                                }
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
                                    gruposIniciais={criteriosIniciais}
                                    aoRemoverGrupo={(chaveInst) =>
                                        formularioCriterios.removerInstancia(
                                            chaveInst,
                                        )
                                    }
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
                                onClick={() => navigate(-1)}
                            >
                                <MdArrowBack size={20} className="me-2" />
                                Voltar
                            </Button>
                            {modoEdicao && (
                                <Button
                                    variant="danger"
                                    className="p-2"
                                    onClick={() => setMostrarModal(true)}
                                >
                                    <MdDelete size={20} className="me-2" />
                                    Excluir Modalidade
                                </Button>
                            )}
                            <Button
                                variant="success"
                                style={{ background: '#00A44B' }}
                                className="p-2"
                                onClick={handleSubmeterModalidade}
                                disabled={carregandoEdicao}
                            >
                                <MdCheckCircle size={20} className="me-2" />
                                {modoEdicao
                                    ? 'Atualizar Modalidade'
                                    : 'Criar Modalidade'}
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
            <ModalPopup
                show={mostrarModal}
                titulo="Aviso!"
                tituloSecundario="Excluir Modalidade"
                onAcao={() => {
                    handleExcluirModalidade();
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
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
