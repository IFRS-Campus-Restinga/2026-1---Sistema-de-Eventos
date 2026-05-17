import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa6';

export default function Filtro({
    filtros = [],
    textoBotao = 'Filtrar',
    aoFiltrar,
}) {
    const filtrosSeguros = Array.isArray(filtros) ? filtros : [];

    return (
        <Card
            className="border-0 shadow-sm"
            style={{
                borderRadius: '24px',
            }}
        >
            <Card.Body className="p-4">
                <Row className="d-flex">
                    {filtrosSeguros.map((filtro, index) => {
                        const chaveFiltro =
                            filtro.nome || filtro.rotulo || `filtro-${index}`;
                        const tamanhoColuna = filtro.lg ?? 3;
                        const estiloBase = {
                            height: '52px',
                            borderRadius: '14px',
                        };

                        return (
                            <Col key={chaveFiltro} lg={tamanhoColuna}>
                                {filtro.tipo === 'select' ? (
                                    <Form.Select
                                        value={filtro.valor}
                                        onChange={filtro.aoMudar}
                                        style={estiloBase}
                                    >
                                        {filtro.placeholder ? (
                                            <option value="">
                                                {filtro.placeholder}
                                            </option>
                                        ) : null}
                                        {(filtro.opcoes || []).map((opcao) => {
                                            const valorOpcao =
                                                typeof opcao === 'string'
                                                    ? opcao
                                                    : opcao.valor;
                                            const rotuloOpcao =
                                                typeof opcao === 'string'
                                                    ? opcao
                                                    : opcao.rotulo;

                                            return (
                                                <option
                                                    key={`${chaveFiltro}-${valorOpcao}`}
                                                    value={valorOpcao}
                                                >
                                                    {rotuloOpcao}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                ) : (
                                    <Form.Control
                                        type={filtro.tipo || 'text'}
                                        placeholder={filtro.placeholder}
                                        value={filtro.valor}
                                        onChange={filtro.aoMudar}
                                        style={estiloBase}
                                    />
                                )}
                            </Col>
                        );
                    })}

                    <Col lg={2} className="d-flex justify-content-end ">
                        <Button
                            onClick={aoFiltrar}
                            className="bg-success fw-bold w-100"
                            style={{
                                height: '52px',
                                borderRadius: '14px',
                                border: 'none',
                            }}
                        >
                            <FaFilter className="me-2" />
                            {textoBotao}
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
