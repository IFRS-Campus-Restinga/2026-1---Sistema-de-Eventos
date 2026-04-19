import Button from 'react-bootstrap/Button';
import Card from '../common/Card';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Tag from '../common/Tag';
import { FaCheckCircle } from 'react-icons/fa';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ImBubbles } from 'react-icons/im';
import { FaCertificate } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa6';
import { MdRemoveRedEye } from 'react-icons/md';
import { RiTeamFill } from 'react-icons/ri';
import { MdOutlineSearch } from 'react-icons/md';

export default function ParticipacaoCard({
    corCard = '#016B3F',
    situacao = '',
    titulo = '',
    autores = [],
    id = '',
    tipoAtracao = '',
    nivel = '',
    tag = {},
    parecer = true,
    fase = '',
    onCancelar,
    onVerParecer,
    onVerCertificado,
    onVisualizar,
}) {
    return (
        <>
            {/* Esse componente está dividido em 3 linhas (Rows) */}
            {/* A primeira contém a situção, ID, tipo de apresentação e nível, além da Tag (autor, cooautor, participante, etc..) */}
            {/* A segunda contém o titulo e os botões de ação. Os Botões são exibidos de acordo com a prop fase*/}
            {/* A terceira contém o nome dos autores */}
            <Card corBorda={corCard}>
                <Container fluid>
                    {/* 1 linha */}
                    <Row>
                        <Col className="ms-2 mt-4 d-flex align-items-center">
                            {situacao.toLocaleLowerCase() == 'aprovado' ? (
                                <Button
                                    className="rounded-3"
                                    style={{
                                        background: corCard,
                                        border: 'none',
                                    }}
                                >
                                    <FaCheckCircle size={20} />
                                    <span className="ms-2 fw-bold">
                                        {situacao}
                                    </span>
                                </Button>
                            ) : null}
                            {situacao.toLocaleLowerCase() == 'em avaliacao' ||
                            situacao.toLocaleLowerCase() == 'em avaliação' ? (
                                <Button
                                    className="rounded-3"
                                    style={{
                                        background: corCard,
                                        border: 'none',
                                    }}
                                >
                                    <MdOutlineSearch size={25} />
                                    <span className="ms-2 fw-bold">
                                        {situacao}
                                    </span>
                                </Button>
                            ) : null}
                            <span className="text-secondary mx-3">
                                | ID #{id} | {tipoAtracao} - {nivel}
                            </span>
                            <Tag {...tag} />
                        </Col>
                    </Row>
                    {/* 2 linha */}
                    <Row className="ms-3 mt-3">
                        <Col>
                            <Row>
                                {/* Título */}
                                <Col>
                                    <p
                                        className="fw-semibold mt-2 fs-5 mb-0 "
                                        style={{ color: '#003366' }}
                                    >
                                        {titulo}
                                    </p>
                                </Col>
                                {/* Botões */}
                                <Col className="d-flex justify-content-end me-3">
                                    {/* inscrito */}
                                    {fase.toLocaleLowerCase() == 'inscrito' && (
                                        <div className="d-flex gap-3">
                                            <Button
                                                variant="outline-success"
                                                className="fw-semibold"
                                            >
                                                Inscrito
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                className="fw-semibold"
                                                onClick={onCancelar}
                                            >
                                                <FaRegTrashAlt className="me-1" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                    {/* avaliado */}
                                    {fase.toLocaleLowerCase() == 'avaliado' && (
                                        <div className="d-flex gap-3">
                                            {parecer ? (
                                                <Button
                                                    variant="outline-success"
                                                    className="fw-semibold"
                                                    onClick={onVerParecer}
                                                >
                                                    <ImBubbles
                                                        className="me-1"
                                                        size={18}
                                                    />
                                                    Ver Parecer
                                                </Button>
                                            ) : null}
                                            <Button
                                                variant="primary"
                                                className="fw-semibold"
                                                onClick={onVerCertificado}
                                                style={{
                                                    background: '#3D74FF',
                                                }}
                                            >
                                                <FaCertificate className="me-1" />
                                                Certificado
                                            </Button>
                                        </div>
                                    )}
                                    {/* avaliacao */}
                                    {fase.toLocaleLowerCase() ==
                                        'avaliacao' && (
                                        <div className="d-flex gap-3">
                                            {parecer ? (
                                                <Button
                                                    variant="outline-secondary"
                                                    className="fw-semibold"
                                                >
                                                    <FaLock
                                                        className="me-1"
                                                        size={18}
                                                    />
                                                    Edição Bloqueada
                                                </Button>
                                            ) : null}
                                            <Button
                                                variant="outline-success"
                                                className="fw-semibold"
                                                onClick={onVisualizar}
                                            >
                                                <MdRemoveRedEye
                                                    className="me-1"
                                                    size={25}
                                                />
                                                Visualizar
                                            </Button>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {/* 3 linha: Autores */}
                    <Row className="ms-3 mt-2">
                        <Col>
                            <p className="d-flex align-items-end text-secondary">
                                <RiTeamFill
                                    size={25}
                                    className="me-2 text-black"
                                />
                                Autores: {autores.join(', ')}
                            </p>
                        </Col>
                    </Row>
                </Container>
            </Card>
        </>
    );
}
