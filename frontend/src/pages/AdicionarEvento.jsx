import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import CriarEventoCard from '../components/common/criarEventoCard';
import Button from 'react-bootstrap/esm/Button';
import {criarEvento} from '../services/eventoService';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


export default function CriarEvento(){
    const [nome, setNome] = useState("")
    const [descricao, setDescricao] = useState("")
    const [status, setStatus] = useState("")
    const [carga_horaria,setCargaHoraria] = useState(0)
    const [setor, setSetor] = useState("")
    const [tema, setTema] = useState("")

    const handleSalvar = async () =>{
        if(!nome || !descricao || !status || !carga_horaria || !setor || !tema){
            alert("Por favor, preenche todos os campos")
            return
        }

        try{
            const novoEvento = {nome,descricao, status,carga_horaria,setor,tema}
            await criarEvento(novoEvento)
            alert('Local criado com sucesso!');
            navigate('/#');
            setNome("")
            setDescricao("")
            setCargaHoraria("")
            setStatus("")
            setTema("")
            setSetor("")
        }catch (erro) {
            console.error('Erro ao criar Evento:', erro);
            alert('Erro ao criar evento. Por favor, tente novamente.');
        }
    }

    return (
        <>
           <NavBar />
           <main className="flex-fill">
                <Container className="mx-auto">
                    <Row className="mx-auto my-5 d-flex justify-content-center">
                        <Col className="">
                        {<CriarEventoCard
                            nome={nome}
                            setNome={setNome}
                            descricao={descricao}
                            setDescricao={setDescricao}
                            />}
                        
                        </Col>
                    </Row>
                </Container>
            
            </main>    
        </>
    );
}