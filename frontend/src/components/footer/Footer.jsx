import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import IFLogo from '../common/IFLogo';
import { MdPhone } from 'react-icons/md';
import { MdLocationPin } from 'react-icons/md';

export default function Footer({
    telefone = '',
    endereco = '',
    ano = 2026,
    campus = '',
}) {
    return (
        <>
            <Container
                fluid
                className="px-5 pt-5 pb-1 mt-auto"
                style={{ backgroundColor: '#00A44B' }}
            >
                <Row>
                    <Col className="d-flex flex-colum justify-content-md-start justify-content-center align-items-center pb-md-0 pb-5">
                        <IFLogo
                            corCirculo="#fff"
                            corRect="#fff"
                            corTexto="#fff"
                            estado="Rio Grande do Sul"
                            campus="Campus Restinga"
                            width={250}
                        ></IFLogo>
                    </Col>
                    <Col className="d-flex flex-colum justify-content-md-end justify-content-center align-items-center py-md-0 py-5">
                        <div className="d-flex flex-column gap-md-0 gap-3">
                            <p className="fs-4 text-white fw-bold">
                                Contato e Suporte
                            </p>

                            <p className="text-white d-flex align-items-end">
                                <MdPhone
                                    color="#fff"
                                    size={26}
                                    className="me-1"
                                />
                                <span>{telefone}</span>
                            </p>
                            <p className="text-white mb-0 d-flex align-items-end">
                                <MdLocationPin
                                    color="#fff"
                                    size={25}
                                    className="me-1"
                                />
                                <span>{endereco}</span>
                            </p>
                        </div>
                    </Col>
                </Row>
                <hr
                    className="my-5 text-white"
                    style={{ border: '2px solid' }}
                />
                <Row className="mt-5">
                    <Col
                        className="text-white text-center"
                        style={{ fontSize: '12px' }}
                    >
                        © {ano} IFRS {campus}. Todos os direitos reservados.
                    </Col>
                </Row>
            </Container>
        </>
    );
}
