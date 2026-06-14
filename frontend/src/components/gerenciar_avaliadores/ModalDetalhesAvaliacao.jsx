import { Container, Row, Col } from 'react-bootstrap';
import ModalPopup from '../common/ModalPopup';

const calcularNotaFinal = (itens) => {
    const notas = (itens || [])
        .map((i) => Number(i.nota))
        .filter((n) => Number.isFinite(n));
    if (notas.length === 0) return '--';
    const media = notas.reduce((acc, n) => acc + n, 0) / notas.length;
    return media.toFixed(1);
};

export default function ModalDetalhesAvaliacao({
    avaliacaoModal,
    criteriosMap,
    onFechar,
    modalidadesMap,
}) {
    // TRAVA DE SEGURANÇA: Evita que o React tente ler propriedades de um objeto undefined
    if (!avaliacaoModal) return null;

    // Adaptação flexível para reaproveitar o modal tanto para atração quanto para submissão
    const trabalho = avaliacaoModal.submissao || avaliacaoModal.atracao;

    return (
        <ModalPopup
            titulo="Detalhes da avaliação"
            show={!!avaliacaoModal.show}
            onFechar={onFechar}
            textoAcao=""
        >
            <Container>
                <Row>
                    <Col>
                        <span className="fw-bold">Avaliador:</span>{' '}
                        <span>
                            {avaliacaoModal.avaliador?.nome ||
                                avaliacaoModal.avaliador?.name ||
                                avaliacaoModal.avaliador?.username ||
                                '-'}
                        </span>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <span className="fw-bold">Trabalho:</span>{' '}
                        <span>{trabalho?.titulo || '-'}</span>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <span className="fw-bold">Tipo:</span>{' '}
                        <span>
                            {(() => {
                                const modId = trabalho?.modalidade;
                                const mod =
                                    typeof modId === 'object' && modId
                                        ? modId
                                        : modalidadesMap?.[modId];
                                return (
                                    mod?.nome ||
                                    mod?.titulo ||
                                    mod?.descricao ||
                                    modId ||
                                    '-'
                                );
                            })()}
                        </span>
                    </Col>
                </Row>
                <hr />
                {avaliacaoModal.loading ? (
                    <Row>
                        <Col>Carregando avaliação...</Col>
                    </Row>
                ) : !avaliacaoModal.avaliacao ? (
                    <Row>
                        <Col>Nenhuma avaliação encontrada.</Col>
                    </Row>
                ) : (
                    <>
                        <Row>
                            <Col>
                                <span className="fw-bold">Nota final:</span>{' '}
                                <span>
                                    {calcularNotaFinal(avaliacaoModal.itens)}
                                </span>
                            </Col>
                            <Col>
                                {/* Exclusivo de Submissões: Mostra o Status de Aprovação */}
                                {avaliacaoModal.avaliacao?.status_aprovacao && (
                                    <>
                                        <span className="fw-bold">Status:</span>{' '}
                                        <span className="text-uppercase fw-semibold text-success">
                                            {avaliacaoModal.avaliacao.status_aprovacao.replace(
                                                '_',
                                                ' ',
                                            )}
                                        </span>
                                    </>
                                )}
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <span className="fw-bold">Parecer:</span>
                                <div
                                    className="mt-1 p-2 bg-white rounded border small text-secondary"
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {avaliacaoModal.avaliacao?.parecer || '-'}
                                </div>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col>
                                <span className="fw-bold">Critérios</span>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col className="d-flex flex-column gap-2">
                                {(avaliacaoModal.itens || []).map((it) => {
                                    const criterio =
                                        criteriosMap?.[it.criterio_avaliacao];
                                    return (
                                        <div
                                            key={it.id}
                                            className="d-flex justify-content-between border rounded-3 px-3 py-2 bg-white"
                                        >
                                            <div>
                                                <div className="fw-semibold">
                                                    {criterio?.nome ||
                                                        `Critério ${it.criterio_avaliacao}`}
                                                </div>
                                                {criterio?.descricao && (
                                                    <div className="text-muted small">
                                                        {criterio.descricao}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="fw-bold align-self-center">
                                                {window.Number.isFinite(it.nota)
                                                    ? window
                                                          .Number(it.nota)
                                                          .toFixed(1)
                                                    : it.nota}
                                            </div>
                                        </div>
                                    );
                                })}
                            </Col>
                        </Row>
                    </>
                )}
            </Container>
        </ModalPopup>
    );
}
