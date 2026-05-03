import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CriarEventoCard from '../components/common/criarEventoCard';
import { useParams, useNavigate } from 'react-router-dom';
import { criarEvento, buscarOpcoesFormulario, atualizarEvento, buscarEventoPorId } from '../services/eventoService';
import { useState, useEffect } from 'react';

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
    const [localId, setLocalId] = useState('')
    const [exibirSucesso, setExibirSucesso] = useState(false);
    const [exibirErro,setExibirErro]= useState(false)
    const [etapas,setEtapas] = useState([])
    const [areasSelecionadas,setAreasSelecionadas] = useState([])
    const [listaAreasDisponiveis, setListaAreasDisponiveis] = useState([]);
    const [etapaId,setEtapaId] = useState('')
    const [areaConhecimentoId,setAreaConhecimentoId] = useState('')

    
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
                    const idEtapa = evento.etapas?.id || evento.etapas
                    setEtapaId(idEtapa)
                    const idAreaConhecimento = evento.area_conhecimento?.id || evento.area_conhecimento
                    setAreaConhecimentoId(idAreaConhecimento)
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            }
        };
        carregarDados();
    }, [id]);

   const handleSalvar = async () => {
        if (!localId) {
            setErrors({ local: ["O local é obrigatório."] });
            setExibirErro(true);
            return;
        }

        setErrors({});
        setExibirSucesso(false);
        setExibirErro(false);

        // ✅ 1. Preparar IDs das áreas (Array de números)
        const area_conhecimento = areasSelecionadas
        .map(a => {
            const valorString = a.area_id; // Ex: "EXATAS_TERRA"
            
            // Procura na lista que veio do banco o objeto que tem essa string
            const areaEncontrada = listaAreasDisponiveis.find(
                areaBanco => areaBanco.area_conhecimento === valorString
            );

            // Retorna o ID numérico (ex: 1) ou o próprio valor se já for número
            return areaEncontrada ? areaEncontrada.id : parseInt(valorString);
        })
        .filter(id => !isNaN(id));
        
        const etapasValidadas = etapas
            .filter(e => e.tipo_etapa)
            .map(e => ({
                tipo_etapa: e.tipo_etapa,
                data_inicio: e.data_inicio,
                data_fim: e.data_fim,
                ativa: true
            }));

        const dadosEvento = {
            nome,
            descricao,
            status_evento: 'EM_ANDAMENTO',
            carga_horaria: parseInt(carga_horaria),
            setor,
            tema,
            local_id: parseInt(localId),
            area_conhecimento: area_conhecimento, // ✅ Usa a variável tratada acima
            etapas: etapasValidadas
        };

        console.log("Dados enviados:", dadosEvento);

        try {
            if (id) {
                await atualizarEvento(id, dadosEvento);
            } else {
                await criarEvento(dadosEvento);
            }

            setExibirSucesso(true);
            setTimeout(() => {
                navigate('/ListarEventos');
            }, 2000);

        } catch (erro) {
            if (erro.response && erro.response.data) {
                setErrors(erro.response.data);
                setExibirErro(true);
            } else {
                console.error("Erro desconhecido:", erro);
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
                                setListaAreasDisponiveis={setListaAreasDisponiveis}
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