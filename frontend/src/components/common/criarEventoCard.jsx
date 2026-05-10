import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import {
    MdEdit,
    MdAccessTime,
    MdSchool,
    MdAssignment,
    MdAttachFile,
    MdAdd
} from 'react-icons/md';
import { BsTrash } from 'react-icons/bs';

// Componentes e Serviços
import SecaoFormulario from './secaoFormulario';
import Alerta from '../common/Alerta';
import { pegarLocais } from '../../services/localService';
import { pegarAreasConhecimento } from '../../services/areaConhecimentoService';
import { pegarModalidades, pegarOptionsModalidades } from '../../services/modalidadeService'; // ✅ Novo serviço

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
    etapas, setEtapas, 
    areasSelecionadas, setAreasSelecionadas,
    listaAreasDisponiveis,setListaAreasDisponiveis,
    modalidades,setModalidades,
    modalidadesSelecionadas,setModalidadesSelecionadas,
    errors, setErrors,
    opcoes, 
    exibirSucesso, 
    exibirErro,
    navigate, 
    handleSalvar,
    id 
}) {

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const dadosLocais = await pegarLocais();
                const dadosAreas = await pegarAreasConhecimento()
                const dadosModalidades = await pegarModalidades()
                setModalidades(Array.isArray(dadosModalidades ? dadosModalidades : []))
                setLocais(Array.isArray(dadosLocais) ? dadosLocais : []);
                setListaAreasDisponiveis(Array.isArray(dadosAreas) ? dadosAreas : []);
                setModalidades(Array.isArray(dadosModalidades) ? dadosModalidades : [])
            } catch (error) {
                console.error("Erro ao carregar dados do banco:", error);
            }
        };
        carregarDados();
    }, []);
     //


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

    // ✅ Lógica das Áreas de Conhecimento
    const adicionarArea = () => {
        setAreasSelecionadas([...areasSelecionadas, { area_id: '' }]);
    };

    const atualizarArea = (index, valor) => {
        const novas = [...areasSelecionadas];
        novas[index].area_id = valor;
        setAreasSelecionadas(novas);
    };

    const removerArea = (index) => {
        setAreasSelecionadas(areasSelecionadas.filter((_, i) => i !== index));
    };

    const adicionarModalidade = () => {
        setModalidadesSelecionadas([...modalidadesSelecionadas, { id: '' }]);
    };

    const atualizarModalidade = (index, valor) => {
        const novas = [...modalidadesSelecionadas];
        novas[index].id = valor;
        setModalidadesSelecionadas(novas);
    };

    const removerModalidade = (index) => {
        setModalidadesSelecionadas(modalidadesSelecionadas.filter((_, i) => i !== index));
    };

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

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Local</Form.Label>
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
                                    <Form.Control.Feedback type="invalid">{errors?.local}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </SecaoFormulario>

                    {/* SEÇÃO 2: CONTROLE DE PRAZOS */}
                    <SecaoFormulario icone={MdAccessTime} titulo="Controle de Prazos (Fases)">
                        <div className="alert alert-info py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                            Selecione as etapas vinculadas a este evento.
                        </div>
                        {etapas?.map((etapa, index) => (
                            <div key={`etapa-${index}`} className="p-3 border rounded mb-3 bg-white shadow-sm">
                                <Row className="align-items-center g-2">
                                    <Col md={4}>
                                        <Form.Select 
                                            value={etapa.tipo_etapa} 
                                            onChange={(e) => atualizarEtapa(index, 'tipo_etapa', e.target.value)}
                                        >
                                            <option value="">Selecione a etapa</option>
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
                                    <Col md={2} className="text-end">
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
                            Selecione as áreas vinculadas a este evento.
                        </div>

                        {areasSelecionadas?.map((item, index) => {
                            return (
                                <div key={`area-row-${index}`} className="p-3 border rounded mb-3 bg-white shadow-sm">
                                    <Row className="align-items-center g-2">
                                        <Col md={10}>
                                            <Form.Select 
                                                value={item.area_id || ""} 
                                                onChange={(e) => {
                                                    if (typeof atualizarArea === 'function') {
                                                        atualizarArea(index, e.target.value);
                                                    }
                                                }}
                                                isInvalid={!!errors?.area_conhecimento}
                                            >
                                                <option value="">Selecione uma área...</option>
                                                {/* ✅ Mapeamento corrigido para usar 'value' e 'label' do seu Banco de Dados */}
                                                {listaAreasDisponiveis?.map((opt) => (
                                                    <option key={`area-opt-${opt.value}`} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={2} className="text-end">
                                            <Button 
                                                variant="link" 
                                                className="text-danger" 
                                                onClick={() => {
                                                    if (typeof removerArea === 'function') {
                                                        removerArea(index);
                                                    }
                                                }}
                                            >
                                                <BsTrash size={20} />
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            );
                        })}

                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={adicionarArea} 
                            className="d-flex align-items-center gap-1 shadow-sm"
                        >
                            <MdAdd /> Adicionar Área
                        </Button>
                    </SecaoFormulario>

                                     {/* SEÇÃO 4: AVALIAÇÕES E TRABALHOS */}
                    <SecaoFormulario icone={MdAssignment} titulo="Modalidades do Evento">
                        <div className="alert alert-info py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                            Selecione as modalidades vinculadas a este evento.
                        </div>

                        {modalidadesSelecionadas?.map((item, index) => {
                            return (
                                <div key={`area-row-${index}`} className="p-3 border rounded mb-3 bg-white shadow-sm">
                                    <Row className="align-items-center g-2">
                                        <Col md={10}>
                                            <Form.Select 
                                                value={item.id || ""} 
                                                onChange={(e) => {
                                                    if (typeof atualizarModalidade === 'function') {
                                                        atualizarModalidade(index, e.target.value);
                                                    }
                                                }}
                                                
                                            >
                                                <option value="">Selecione uma modalidade...</option>
                                                {/* ✅ Mapeamento corrigido para usar 'value' e 'label' do seu Banco de Dados */}
                                                {modalidades?.map((opt) => (
                                                    <option key={`area-opt-${opt.id}`} value={opt.id}>
                                                        {opt.nome}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={2} className="text-end">
                                            <Button 
                                                variant="link" 
                                                className="text-danger" 
                                                onClick={() => {
                                                    if (typeof removerModalidade === 'function') {
                                                        removerModalidade(index);
                                                    }
                                                }}
                                            >
                                                <BsTrash size={20} />
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            );
                        })}

                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={adicionarModalidade} 
                            className="d-flex align-items-center gap-1 shadow-sm"
                        >
                            <MdAdd /> Adicionar Modalidade
                        </Button>
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
                        <Button variant="outline-secondary" className="px-4 border-0" onClick={() => navigate("/listar_eventos")}>
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