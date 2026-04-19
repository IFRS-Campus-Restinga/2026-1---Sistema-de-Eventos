import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import {
    MdEdit,
    MdAccessTime,
    MdSchool,
    MdAssignment,
    MdAttachFile,
} from 'react-icons/md';
import SecaoFormulario from './secaoFormulario';
import { BsTrash } from 'react-icons/bs';
import Alerta from '../common/Alerta';
import { useArquivo } from '../../hooks/useArquivo';
import { useCsrf } from '../../hooks/useCsrf';

export default function AdicionarEvento({
    nome,
    setNome,
    descricao,
    setDescricao,
    tema,
    setTema,
    status,
    setStatus,
    setor,
    setSetor,
    carga_horaria,
    setCargaHoraria,
    errors = {},
    setErrors,
    opcoes,
    exibirSucesso,
    navigate,
    handleSalvar,
    id, // para edição
}) {
    const {
        arquivos = [],
        carregando: carregandoArquivo,
        uploadArquivo,
        removerArquivo,
        limparArquivos,
    } = useArquivo();
    const { csrfToken } = useCsrf();

    const handleArquivoSelecionado = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            try {
                await uploadArquivo(file, csrfToken);
            } catch (error) {
                // Para simplicidade, usamos alert; em produção, mostrar erro na UI
                alert('Erro ao enviar arquivo: ' + (error?.message || error));
            }
        }
    };

    return (
        <div>
            <Container className="py-5">
                <Form>
                    {/* SEÇÃO 1: DADOS BÁSICOS */}
                    <SecaoFormulario
                        icone={MdEdit}
                        titulo={
                            id ? 'Editar Evento' : 'Dados Básicos do Evento'
                        }
                    >
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Nome do Evento
                                    </Form.Label>
                                    <Form.Control
                                        placeholder="Escreva o nome do evento"
                                        value={nome}
                                        onChange={(e) =>
                                            setNome(e.target.value)
                                        }
                                        isInvalid={!!errors?.nome}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors?.nome}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Tema Principal
                                    </Form.Label>
                                    <Form.Control
                                        placeholder="Informe o tema"
                                        value={tema}
                                        onChange={(e) =>
                                            setTema(e.target.value)
                                        }
                                        isInvalid={!!errors?.tema}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors?.tema}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Setor Responsável
                                    </Form.Label>
                                    <Form.Select
                                        value={setor}
                                        onChange={(e) =>
                                            setSetor(e.target.value)
                                        }
                                        isInvalid={!!errors?.setor}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    >
                                        <option value="">
                                            Selecione o setor
                                        </option>
                                        {opcoes?.setores?.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors?.setor}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Carga Horária (horas)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={carga_horaria}
                                        onChange={(e) =>
                                            setCargaHoraria(e.target.value)
                                        }
                                        isInvalid={!!errors?.carga_horaria}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors?.carga_horaria}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Descrição
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={descricao}
                                        onChange={(e) =>
                                            setDescricao(e.target.value)
                                        }
                                        isInvalid={!!errors?.descricao}
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors?.descricao}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </SecaoFormulario>

                    {/* SEÇÃO 2: CONTROLE DE PRAZOS (FASES) */}
                    <SecaoFormulario
                        icone={MdAccessTime}
                        titulo="Controle de Prazos (Fases)"
                    >
                        <div className="p-3 border rounded mb-3">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <Form.Check
                                        type="switch"
                                        label="Fase de Submissão"
                                        className="fw-bold"
                                        defaultChecked
                                    />
                                    <small className="text-muted">
                                        Permite que autores enviem novos
                                        trabalhos.
                                    </small>
                                </Col>
                                <Col
                                    md={6}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Form.Control type="date" />{' '}
                                    <span>até</span>{' '}
                                    <Form.Control type="date" />
                                </Col>
                            </Row>
                        </div>
                        <Button variant="primary" size="sm">
                            + Adicionar Fase
                        </Button>
                    </SecaoFormulario>

                    {/* SEÇÃO 3: ÁREAS DE CONHECIMENTO */}
                    <SecaoFormulario
                        icone={MdSchool}
                        titulo="Áreas de Conhecimento"
                    >
                        <div
                            className="alert alert-info py-2"
                            style={{ fontSize: '0.9rem' }}
                        >
                            Usado para classificar trabalhos e filtrar
                            avaliadores.
                        </div>
                        <Table hover borderless>
                            <tbody style={{ backgroundColor: '#eeeeee' }}>
                                <tr>
                                    <td className="ps-3">
                                        1. Ciências Exatas e da Terra
                                    </td>
                                    <td className="text-end pe-3">
                                        <Button
                                            variant="link"
                                            className="text-dark p-1"
                                        >
                                            <MdEdit size={20} />
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-danger p-1"
                                        >
                                            <BsTrash size={20} />
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <div className="d-flex gap-2">
                            <Form.Control
                                placeholder="Nome da área"
                                style={{ backgroundColor: '#eeeeee' }}
                            />
                            <Button variant="success">Adicionar</Button>
                        </div>
                    </SecaoFormulario>

                    {/* SEÇÃO 4: AVALIAÇÕES E TRABALHOS */}
                    <SecaoFormulario
                        icone={MdAssignment}
                        titulo="Avaliações e Trabalhos"
                    >
                        <div
                            className="alert alert-info py-2"
                            style={{ fontSize: '0.9rem' }}
                        >
                            Adicione tipos de trabalhos e validações para
                            homologação.
                        </div>
                        <Table hover borderless>
                            <tbody style={{ backgroundColor: '#eeeeee' }}>
                                <tr className="border-bottom">
                                    <td className="ps-3 py-2">
                                        1. Apresentação Oral
                                    </td>
                                    <td className="text-end pe-3">
                                        <Button
                                            variant="link"
                                            className="text-dark p-1"
                                        >
                                            <MdEdit size={20} />
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-danger p-1"
                                        >
                                            <BsTrash size={20} />
                                        </Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ps-3 py-2">2. Oficina</td>
                                    <td className="text-end pe-3">
                                        <Button
                                            variant="link"
                                            className="text-dark p-1"
                                        >
                                            <MdEdit size={20} />
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-danger p-1"
                                        >
                                            <BsTrash size={20} />
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <div className="d-flex gap-2 mt-3">
                            <Form.Control
                                placeholder="Nome do novo trabalho"
                                style={{ backgroundColor: '#eeeeee' }}
                            />
                            <Button variant="success">Adicionar</Button>
                        </div>
                    </SecaoFormulario>

                    {/* SEÇÃO 5: ANEXOS */}
                    <SecaoFormulario
                        icone={MdAttachFile}
                        titulo="Anexos e Finalização"
                    >
                        <Form.Group className="mb-4">
                            <Form.Label
                                className="fw-bold"
                                style={{ color: '#00A44B' }}
                            >
                                Adicionar Arquivo
                            </Form.Label>
                            <div
                                className="p-2"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            >
                                <Form.Control
                                    type="file"
                                    className="bg-transparent border-0"
                                    onChange={handleArquivoSelecionado}
                                    disabled={carregandoArquivo}
                                />
                            </div>
                            {carregandoArquivo && (
                                <small className="text-muted">
                                    Enviando arquivo...
                                </small>
                            )}
                        </Form.Group>

                        {arquivos.length > 0 && (
                            <div className="mb-4">
                                <h6
                                    className="fw-bold"
                                    style={{ color: '#00A44B' }}
                                >
                                    Arquivos Anexados:
                                </h6>
                                <div className="list-group">
                                    {arquivos.map((arquivo, index) => (
                                        <div
                                            key={arquivo.id || index}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <strong>
                                                    {arquivo.nome_arquivo ||
                                                        arquivo.name ||
                                                        arquivo.filename}
                                                </strong>
                                                {arquivo.arquivo && (
                                                    <small className="text-muted ms-2">
                                                        (
                                                        {arquivo.arquivo
                                                            .split('/')
                                                            .pop()}
                                                        )
                                                    </small>
                                                )}
                                            </div>
                                            <Button
                                                variant="link"
                                                className="text-danger p-0"
                                                onClick={() =>
                                                    removerArquivo(index)
                                                }
                                            >
                                                <BsTrash size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SecaoFormulario>

                    {/* BOTÕES DE FINALIZAÇÃO */}
                    <div className="d-flex justify-content-end gap-3 mt-5 mb-5">
                        <Button
                            variant="outline-secondary"
                            className="px-4"
                            onClick={() => navigate?.('/ListarEventos')}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant={id ? 'warning' : 'success'}
                            className="px-5 shadow-sm"
                            onClick={handleSalvar}
                        >
                            {id ? 'Salvar Alterações' : 'Cadastrar Evento'}
                        </Button>
                    </div>
                </Form>
            </Container>

            {exibirSucesso && (
                <Alerta
                    mensagem={
                        id
                            ? 'Alterações salvas com sucesso!'
                            : 'Evento cadastrado com sucesso!'
                    }
                    variacao="success"
                    duracao={5000}
                />
            )}
        </div>
    );
}
