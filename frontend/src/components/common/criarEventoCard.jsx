import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import {
    MdEdit,
    MdAccessTime,
    MdSchool,
    MdAssignment,
    MdAttachFile,
    MdAdd,
    MdBook
} from 'react-icons/md';
import { BsTrash } from 'react-icons/bs';

// Componentes e Serviços
import SecaoFormulario from './secaoFormulario';
import Alerta from '../common/Alerta';
import { pegarLocais } from '../../services/localService';
import { pegarAreasConhecimento } from '../../services/areaConhecimentoService'; // ✅ Novo serviço

export default function AdicionarEvento({
    nome, setNome,
    descricao, setDescricao,
    tema, setTema,
    status, setStatus,
    setor, setSetor,
    carga_horaria, setCargaHoraria,
    locais, setLocais,
    localId, setLocalId,
    areaConhecimentoId,
    etapaId,
    // ✅ Novas props para as relações N:N e 1:N
    etapas, setEtapas, 
    areasSelecionadas, setAreasSelecionadas,
    listaAreasDisponiveis,setListaAreasDisponiveis,
    errors, setErrors,
    opcoes, 
    exibirSucesso, 
    exibirErro,
    navigate, 
    handleSalvar,
    id 
}) {
    

    // ✅ Carregamento de dados (Locais e Áreas)
    useEffect(() => {
        const carregarDados = async () => {
            try {
                // Você importou, mas precisa GARANTIR que a função é executada aqui
                const dadosLocais = await pegarLocais();
                const dadosAreas = await pegarAreasConhecimento()
                setLocais(Array.isArray(dadosLocais) ? dadosLocais : []);
                setListaAreasDisponiveis(Array.isArray(dadosAreas) ? dadosAreas : []);
                console.log(listaAreasDisponiveis) // ✅ Preenche o estado
            } catch (error) {
                console.error("Erro ao carregar dados do banco:", error);
            }
        };
        carregarDados();
    }, []);
     // Remova setLocais daqui e deixe o array vazio [] se quiser carregar apenas no mount

    // ✅ Lógica das Fases (Etapas)
    const adicionarEtapa = () => {
        setEtapas([...etapas, { tipo_etapa: '', data_inicio: '', data_fim: '', ativa: true }]);
    };

    const atualizarEtapa = (index, campo, valor) => {
        const novas = [...etapas];
        novas[index][campo] = valor;
        setEtapas(novas);
    };

    const removerEtapa = (index) => {
        setEtapas(etapas.filter((_, i) => i !== index));
    };

   const adicionarArea = () => {
    // Adiciona um objeto com a chave que guardará o valor do select
    setAreasSelecionadas([...areasSelecionadas, { area_id: '' }]);
    };

    const atualizarArea = (index, valor) => {
        const novas = [...areasSelecionadas];
        novas[index].area_id = valor; // O valor aqui será o ID vindo do select
        setAreasSelecionadas(novas);
    };

    const removerArea = (index) => {
        setAreasSelecionadas(areasSelecionadas.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-light min-vh-100">
            <Container className="py-5">
                <Form>
                    {/* SEÇÃO 1: DADOS BÁSICOS (Mantendo setor, descrição e carga horária) */}
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

                    {/* SEÇÃO 2: CONTROLE DE PRAZOS (Novo campo dinâmico) */}
                    <SecaoFormulario icone={MdAccessTime} titulo="Controle de Prazos (Fases)">
                        <div className="alert alert-info py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                            Selecione as etapas vinculadas a este evento.
                        </div>
                        {etapas?.map((etapa, index) => (
                            <div key={index} className="p-3 border rounded mb-3 bg-white shadow-sm">
                                <Row className="align-items-center g-2">
                                    <Col md={4}>
                                        <Form.Select 
                                            value={etapa.tipo_etapa} 
                                            onChange={(e) => atualizarEtapa(index, 'tipo_etapa', e.target.value)}
                                        >
                                            <option value="">Selecione o setor</option>
                                            {opcoes?.tipo_etapa?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={6} className="d-flex align-items-center gap-2">
                                        <Form.Control 
                                            type="date" 
                                            value={etapa.data_inicio} 
                                            onChange={(e) => atualizarEtapa(index, 'data_inicio', e.target.value)} 
                                        />
                                        <span>até</span>
                                        <Form.Control 
                                            type="date" 
                                            value={etapa.data_fim} 
                                            onChange={(e) => atualizarEtapa(index, 'data_fim', e.target.value)} 
                                        />
                                    </Col>
                                    <Col md={1} className="text-end">
                                        <Button variant="link" className="text-danger" onClick={() => removerEtapa(index)}>
                                            <BsTrash size={20} />
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                        <Button variant="primary" size="sm" onClick={adicionarEtapa} className="d-flex align-items-center gap-1 shadow-sm">
                            <MdAdd /> Adicionar Fase
                        </Button>
                    </SecaoFormulario>
                                                            {/* SEÇÃO 3: ÁREAS DE CONHECIMENTO */}
                    <SecaoFormulario icone={MdSchool} titulo="Áreas de Conhecimento">
                        <div className="alert alert-info py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                            Selecione as áreas vinculadas a este evento (Versão Estática).
                        </div>

                        {areasSelecionadas?.map((item, index) => (
                            <div key={`area-row-${index}`} className="p-3 border rounded mb-3 bg-white shadow-sm">
                                <Row className="align-items-center g-2">
                                    <Col md={10}>
                                        <Form.Select 
                                            value={item.area_id || ""} 
                                            onChange={(e) => atualizarArea(index, e.target.value)}
                                            isInvalid={!!errors?.area_conhecimento}
                                        >
                                            <option value="">Selecione uma área...</option>
                                            {/* 
                                                Aqui voltamos a usar 'opcoes.areas_conhecimento' 
                                                em vez de buscar do banco de dados.
                                            */}
                                            {opcoes?.areas_conhecimento?.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={2} className="text-end">
                                        <Button 
                                            variant="link" 
                                            className="text-danger" 
                                            onClick={() => removerArea(index)}
                                            title="Remover Área"
                                        >
                                            <BsTrash size={20} />
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={adicionarArea} 
                            className="d-flex align-items-center gap-1 shadow-sm"
                        >
                            <MdAdd /> Adicionar Área
                        </Button>
                    </SecaoFormulario>
                    {/* SEÇÃO 4: AVALIAÇÕES E TRABALHOS (Mantendo o original) */}
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
                            </tbody>
                        </Table>
                        <div className="d-flex gap-2 mt-3">
                            <Form.Control placeholder="Nome do novo trabalho" style={{ backgroundColor: '#eeeeee' }} />
                            <Button variant="success" className="shadow-sm">Adicionar</Button>
                        </div>
                    </SecaoFormulario>

                    {/* SEÇÃO 5: ANEXOS */}
                    <SecaoFormulario icone={MdAttachFile} titulo="Anexos e Finalização">
                        <div className="alert alert-info py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                            Selecione os arquivos vinculados a este evento.
                        </div>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>Adicionar Arquivo</Form.Label>
                            <div className="p-3 border rounded bg-white d-flex align-items-center gap-3">
                                <Form.Control type="file" className="w-auto" />
                                <span className="text-muted small">Nenhum arquivo escolhido</span>
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
                            {id ? "Salvar Alterações" : "Criar Evento"}
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