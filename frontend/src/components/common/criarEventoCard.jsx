import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import {
    MdEdit,
    MdEvent,
    MdAccessTime,
    MdSchool,
    MdAssignment,
    MdAttachFile,
} from 'react-icons/md';
import SecaoFormulario from './secaoFormulario';
import { BsTrash } from 'react-icons/bs';
import eArray from '../../utils/eArray';

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
    opcoes,
    handleSalvar,
}) {
    return (
        <div>
            {/* Navbar fictícia do IFRS aqui */}

            <Container className="py-5">
                <Form>
                    {/* SEÇÃO 1: DADOS BÁSICOS */}
                    <SecaoFormulario
                        icone={MdEdit}
                        titulo="Dados Básicos do Evento"
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
                                        onChange={(nome) => {
                                            setNome(nome.target.value);
                                        }}
                                        type="text"
                                        style={{ backgroundColor: '#eeeeee' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Tema Principal
                                    </Form.Label>
                                    <Form.Control
                                        placeholder="informe o tema do evento"
                                        type="text"
                                        style={{ backgroundColor: '#eeeeee' }}
                                        value={tema}
                                        onChange={(tema) => {
                                            setTema(tema.target.value);
                                        }}
                                    />
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
                                        style={{
                                            backgroundColor: '#eeeeee',
                                            border: 'none',
                                        }}
                                    >
                                        <option value="">
                                            Selecione o setor
                                        </option>
                                        {/* Mapeia a lista de setores */}
                                        {eArray(opcoes) &&
                                            opcoes.setores.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Descrição
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="deescreva aqui o evento"
                                        value={descricao}
                                        onChange={(e) =>
                                            setDescricao(e.target.value)
                                        }
                                        style={{
                                            backgroundColor: '#eeeeee',
                                            border: 'none',
                                            padding: '10px',
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <br />

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Status do Evento
                                    </Form.Label>
                                    <Form.Select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        style={{
                                            backgroundColor: '#eeeeee',
                                            border: 'none',
                                        }}
                                    >
                                        <option value="">
                                            Selecione o status
                                        </option>
                                        {/* Mapeia a lista de status */}
                                        {eArray(opcoes) &&
                                            opcoes.status.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Carga Horária (horas)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Ex: 40"
                                        min={1}
                                        max={300}
                                        value={carga_horaria}
                                        onChange={(e) =>
                                            setCargaHoraria(e.target.value)
                                        }
                                        style={{
                                            backgroundColor: '#eeeeee',
                                            border: 'none',
                                            padding: '10px',
                                        }}
                                    />
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

                    {/* SEÇÃO 3: ÁREAS DE CONHECIMENTO (ESTILO TABELA) */}
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
                                            className="text-dark"
                                        >
                                            <MdEdit size={20} />
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="btn btn-link text-danger"
                                        >
                                            <BsTrash size={20} />
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <div className="d-flex gap-2">
                            <Form.Control placeholder="Nome" />
                            <input
                                type="button"
                                value="Adicionar"
                                className="btn btn-success"
                            />
                        </div>
                    </SecaoFormulario>

                    {/* SEÇÃO: AVALIAÇÕES E TRABALHOS */}
                    <SecaoFormulario
                        icone={MdAssignment}
                        titulo="Avaliações e Trabalhos"
                    >
                        <div
                            className="alert alert-info py-2"
                            style={{ fontSize: '0.9rem' }}
                        >
                            <small>
                                Usado para adicionar um tipo de trabalho e
                                adicionar validações para sua homologação.
                            </small>
                        </div>

                        <Table hover borderless>
                            <tbody>
                                {/* Exemplo de item na lista */}
                                <tr style={{ backgroundColor: '#eeeeee' }}>
                                    <td
                                        className="ps-3 align-middle"
                                        style={{ borderRadius: '8px 0 0 8px' }}
                                    >
                                        1. Apresentação Oral
                                    </td>
                                    <td
                                        className="text-end pe-3"
                                        style={{ borderRadius: '0 8px 8px 0' }}
                                    >
                                        <Button
                                            variant="link"
                                            className="text-dark p-1 me-2"
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
                                {/* Espaçador entre linhas */}
                                <tr style={{ height: '10px' }}></tr>
                                <tr style={{ backgroundColor: '#eeeeee' }}>
                                    <td
                                        className="ps-3 align-middle"
                                        style={{ borderRadius: '8px 0 0 8px' }}
                                    >
                                        2. Oficina
                                    </td>
                                    <td
                                        className="text-end pe-3"
                                        style={{ borderRadius: '0 8px 8px 0' }}
                                    >
                                        <Button
                                            variant="link"
                                            className="text-dark p-1 me-2"
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
                                style={{
                                    backgroundColor: '#eeeeee',
                                    border: 'none',
                                    py: '10px',
                                }}
                            />
                            <input
                                type="button"
                                value="Adicionar"
                                className="btn btn-success"
                            />
                        </div>
                    </SecaoFormulario>

                    {/* SEÇÃO: ANEXOS E FINALIZAÇÃO */}
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
                                className="p-0"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            >
                                <Form.Control
                                    type="file"
                                    className="bg-transparent border-1"
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        </Form.Group>
                    </SecaoFormulario>

                    {/* BOTÕES DE FINALIZAÇÃO */}
                    <div className="d-flex justify-content-end gap-3 mt-5 mb-5">
                        <Button variant="secondary" className="px-4">
                            Voltar
                        </Button>
                        <input
                            type="button"
                            onClick={handleSalvar}
                            value="Cadastrar Evento"
                            className="btn btn-success"
                        />
                    </div>
                </Form>
            </Container>

            {/* Rodapé verde aqui */}
        </div>
    );
}
