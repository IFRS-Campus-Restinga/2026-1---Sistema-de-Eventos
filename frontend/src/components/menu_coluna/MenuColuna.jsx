import { Fragment } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function MenuColuna({ titulo = 'Menu', itens: dados = [] }) {
    return (
        <>
            <Container className="shadow rounded-3 px-0 pb-2">
                <Row className="ps-5 pt-3">
                    <Col>
                        <span className="fw-bold">{titulo}</span>
                    </Col>
                </Row>
                <hr className="my-1 " />
                {dados.map((d, i) => (
                    <div key={i}>
                        <Row className="ps-5">
                            <Col>
                                <Link
                                    to={d.to}
                                    className="text-decoration-none text-black fw-semibold d-flex align-items-center gap-1"
                                >
                                    {d.icone} {d.texto}
                                </Link>
                            </Col>
                        </Row>
                        {i + 1 !== dados.length ? (
                            <hr className="my-1" />
                        ) : null}
                    </div>
                ))}
            </Container>
        </>
    );
}
