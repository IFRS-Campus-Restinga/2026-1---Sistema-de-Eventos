import { Container, Row, Col, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import ModalPopup from '../common/ModalPopup';
import formatAreaConhecimento from '../../utils/formatAreaConhecimento';

export default function ModalAtribuicao({
    show,
    selecionada,
    manualBusca,
    onManualBuscaChange,
    onBuscarUsuarios,
    sugestoes,
    usuarios,
    selecionadasSugestoes,
    toggleSelecao,
    avaliadoresContagemMap,
    modalidadesMap,
    onSalvar,
    onFechar,
}) {
    const renderAvaliadorCard = (u) => {
        const pid = u.perfil_id || u.id;
        const checked = selecionadasSugestoes.includes(pid);
        const totalDesignado = avaliadoresContagemMap[pid] || 0;

        return (
            <Col key={pid} className="card py-2 px-3 ">
                <Form.Check
                    className="fw-bold"
                    label={u.nome || u.full_name || u.user_nome}
                    checked={checked}
                    onChange={() => toggleSelecao(pid)}
                />
                <small className="ms-3">
                    Áreas:{' '}
                    {formatAreaConhecimento(u.areas || u.area_conhecimento)}
                </small>
                <small className="ms-3 text-muted">
                    Designado para: {totalDesignado} trabalho(s)
                </small>
            </Col>
        );
    };

    return (
        <ModalPopup
            titulo="Atribuir avaliadores"
            show={show}
            size="xl"
            scrollable
            textoAcao="Salvar atribuições"
            variante="primary"
            onAcao={onSalvar}
            onFechar={onFechar}
        >
            <Container>
                <Row>
                    <Col>
                        <span className="fw-bold">Trabalho:</span>{' '}
                        <span>{selecionada?.titulo}</span>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <span className="fw-bold">Área:</span>{' '}
                        <span>
                            {formatAreaConhecimento(
                                selecionada?.area_conhecimento ||
                                    selecionada?.modalidade,
                            )}
                        </span>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <span className="fw-bold">Tipo:</span>{' '}
                        <span>
                            {(() => {
                                const mod =
                                    typeof selecionada?.modalidade ===
                                        'object' && selecionada?.modalidade
                                        ? selecionada.modalidade
                                        : modalidadesMap?.[
                                              selecionada?.modalidade
                                          ];
                                return (
                                    mod?.nome ||
                                    mod?.titulo ||
                                    mod?.descricao ||
                                    selecionada?.modalidade ||
                                    '-'
                                );
                            })()}
                        </span>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <span className="fw-bold">Busca Manual</span>
                        <InputGroup className="mb-3">
                            <Form.Control
                                placeholder="Digite o nome do avaliador"
                                aria-label="Digite o nome do avaliador"
                                aria-describedby="basic-addon2"
                                value={manualBusca}
                                list="avaliadores-list"
                                onChange={(e) =>
                                    onManualBuscaChange(e.target.value)
                                }
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        await onBuscarUsuarios();
                                    }
                                }}
                            />
                            <datalist id="avaliadores-list">
                                {(usuarios || []).slice(0, 50).map((u) => (
                                    <option
                                        key={u.perfil_id || u.id}
                                        value={
                                            u.nome || u.full_name || u.user_nome
                                        }
                                    />
                                ))}
                            </datalist>
                            <Button
                                variant="outline-secondary"
                                id="button-addon2"
                                onClick={onBuscarUsuarios}
                            >
                                Buscar
                            </Button>
                        </InputGroup>{' '}
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <span className="fw-bold text-success">
                            Sugestões da mesma Área
                        </span>
                    </Col>
                </Row>
                <Row className="px-2 mt-2 d-flex flex-column gap-2">
                    {(sugestoes || []).map((s) => renderAvaliadorCard(s))}
                </Row>
                <hr />
                <Row>
                    <Col>
                        <div className="d-flex flex-column gap-2">
                            {(Array.isArray(usuarios) ? usuarios : [])
                                .filter((u) => {
                                    if (!manualBusca) return true;
                                    return (
                                        u.nome ||
                                        u.full_name ||
                                        u.user_nome ||
                                        ''
                                    )
                                        .toLowerCase()
                                        .includes(manualBusca.toLowerCase());
                                })
                                .slice(0, 50)
                                .map((u) => renderAvaliadorCard(u))}
                        </div>
                    </Col>
                </Row>
            </Container>
        </ModalPopup>
    );
}
