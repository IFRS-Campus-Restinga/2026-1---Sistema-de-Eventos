import Card from '../common/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { MdBook } from 'react-icons/md';
import Form from 'react-bootstrap/Form';

export default function EspacoCard({
    titulo,
    corCard = '#00A44B',
    Icon,
    nome,
    setNome,
    capacidade,
    setCapacidade,
    predioBloco,
    setPredioBloco,
    recursosDisponiveis,
    setRecursosDisponiveis,
    ativo,
    setAtivo,
    erros,
}) {
    return (
        <Card corBorda={corCard}>
            {/* Esse componente está dividido em 6 linhas (Rows) */}
            {/* A primeira contém a título*/}
            {/* A segunda contém o campo de nome*/}
            {/* A terceira contém o campo de capacidade */}
            {/* A quarta contém o campo de prédio/bloco */}
            {/* A quinta contém o campo de recursos disponíveis */}
            {/* A sexta contém o campo de ativo */}
            <Container fluid className="mb-5">
                {/* 1 linha título */}
                <Row className="d-flex flex-column">
                    <Col className="d-flex ms-5 mt-5 align-items-center">
                        {Icon ? (
                            <Icon size={35} />
                        ) : (
                            <MdBook color={corCard} size={35} />
                        )}
                        <h3
                            className="fw-bold ms-1 mb-0"
                            style={{ color: corCard }}
                        >
                            {titulo || 'Título do Card'}
                        </h3>
                    </Col>
                    <Col className="d-flex justify-content-center">
                        <hr
                            className=""
                            style={{ border: '1px solid', width: '100%' }}
                        />
                    </Col>
                    {/* 2 linha campo de nome*/}
                </Row>
                <Row className="mb-4 mx-5">
                    <Col>
                        <Form.Group>
                            <Form.Label
                                className="fw-bold"
                                style={{ color: corCard }}
                            >
                                Nome
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Informe o nome do espaço"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                isInvalid={!!erros?.nome}
                                className="border-0 py-3"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                {erros?.nome}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                {/* 3 linha campo de capacidade*/}
                <Row className="mb-4 mx-5">
                    <Col>
                        <Form.Group>
                            <Form.Label
                                className="fw-bold"
                                style={{ color: corCard }}
                            >
                                Capacidade
                            </Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Informe a capacidade do espaço"
                                value={capacidade}
                                onChange={(e) => setCapacidade(e.target.value)}
                                isInvalid={!!erros?.capacidade}
                                className="border-0 py-3"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                {erros?.capacidade}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                {/* 4 linha campo de predio*/}
                <Row className="mb-4 mx-5">
                    <Col>
                        <Form.Group>
                            <Form.Label
                                className="fw-bold"
                                style={{ color: corCard }}
                            >
                                Prédio/Bloco
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Informe o prédio / bloco do espaço"
                                value={predioBloco}
                                onChange={(e) => setPredioBloco(e.target.value)}
                                isInvalid={!!erros?.predioBloco}
                                className="border-0 py-3"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                {erros?.predioBloco}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                {/* 5 linha campo de recursos*/}
                <Row className="mb-4 mx-5">
                    <Col>
                        <Form.Group>
                            <Form.Label
                                className="fw-bold"
                                style={{ color: corCard }}
                            >
                                Recursos disponíveis
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Informe os recursos disponíveis no espaço"
                                value={recursosDisponiveis}
                                onChange={(e) =>
                                    setRecursosDisponiveis(e.target.value)
                                }
                                isInvalid={!!erros?.recursosDisponiveis}
                                className="border-0 py-3"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                {erros?.recursosDisponiveis}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                {/* 6 linha campo de ativo*/}
                <Row className="mb-4 mx-5">
                    <Col>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                label="Ativo"
                                checked={ativo}
                                onChange={(e) => setAtivo(e.target.checked)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}
