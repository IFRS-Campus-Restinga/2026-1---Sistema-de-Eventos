import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import FormularioCustomizado from '../components/custom-form-card/FormularioCustomizado';
import Alerta from '../components/common/Alerta';
import ModalPopup from '../components/common/ModalPopup';
import { LuPencil } from 'react-icons/lu';
import { MdCheckCircle } from 'react-icons/md';
import {
    MdEdit,
    MdArrowBack,
    MdAccessTime,
    MdSchool,
    MdAssignment,
    MdAttachFile,
    MdDelete,
} from 'react-icons/md';
import { useModalidades } from '../hooks/useModalidades';
import { useSetores } from '../hooks/useSetores';
import useLocais from '../hooks/useLocais';
import { useTipoEtapa } from '../hooks/useTipoEtapa';
import { useEventos } from '../hooks/useEventos';
import { buscarEventoPorId, deletarEvento } from '../services/eventoService';
import { criarEtapa, atualizarEtapa } from '../services/etapaEventoService';
import eArray from '../utils/eArray';

export default function CriarEvento({ campus = 'Campus Restinga' }) {
    const navegate = useNavigate();
    const { id } = useParams();
    const modoEdicao = Boolean(id);

    const { modalidades } = useModalidades();
    const { setores } = useSetores();
    const { locais } = useLocais();
    const { tipoEtapas } = useTipoEtapa();
    const { criarEventos, atualizarEventos, loading } = useEventos();

    const [mostrarModal, setMostrarModal] = useState(false);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);

    const [nome, setNome] = useState('');
    const [tema, setTema] = useState('');
    const [setor, setSetor] = useState(null);
    const [cargaHoraria, setCargaHoraria] = useState(0);
    const [descricao, setDescricao] = useState('');
    const [local, setLocal] = useState(null);
    const [fases, setFases] = useState([]);
    const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState([]);
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
    });

    const paraArray = (data) =>
        eArray(data) ? data : eArray(data?.results) ? data.results : [];

    const basePayloadMemo = useMemo(
        () => ({
            nome,
            tema,
            setor: setor?.value ?? setor,
            carga_horaria: Number(cargaHoraria),
            descricao,
            local_id: local?.value ?? local,
        }),
        [nome, tema, setor, cargaHoraria, descricao, local],
    );

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
                const dadosEvento = await buscarEventoPorId(id);

                setNome(dadosEvento?.nome || '');
                setTema(dadosEvento?.tema || '');
                setCargaHoraria(Number(dadosEvento?.carga_horaria || 0));
                setDescricao(dadosEvento?.descricao || '');

                const setoresData = dadosEvento?.setor;
                if (setoresData) {
                    setSetor(setoresData?.id || setoresData);
                }

                const localData = dadosEvento?.local;
                if (localData) {
                    setLocal(localData?.id || localData);
                }

                const etapasData = dadosEvento?.etapas;
                if (etapasData) {
                    setFases(
                        paraArray(etapasData).map((etapa) => ({
                            tipo: etapa?.tipo_etapa,
                            inicio: etapa?.data_inicio,
                            fim: etapa?.data_fim,
                            id: etapa?.id,
                        })),
                    );
                }

                const modalidadesData = dadosEvento?.modalidades;
                if (modalidadesData) {
                    setModalidadesSelecionadas(paraArray(modalidadesData));
                }
            } catch {
                mostrarAlerta('Não foi possível carregar o evento.');
            } finally {
                setCarregandoEdicao(false);
            }
        }

        carregarDadosEdicao();
    }, [id, modoEdicao]);

    const handleFasesChange = useCallback((mapaFases) => {
        setFases(mapaFases?.fase || []);
    }, []);

    const handleCriarEvento = useCallback(async () => {
        if (carregandoEdicao) return;

        const dadosEvento = basePayloadMemo;
        console.log(dadosEvento, fases);

        let resultado;

        try {
            if (modoEdicao) {
                const idsModalidades = modalidadesSelecionadas.map(
                    (m) => m.value || m.id,
                );
                resultado = await atualizarEventos(id, {
                    ...dadosEvento,
                    modalidade_ids: idsModalidades,
                });

                if (resultado) {
                    for (const fase of fases) {
                        if (fase.id) {
                            await atualizarEtapa(fase.id, {
                                tipo_etapa: fase.tipo,
                                data_inicio: fase.inicio,
                                data_fim: fase.fim,
                            });
                        } else {
                            await criarEtapa({
                                tipo_etapa: fase.tipo,
                                data_inicio: fase.inicio,
                                data_fim: fase.fim,
                                evento_id: id,
                            });
                        }
                    }
                }
            } else {
                resultado = await criarEventos(
                    dadosEvento,
                    fases,
                    modalidadesSelecionadas,
                );
            }
        } catch {
            mostrarAlerta('Não foi possível salvar o evento.');
            return;
        }

        if (!resultado && !modoEdicao) {
            mostrarAlerta('Erros de validação. Verifique os campos.');
            return;
        }

        mostrarAlerta(
            modoEdicao
                ? 'Evento atualizado com sucesso.'
                : 'Evento criado com sucesso.',
            'success',
        );
        setTimeout(() => {
            navegate('/listarEventos');
        }, 3000);
    }, [
        carregandoEdicao,
        basePayloadMemo,
        modoEdicao,
        fases,
        modalidadesSelecionadas,
        atualizarEventos,
        id,
        criarEventos,
        navegate,
    ]);

    async function handleExcluirEvento() {
        if (!modoEdicao) return;

        try {
            await deletarEvento(id);
            mostrarAlerta('Evento excluído com sucesso.', 'success');
            setTimeout(() => {
                navegate('/listarEventos');
            }, 3000);
        } catch {
            mostrarAlerta('Não foi possível excluir o evento.');
        }
    }

    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col className="d-flex flex-column gap-3">
                            <FormularioCustomizado
                                titulo="Dados Básicos do Evento"
                                Icone={<MdEdit size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        name: 'nome',
                                        titulo: 'Nome do Evento *',
                                        tipo: 'text',
                                        preValue: nome,
                                        onChange: (n) => setNome(n),
                                    },
                                    {
                                        name: 'tema',
                                        titulo: 'Tema Principal *',
                                        tipo: 'text',
                                        preValue: tema,
                                        onChange: (n) => setTema(n),
                                    },
                                    {
                                        name: 'setor',
                                        titulo: 'Setor Responsável *',
                                        tipo: 'select',
                                        preValue: setor || '#',
                                        opcoes: [
                                            {
                                                value: '#',
                                                text: 'Selecione...',
                                                disabled: true,
                                            },
                                            ...setores,
                                        ],
                                        onChange: (s) => setSetor(s),
                                    },
                                    {
                                        name: 'carga',
                                        titulo: 'Carga Horária (horas) *',
                                        tipo: 'number',
                                        preValue: cargaHoraria,
                                        onChange: (d) => setCargaHoraria(d),
                                    },
                                    {
                                        name: 'descricao',
                                        titulo: 'Descrição *',
                                        tipo: 'textarea',
                                        preValue: descricao,
                                        onChange: (d) => setDescricao(d),
                                    },
                                    {
                                        name: 'local',
                                        titulo: 'Local *',
                                        tipo: 'select',
                                        preValue: local || '#',
                                        opcoes: [
                                            {
                                                value: '#',
                                                text: 'Selecione...',
                                                disabled: true,
                                            },
                                            ...locais.map((l) => ({
                                                value: l.id,
                                                text: l.nome,
                                            })),
                                        ],
                                        onChange: (l) => setLocal(l),
                                    },
                                ]}
                            />
                            <FormularioCustomizado
                                titulo="Controle de Prazos (Fases)"
                                Icone={<MdAccessTime size={30} />}
                                corTexto="#00A44B"
                                onFasesChange={handleFasesChange}
                                campos={[
                                    {
                                        name: 'fase',
                                        tipo: 'fase',
                                        opcoes: tipoEtapas.map((tipo) => ({
                                            value:
                                                tipo?.value ?? tipo?.id ?? tipo,
                                            text:
                                                tipo?.label ??
                                                tipo?.text ??
                                                tipo?.descricao ??
                                                String(tipo),
                                            descricao: tipo?.descricao ?? '',
                                        })),
                                    },
                                ]}
                            />
                            <FormularioCustomizado
                                titulo="Áreas de Conhecimento"
                                Icone={<MdSchool size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        name: 'area',
                                        list: 'lista_areas',
                                        tipo: 'datalist',
                                        placeholder: 'Nome da área',
                                    },
                                ]}
                            />
                            <FormularioCustomizado
                                titulo="Trabalhos"
                                Icone={<MdAssignment size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        name: 'modalidades',
                                        list: 'lista_modalidades',
                                        placeholder: 'Nome da Modalidade',
                                        tipo: 'datalist',
                                        opcoes: modalidades.map((m) => ({
                                            value: m.id,
                                            text: m.nome,
                                        })),
                                        onChange: (m) =>
                                            setModalidadesSelecionadas(
                                                Array.isArray(m)
                                                    ? m
                                                    : m
                                                      ? [m]
                                                      : [],
                                            ),
                                    },
                                ]}
                            />
                            <FormularioCustomizado
                                titulo="Anexos e Finalização"
                                Icone={<MdAttachFile size={30} />}
                                corTexto="#00A44B"
                                campos={[
                                    {
                                        titulo: 'Adicionar arquivo',
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
                                disabled={loading || carregandoEdicao}
                            >
                                <MdArrowBack size={20} className="me-2" />
                                Voltar
                            </Button>
                            {modoEdicao && (
                                <Button
                                    variant="danger"
                                    className="p-2"
                                    onClick={() => setMostrarModal(true)}
                                    disabled={carregandoEdicao}
                                >
                                    <MdDelete size={20} className="me-2" />
                                    Excluir Evento
                                </Button>
                            )}
                            <Button
                                variant="success"
                                style={{ background: '#00A44B' }}
                                className="p-2"
                                onClick={handleCriarEvento}
                                disabled={loading || carregandoEdicao}
                            >
                                <MdCheckCircle size={20} className="me-2" />
                                {carregandoEdicao
                                    ? 'Carregando...'
                                    : modoEdicao
                                      ? 'Atualizar Evento'
                                      : 'Criar Evento'}
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
            <ModalPopup
                show={mostrarModal}
                titulo="Aviso!"
                tituloSecundario="Excluir Evento"
                onAcao={() => {
                    handleExcluirEvento();
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
