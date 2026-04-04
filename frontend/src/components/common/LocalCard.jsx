import Card from './Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { MdBook } from 'react-icons/md';
import Form from 'react-bootstrap/Form';

export default function LocalCard({ titulo, corCard = '#00A44B', Icon, nome, setNome, endereco, setEndereco }) {
    return (
        <Card corBorda={corCard}>
            {/* Esse componente está dividido em 3 linhas (Rows) */}
            {/* A primeira contém a título*/}
            {/* A segunda contém o campo de nome*/}
            {/* A terceira contém o campo de endereço */}
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
                                placeholder="Informe o nome do local"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="border-0 py-3"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                {/* 3 linha campo de endereço*/}
                <Row className="mb-4 mx-5">
                    <Col>
                        <Form.Group>
                            <Form.Label
                                className="fw-bold"
                                style={{ color: corCard }}
                            >
                                Endereço
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Informe o endereço do local"
                                value={endereco}
                                onChange={(e) => setEndereco(e.target.value)}
                                className="border-0 py-3"
                                style={{
                                    backgroundColor: '#eeeeee',
                                    borderRadius: '8px',
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}
