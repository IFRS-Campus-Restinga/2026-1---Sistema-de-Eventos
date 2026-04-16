import { Row, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/esm/Button';
import { BsTrash } from 'react-icons/bs';

export default function CampoFase({
    id,
    campo,
    fases,
    setFases,
    mostrarOpcoes,
    setMostrarOpcoes,
}) {
    const chave = campo?.name || campo?.list || id;
    const preFases = campo?.fases || [];
    const fasesAtuais =
        fases[chave] && fases[chave].length > 0 ? fases[chave] : preFases;

    function adicionarFase(opcao) {
        setFases((anterior) => {
            const atuais = anterior[chave] || [];
            const nova = {
                tipo: opcao?.value ?? opcao,
                titulo: opcao?.text ?? opcao?.label ?? opcao,
                descricao: opcao?.descricao || opcao?.desc || '',
                inicio: '',
                fim: '',
                ativo: true,
            };
            return { ...anterior, [chave]: [...atuais, nova] };
        });
    }

    function removerFase(idx) {
        setFases((anterior) => {
            const atuais = anterior[chave] || [];
            return { ...anterior, [chave]: atuais.filter((_, i) => i !== idx) };
        });
    }

    function atualizarFase(idx, campoNome, valor) {
        setFases((anterior) => {
            const atuais = anterior[chave] || [];
            return {
                ...anterior,
                [chave]: atuais.map((f, i) =>
                    i === idx ? { ...f, [campoNome]: valor } : f,
                ),
            };
        });
    }

    return (
        <>
            {fasesAtuais.map((fase, idx) => (
                <div className="p-3 border rounded mb-3" key={idx}>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <Form.Check
                                type="switch"
                                label={fase.titulo || 'Fase'}
                                className="fw-bold"
                                checked={!!fase.ativo}
                                onChange={(e) =>
                                    atualizarFase(
                                        idx,
                                        'ativo',
                                        e.target.checked,
                                    )
                                }
                            />
                            <small className="text-muted">
                                {fase?.descricao || campo?.descricao || ''}
                            </small>
                        </Col>

                        <Col md={6} className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="date"
                                value={fase.inicio || ''}
                                onChange={(e) =>
                                    atualizarFase(idx, 'inicio', e.target.value)
                                }
                            />
                            <span>ate</span>
                            <Form.Control
                                type="date"
                                value={fase.fim || ''}
                                onChange={(e) =>
                                    atualizarFase(idx, 'fim', e.target.value)
                                }
                            />
                            <Button
                                variant="link"
                                className="btn btn-link text-danger"
                                onClick={() => removerFase(idx)}
                            >
                                <BsTrash size={18} />
                            </Button>
                        </Col>
                    </Row>
                </div>
            ))}

            <div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                        setMostrarOpcoes((anterior) => ({
                            ...anterior,
                            [chave]: !anterior[chave],
                        }))
                    }
                >
                    + Adicionar Fase
                </Button>

                {mostrarOpcoes[chave] && (
                    <div className="list-group mt-2">
                        {(campo?.opcoes || []).map((opcao, i) => (
                            <button
                                key={i}
                                type="button"
                                className="list-group-item list-group-item-action"
                                onClick={() => {
                                    adicionarFase(opcao);
                                    setMostrarOpcoes((anterior) => ({
                                        ...anterior,
                                        [chave]: false,
                                    }));
                                }}
                            >
                                {opcao?.text ??
                                    opcao?.label ??
                                    opcao?.value ??
                                    String(opcao)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
