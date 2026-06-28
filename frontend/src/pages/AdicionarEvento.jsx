import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CriarEventoCard from '../components/common/criarEventoCard';
import { useParams, useNavigate } from 'react-router-dom';
import {
    criarEvento,
    buscarOpcoesFormulario,
    atualizarEvento,
    buscarEventoPorId,
} from '../services/eventoService';
import { useState, useEffect } from 'react';

const formatarDataHoraParaInput = (valor) => {
    if (!valor) return '';

    if (typeof valor === 'string') {
        const valorNormalizado = valor.replace('Z', '');
        const correspondencia = valorNormalizado.match(
            /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?$/,
        );

        if (correspondencia) {
            return `${correspondencia[1]}T${correspondencia[2]}`;
        }

        const data = new Date(valorNormalizado);
        if (!Number.isNaN(data.getTime())) {
            const pad = (numero) => String(numero).padStart(2, '0');
            return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(
                data.getDate(),
            )}T${pad(data.getHours())}:${pad(data.getMinutes())}`;
        }

        return valor.substring(0, 16);
    }

    return '';
};

export default function CriarEvento() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('');
    const [carga_horaria, setCargaHoraria] = useState(0);
    const [setor, setSetor] = useState('');
    const [tema, setTema] = useState('');
    const [opcoes, setOpcoes] = useState({ status: [], setores: [] });
    const [errors, setErrors] = useState({});
    const [locais, setLocais] = useState([]);
    const [localId, setLocalId] = useState('');
    const [exibirSucesso, setExibirSucesso] = useState(false);
    const [exibirErro, setExibirErro] = useState(false);
    const [etapas, setEtapas] = useState([]);
    const [etapasSelecionadas, setEtapasSelecionadas] = useState([]);
    const [areasSelecionadas, setAreasSelecionadas] = useState([]);
    const [listaAreasDisponiveis, setListaAreasDisponiveis] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState([]);
    const [etapaId, setEtapaId] = useState('');
    const [areaConhecimentoId, setAreaConhecimentoId] = useState('');
    const [linkEdital, setLinkEdital] = useState('');

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const dados = await buscarOpcoesFormulario();
                setOpcoes(dados);

                if (id) {
                    const evento = await buscarEventoPorId(id);
                    setNome(evento.nome || '');
                    setDescricao(evento.descricao || '');
                    setTema(evento.tema || '');
                    setSetor(evento.setor || '');
                    setCargaHoraria(evento.carga_horaria || 0);
                    const idDoLocal = evento.local?.id || evento.local;
                    setLocalId(idDoLocal || '');
                    const idEtapa = evento.etapas?.id || evento.etapas;
                    setLinkEdital(evento.link_edital || '');
                    setEtapaId(idEtapa);
                    if (evento.area_conhecimento_detalhes) {
                        setAreasSelecionadas(evento.area_conhecimento_detalhes);
                    } else if (evento.area_conhecimento) {
                        // Fallback caso venha apenas IDs: transforma [1, 2] em [{id: 1}, {id: 2}]
                        setAreasSelecionadas(
                            evento.area_conhecimento.map((id) => ({ id })),
                        );
                    }

                    if (evento.modalidades_detalhes) {
                        setModalidadesSelecionadas(evento.modalidades_detalhes);
                    } else if (evento.modalidades) {
                        setModalidadesSelecionadas(
                            evento.modalidades.map((id) => ({ id })),
                        );
                    }

                    if (evento.etapas) {
                        const etapasFormatadas = evento.etapas.map((etapa) => ({
                            ...etapa,
                            data_inicio: formatarDataHoraParaInput(
                                etapa.data_inicio,
                            ),
                            data_fim: formatarDataHoraParaInput(etapa.data_fim),
                        }));
                        setEtapas(etapasFormatadas);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        };
        carregarDados();
    }, [id]);

    const handleSalvar = async () => {
        const errosDetectados = {};
        const datasInvalidas = etapas.some((e) => e.data_inicio > e.data_fim);
        const urlPattern = new RegExp(
            '^(https?:\\/\\/)?' + // protocolo
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domínio
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // ou IP
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // porta e caminho
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$',
            'i', // fragmento
        );

        if (!localId) {
            errosDetectados.local = 'selecione um local.';
        }
        // 3. Checagem campos obrigatórios simples
        if (!nome.trim())
            errosDetectados.nome = 'O nome do evento é obrigatório.';

        if (!descricao.trim())
            errosDetectados.descricao = 'A descrição do evento é obrigatória.';

        if (!tema.trim())
            errosDetectados.tema = 'O tema do evento é um campo obrigatório.';

        if (!setor.trim())
            errosDetectados.setor =
                'É obrigatório definir um setor para o evento.';

        if (carga_horaria <= 0)
            errosDetectados.carga_horaria =
                'A carga horária deve ser maior que 0.';

        if (!linkEdital) {
            errosDetectados.link_edital = 'O link do edital é obrigatório.';
        } else if (!urlPattern.test(linkEdital)) {
            errosDetectados.link_edital =
                'Insira uma URL válida (ex: https://...)';
        }
        // 4. Checagem das listas ManyToMany
        if (
            areasSelecionadas.length === 0 ||
            areasSelecionadas.every((a) => !a.id)
        ) {
            errosDetectados.area_conhecimento =
                'Adicione e selecione ao menos uma área.';
        }

        if (modalidadesSelecionadas.length === 0) {
            errosDetectados.modalidades = 'Selecione ao menos uma modalidade.';
        }

        // 5. Checagem das Etapas
        if (etapas.length === 0) {
            errosDetectados.etapas =
                'O evento precisa de ao menos uma etapa configurada.';
        } else {
            // Verifica se todas as etapas adicionadas têm tipo e datas preenchidas
            const etapaIncompleta = etapas.some(
                (e) => !e.tipo_etapa || !e.data_inicio || !e.data_fim,
            );
            if (etapaIncompleta) {
                errosDetectados.etapas =
                    'Preencha todos os campos (tipo e datas) de todas as etapas adicionadas.';
            }
        }

        if (datasInvalidas) {
            errosDetectados.etapas =
                'A data de início não pode ser posterior à data de término.';
        }

        // 6. Se houver erros, aborta o salvamento
        if (Object.keys(errosDetectados).length > 0) {
            setErrors(errosDetectados);
            // Opcional: scroll até o primeiro erro ou mostrar um alerta
            return;
        }

        setErrors({});
        setExibirSucesso(false);
        setExibirErro(false);

        const areas_conhecimento = areasSelecionadas.map((area) => area.id);
        const modalidades_salvas = modalidadesSelecionadas.map(
            (modalidade) => modalidade.id,
        );
        const etapasValidadas = etapas
            .filter((e) => e.tipo_etapa)
            .map((e) => ({
                tipo_etapa: e.tipo_etapa,
                data_inicio: e.data_inicio,
                data_fim: e.data_fim,
                ativa: true,
            }));

        const dadosEvento = {
            nome,
            descricao,
            status_evento: 'EM_ANDAMENTO',
            carga_horaria: parseInt(carga_horaria),
            setor,
            tema,
            local_id: parseInt(localId),
            area_conhecimento: areas_conhecimento,
            modalidades: modalidades_salvas, // ✅ Usa a variável tratada acima
            etapas: etapasValidadas,
            link_edital: linkEdital,
        };

        try {
            if (id) {
                await atualizarEvento(id, dadosEvento);
            } else {
                await criarEvento(dadosEvento);
            }

            setExibirSucesso(true);
            setTimeout(() => {
                navigate('/listar_eventos');
            }, 2000);
        } catch (erro) {
            if (erro.response && erro.response.data) {
                setErrors(erro.response.data);
                setExibirErro(true);
            } else {
                console.error('Erro desconhecido:', erro);
            }
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="flex-fill">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col md={10}>
                            <CriarEventoCard
                                nome={nome}
                                setNome={setNome}
                                descricao={descricao}
                                setDescricao={setDescricao}
                                setor={setor}
                                setSetor={setSetor}
                                tema={tema}
                                setTema={setTema}
                                carga_horaria={carga_horaria}
                                setCargaHoraria={setCargaHoraria}
                                errors={errors}
                                opcoes={opcoes}
                                exibirSucesso={exibirSucesso}
                                exibirErro={exibirErro}
                                locais={locais}
                                setLocais={setLocais}
                                localId={localId}
                                setLocalId={setLocalId}
                                etapaId={etapaId}
                                areaConhecimentoId={areaConhecimentoId}
                                handleSalvar={handleSalvar}
                                navigate={navigate}
                                id={id}
                                areasSelecionadas={areasSelecionadas}
                                setAreasSelecionadas={setAreasSelecionadas}
                                etapas={etapas}
                                setEtapas={setEtapas}
                                listaAreasDisponiveis={listaAreasDisponiveis}
                                setListaAreasDisponiveis={
                                    setListaAreasDisponiveis
                                }
                                modalidades={modalidades}
                                setModalidades={setModalidades}
                                modalidadesSelecionadas={
                                    modalidadesSelecionadas
                                }
                                setModalidadesSelecionadas={
                                    setModalidadesSelecionadas
                                }
                                linkEdital={linkEdital}
                                setLinkEdital={setLinkEdital}
                                etapasSelecionadas={etapasSelecionadas}
                                setEtapasSelecionadas={setEtapasSelecionadas}
                            />
                        </Col>
                    </Row>
                </Container>
            </main>
            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
