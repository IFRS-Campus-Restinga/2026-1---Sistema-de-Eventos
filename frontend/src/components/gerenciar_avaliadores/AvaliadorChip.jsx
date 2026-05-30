export default function AvaliadorChip({ nome, onRemove, onView, canRemove }) {
    return (
        <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border shadow-sm"
            style={{ background: '#E9ECEF' }}
        >
            <span className="small fw-semibold ">{nome}</span>
            {onView && (
                <button
                    type="button"
                    className="btn p-0 border-0 text-primary fw-semibold lh-1"
                    aria-label={`Ver avaliação de ${nome}`}
                    onClick={onView}
                >
                    ver
                </button>
            )}
            {!onView && <span className="small text-muted">Não avaliado</span>}
            <button
                type="button"
                className="btn p-0 border-0 text-danger fw-bold lh-1"
                aria-label={`Remover ${nome}`}
                title={
                    canRemove
                        ? 'Remover avaliador'
                        : 'Não é possível remover: avaliação já enviada'
                }
                disabled={!canRemove}
                onClick={canRemove ? onRemove : undefined}
            >
                x
            </button>
        </div>
    );
}
