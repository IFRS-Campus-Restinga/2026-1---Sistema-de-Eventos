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
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            }
        };
        carregarDados();
    }, [id]);

    const handleSalvar = async () => {
        if(!localId){
        setErrors({ local: ["O local é obrigatório."] });
        setExibirErro(true);
        return;
        }

        setErrors({});
        setExibirSucesso(false);
        setExibirErro(false)
        const local = parseInt(localId)
        const dadosEvento = {
            nome,
            descricao,
            status_evento: status,
            carga_horaria,
            setor,
            tema,
            local_id: localId
        };

        try {
            if (id) {
                await atualizarEvento(id, dadosEvento);
            } else {
                await criarEvento(dadosEvento);
            }

            setExibirSucesso(true);
            setTimeout(() => {
                navigate('/ListarEventos');
            }, 3000);

        } catch (erro) {
            if (erro.response && erro.response.data) {
                setErrors(erro.response.data);
                setExibirErro(true)
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
                                handleSalvar={handleSalvar}
                                navigate={navigate}
                                id={id}
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