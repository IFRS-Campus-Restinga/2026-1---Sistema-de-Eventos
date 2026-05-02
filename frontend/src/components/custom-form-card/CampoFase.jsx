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
    desativado,
}) {
    const chave = campo?.name || campo?.list || id;
    const preFases = campo?.fases || [];
    const fasesAtuais =
        fases[chave] && fases[chave].length > 0 ? fases[chave] : preFases;
    const tiposJaAdicionados = new Set(
        fasesAtuais.map((fase) => fase?.tipo ?? fase?.value),
    );

    function adicionarFase(opcao) {
        const tipoNovo = opcao?.value ?? opcao;

        if (tiposJaAdicionados.has(tipoNovo)) {
            return;
        }

        setFases((anterior) => {
            const atuais = anterior[chave] || [];
            const nova = {
                tipo: tipoNovo,
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
                            <span className="fw-bold">
                                {fase.titulo || 'Fase'}
                            </span>
                            <small className="text-muted">
                                {fase?.descricao || campo?.descricao || ''}
                            </small>
                        </Col>

                        <Col
                            md={6}
                            className="d-flex flex-column flex-xl-row align-items-center gap-2"
                        >
                            <Form.Control
                                type="datetime-local"
                                value={fase.inicio || ''}
                                onChange={(e) =>
                                    !desativado &&
                                    atualizarFase(idx, 'inicio', e.target.value)
                                }
                                disabled={desativado}
                            />
                            <span>até</span>
                            <Form.Control
                                type="datetime-local"
                                value={fase.fim || ''}
                                onChange={(e) =>
                                    !desativado &&
                                    atualizarFase(idx, 'fim', e.target.value)
                                }
                                disabled={desativado}
                            />
                            <Button
                                variant="link"
                                className="btn btn-link text-danger"
                                onClick={() => !desativado && removerFase(idx)}
                                disabled={desativado}
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
                        !desativado &&
                        setMostrarOpcoes((anterior) => ({
                            ...anterior,
                            [chave]: !anterior[chave],
                        }))
                    }
                    disabled={desativado}
                >
                    + Adicionar Fase
                </Button>

                {mostrarOpcoes[chave] && (
                    <div className="list-group mt-2">
                        {(campo?.opcoes || [])
                            .filter((opcao) => {
                                const valorOpcao = opcao?.value ?? opcao;
                                return !tiposJaAdicionados.has(valorOpcao);
                            })
                            .map((opcao, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onClick={() => {
                                        if (desativado) return;
                                        adicionarFase(opcao);
                                        setMostrarOpcoes((anterior) => ({
                                            ...anterior,
                                            [chave]: false,
                                        }));
                                    }}
                                    disabled={desativado}
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
