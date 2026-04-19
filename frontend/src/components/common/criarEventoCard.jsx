import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import {
    MdEdit,
    MdAccessTime,
    MdSchool,
    MdAssignment,
    MdAttachFile,
} from 'react-icons/md';
import { BsTrash } from 'react-icons/bs';

// Componentes e Serviços
import SecaoFormulario from './secaoFormulario';
import Alerta from '../common/Alerta';
import { pegarLocais } from '../../services/localService';

export default function AdicionarEvento({
    nome, setNome,
    descricao, setDescricao,
    tema, setTema,
    status, setStatus,
    setor, setSetor,
    carga_horaria, setCargaHoraria,
    locais,setLocais,
    localId, setLocalId,        // ✅ Adicionado nas props
    errors, setErrors,
    opcoes, 
    exibirSucesso, 
    exibirErro,
    navigate, 
    handleSalvar,
    id 
}) {
    

    // ✅ Hook para carregar locais do banco de dados
    useEffect(() => {
        const carregarDados = async () => {
            try {
                const dadosLocais = await pegarLocais();
                setLocais(Array.isArray(dadosLocais) ? dadosLocais : []);
            } catch (error) {
                console.error("Erro ao carregar locais:", error);
            }
        };
        carregarDados();
    }, []);

    return (
        <div className="bg-light min-vh-100">
            <Container className="py-5">
                <Form>
                    {/* SEÇÃO 1: DADOS BÁSICOS */}
                    <SecaoFormulario
                        icone={MdEdit}
                        titulo={id ? "Editar Evento" : "Dados Básicos do Evento"}
                    >
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Nome do Evento</Form.Label>
                                    <Form.Control
                                        placeholder="Escreva o nome do evento"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        isInvalid={!!errors?.nome}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors?.nome}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Tema Principal</Form.Label>
                                    <Form.Control
                                        placeholder="Informe o tema"
                                        value={tema}
                                        onChange={(e) => setTema(e.target.value)}
                                        isInvalid={!!errors?.tema}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors?.tema}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Setor Responsável</Form.Label>
                                    <Form.Select
                                        value={setor}
                                        onChange={(e) => setSetor(e.target.value)}
                                        isInvalid={!!errors?.setor}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    >
                                        <option value="">Selecione o setor</option>
                                        {opcoes?.setores?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors?.setor}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Carga Horária (horas)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={carga_horaria}
                                        onChange={(e) => setCargaHoraria(e.target.value)}
                                        isInvalid={!!errors?.carga_horaria}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors?.carga_horaria}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Descrição</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        isInvalid={!!errors?.descricao}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors?.descricao}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            {/* ✅ CAMPO LOCAL INTEGRADO CONFORME O DESIGN ANTERIOR */}
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Local</Form.Label>
                                    <div className="d-flex gap-2">
                                        <Form.Select
                                            value={localId || ""}
                                            onChange={(e) => setLocalId(e.target.value)}
                                            isInvalid={!!errors?.local}
                                            style={{ backgroundColor: '#eeeeee' }}
                                        >
                                            <option value="">Selecione um local</option>
                                            {locais.map((l) => (
                                                <option key={l.id} value={l.id}>{l.nome}</option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                    <Form.Control.Feedback type="invalid">{errors?.local}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </SecaoFormulario>

                    {/* SEÇÃO 2: CONTROLE DE PRAZOS (FASES) */}
                    <SecaoFormulario icone={MdAccessTime} titulo="Controle de Prazos (Fases)">
                        <div className="p-3 border rounded mb-3 bg-white shadow-sm">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <Form.Check type="switch" label="Fase de Submissão" className="fw-bold" defaultChecked />
                                    <small className="text-muted">Permite que autores enviem novos trabalhos.</small>
                                </Col>
                                <Col md={6} className="d-flex align-items-center gap-2">
                                    <Form.Control type="date" /> <span>até</span> <Form.Control type="date" />
                                </Col>
                            </Row>
                        </div>
                        <Button variant="primary" size="sm" className="shadow-sm">+ Adicionar Fase</Button>
                    </SecaoFormulario>

                    {/* SEÇÃO 3: ÁREAS DE CONHECIMENTO */}
                    <SecaoFormulario icone={MdSchool} titulo="Áreas de Conhecimento">
                        <div className="alert alert-info py-2" style={{ fontSize: '0.9rem' }}>
                            Usado para classificar trabalhos e filtrar avaliadores.
                        </div>
                        <Table hover borderless>
                            <tbody style={{ backgroundColor: '#eeeeee' }}>
                                <tr>
                                    <td className="ps-3">1. Ciências Exatas e da Terra</td>
                                    <td className="text-end pe-3">
                                        <Button variant="link" className="text-dark p-1"><MdEdit size={20} /></Button>
                                        <Button variant="link" className="text-danger p-1"><BsTrash size={20} /></Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <div className="d-flex gap-2">
                            <Form.Control placeholder="Nome da área" style={{ backgroundColor: '#eeeeee' }} />
                            <Button variant="success" className="shadow-sm">Adicionar</Button>
                        </div>
                    </SecaoFormulario>

                    {/* SEÇÃO 4: AVALIAÇÕES E TRABALHOS */}
                    <SecaoFormulario icone={MdAssignment} titulo="Avaliações e Trabalhos">
                        <div className="alert alert-info py-2" style={{ fontSize: '0.9rem' }}>
                            Adicione tipos de trabalhos e validações para homologação.
                        </div>
                        <Table hover borderless>
                            <tbody style={{ backgroundColor: '#eeeeee' }}>
                                <tr className="border-bottom">
                                    <td className="ps-3 py-2">1. Apresentação Oral</td>
                                    <td className="text-end pe-3">
                                        <Button variant="link" className="text-dark p-1"><MdEdit size={20} /></Button>
                                        <Button variant="link" className="text-danger p-1"><BsTrash size={20} /></Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-3 py-2">2. Oficina</td>
                                    <td className="text-end pe-3">
                                        <Button variant="link" className="text-dark p-1"><MdEdit size={20} /></Button>
                                        <Button variant="link" className="text-danger p-1"><BsTrash size={20} /></Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <div className="d-flex gap-2 mt-3">
                            <Form.Control placeholder="Nome do novo trabalho" style={{ backgroundColor: '#eeeeee' }} />
                            <Button variant="success" className="shadow-sm">Adicionar</Button>
                        </div>
                    </SecaoFormulario>

                    {/* SEÇÃO 5: ANEXOS */}
                    <SecaoFormulario icone={MdAttachFile} titulo="Anexos e Finalização">
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>Adicionar Arquivo</Form.Label>
                            <div className="p-2" style={{ backgroundColor: '#eeeeee', borderRadius: '8px' }}>
                                <Form.Control type="file" className="bg-transparent border-0" />
                            </div>
                        </Form.Group>
                    </SecaoFormulario>

                    {/* BOTÕES DE FINALIZAÇÃO */}
                    <div className="d-flex justify-content-end gap-3 mt-5 mb-5">
                        <Button variant="outline-secondary" className="px-4 border-0" onClick={() => navigate("/ListarEventos")}>
                            Voltar
                        </Button>
                        <Button 
                            variant={id ? "warning" : "success"} 
                            className="px-5 shadow-sm fw-bold"
                            onClick={handleSalvar}
                            style={!id ? { backgroundColor: '#00A44B', border: 'none' } : {}}
                        >
                            {id ? "Salvar Alterações" : "Cadastrar Evento"}
                        </Button>
                    </div>
                </Form>
            </Container>
            
            {/* ALERTAS */}
            {exibirSucesso && (
                <Alerta 
                    mensagem={id ? "Alterações salvas com sucesso!" : "Evento cadastrado com sucesso!"} 
                    variacao="success" 
                    duracao={5000} 
                />
            )}

            {exibirErro && (
                <Alerta 
                    mensagem={id ? "Erro ao salvar alterações!" : "Erro ao cadastrar evento!"} 
                    variacao="danger" 
                    duracao={5000} 
                />
            )}
        </div>
    );
}