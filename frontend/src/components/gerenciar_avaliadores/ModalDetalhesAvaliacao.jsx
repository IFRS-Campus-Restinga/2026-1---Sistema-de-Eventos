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
    return (
        <ModalPopup
            titulo="Detalhes da avaliação"
            show={avaliacaoModal.show}
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
                        <span>{avaliacaoModal.atracao?.titulo || '-'}</span>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <span className="fw-bold">Tipo:</span>{' '}
                        <span>
                            {(() => {
                                const mod =
                                    typeof avaliacaoModal.atracao
                                        ?.modalidade === 'object' &&
                                    avaliacaoModal.atracao?.modalidade
                                        ? avaliacaoModal.atracao.modalidade
                                        : modalidadesMap?.[
                                              avaliacaoModal.atracao?.modalidade
                                          ];
                                return (
                                    mod?.nome ||
                                    mod?.titulo ||
                                    mod?.descricao ||
                                    avaliacaoModal.atracao?.modalidade ||
                                    '-'
                                );
                            })()}
                        </span>
                    </Col>
                </Row>
                <hr />
                {avaliacaoModal.loading ? (
                    <Row>
                        <Col>Carregando avaliacao...</Col>
                    </Row>
                ) : !avaliacaoModal.avaliacao ? (
                    <Row>
                        <Col>Nenhuma avaliacao encontrada.</Col>
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
                        </Row>
                        <Row>
                            <Col>
                                <span className="fw-bold">Destaque:</span>{' '}
                                <span>
                                    {avaliacaoModal.avaliacao?.destaque_do_dia
                                        ? 'Sim'
                                        : 'Não'}
                                </span>
                            </Col>
                            <Col>
                                <span className="fw-bold">Compareceu:</span>{' '}
                                <span>
                                    {avaliacaoModal.avaliacao?.compareceu
                                        ? 'Sim'
                                        : 'Não'}
                                </span>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <span className="fw-bold">Parecer:</span>
                                <div className="mt-1">
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
                                        criteriosMap[it.criterio_avaliacao];
                                    return (
                                        <div
                                            key={it.id}
                                            className="d-flex justify-content-between border rounded-3 px-3 py-2"
                                        >
                                            <div>
                                                <div className="fw-semibold">
                                                    {criterio?.nome ||
                                                        `Criterio ${it.criterio_avaliacao}`}
                                                </div>
                                                {criterio?.descricao && (
                                                    <div className="text-muted small">
                                                        {criterio.descricao}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="fw-bold">
                                                {Number.isFinite(it.nota)
                                                    ? it.nota.toFixed(1)
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
