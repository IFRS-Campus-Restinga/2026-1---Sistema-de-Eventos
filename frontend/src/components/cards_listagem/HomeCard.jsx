import {
    MdAccessTime,
    MdCalendarToday,
    MdOutlineArrowForward,
    MdOutlineLocalOffer,
} from 'react-icons/md';

const STATUS_BADGE_STYLE = 'badge rounded-pill px-3 py-2 fw-semibold';
const MUTED_BADGE_STYLE =
    'badge rounded-pill px-3 py-2 fw-semibold bg-light text-secondary border';
const GHOST_BADGE_STYLE =
    'badge rounded-pill px-3 py-2 fw-semibold bg-light text-secondary border';

function getInscriptionButtonClass(possuiInscricao, statusInscricao) {
    if (possuiInscricao && statusInscricao === 'CANCELADA') {
        return 'btn btn-outline-danger';
    }

    return 'btn btn-outline-success';
}

function getButtonLabel(possuiInscricao, statusInscricao) {
    if (!possuiInscricao) {
        return 'Inscreva-se';
    }

    return statusInscricao === 'CANCELADA' ? 'Inscrição cancelada' : 'Inscrito';
}

export default function HomeCard({
    evento,
    destaque = false,
    onDetalhes,
    onInscrever,
    possuiInscricao,
    statusInscricao,
    permiteInscricao,
    formatarData,
    etapaAtual,
}) {
    const etapaLabel = etapaAtual || 'Etapa atual';
    const mostrarBotaoInscricao = permiteInscricao || possuiInscricao;
    const inscriptionButtonClass = `${getInscriptionButtonClass(
        possuiInscricao,
        statusInscricao,
    )} ${destaque ? '' : 'btn-sm'}`.trim();

    return (
        <article
            className="card border-0 h-100"
            style={{
                borderRadius: destaque ? '1.5rem' : '1.25rem',
                boxShadow: '0 18px 40px rgba(19, 44, 26, 0.08)',
                overflow: 'hidden',
            }}
        >
            {destaque ? (
                <div className="row g-0">
                    <div className="col-lg-8 p-4 p-lg-4 d-flex flex-column gap-3">
                        <div className="d-flex flex-wrap gap-2">
                            <span
                                className={`${STATUS_BADGE_STYLE} bg-success text-white`}
                            >
                                {etapaLabel}
                            </span>
                            <span className={MUTED_BADGE_STYLE}>Destaque</span>
                            {evento.setor ? (
                                <span className={GHOST_BADGE_STYLE}>
                                    {evento.setor}
                                </span>
                            ) : null}
                        </div>

                        <h2 className="display-6 fw-semibold mb-0 text-body-emphasis">
                            {evento.nome}
                        </h2>

                        <p className="mb-0 text-secondary fs-5 lh-lg">
                            {evento.descricao}
                        </p>

                        <div className="d-flex flex-wrap gap-3 text-secondary small">
                            <span className="d-inline-flex align-items-center gap-2">
                                <MdAccessTime aria-hidden="true" />
                                {`${evento.carga_horaria}h`}
                            </span>
                            <span className="d-inline-flex align-items-center gap-2">
                                <MdCalendarToday aria-hidden="true" />
                                {formatarData(evento)}
                            </span>
                            {evento.tema ? (
                                <span className="d-inline-flex align-items-center gap-2">
                                    <MdOutlineLocalOffer aria-hidden="true" />
                                    {evento.tema}
                                </span>
                            ) : null}
                        </div>

                        <div className="mt-auto pt-3 border-top d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3">
                            <div className="d-flex flex-column gap-1 text-body-emphasis">
                                <span
                                    className="text-uppercase small fw-semibold text-secondary-emphasis opacity-75"
                                    style={{ letterSpacing: '0.14em' }}
                                >
                                    Fase atual
                                </span>
                                <strong>{etapaLabel}</strong>
                            </div>

                            <div className="d-flex flex-wrap justify-content-md-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-success text-white"
                                    onClick={onDetalhes}
                                >
                                    Ver detalhes
                                    <MdOutlineArrowForward aria-hidden="true" />
                                </button>

                                {mostrarBotaoInscricao ? (
                                    <button
                                        type="button"
                                        className={inscriptionButtonClass}
                                        onClick={onInscrever}
                                        disabled={
                                            possuiInscricao &&
                                            statusInscricao !== 'CANCELADA'
                                        }
                                    >
                                        {getButtonLabel(
                                            possuiInscricao,
                                            statusInscricao,
                                        )}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div
                        className="col-lg-4 d-flex flex-column justify-content-center align-items-center text-center p-4 p-lg-4"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at top, rgba(255, 255, 255, 0.18), transparent 48%), linear-gradient(180deg, #0f7a43 0%, #0f7a43 100%)',
                            color: '#ffffff',
                        }}
                    >
                        <span className="badge rounded-pill bg-white text-uppercase text-secondary fw-semibold px-3 py-2">
                            Destaque
                        </span>
                        <div className="display-3 fw-bold mt-3 mb-0">
                            {evento.carga_horaria}h
                        </div>
                        <div className="small text-white-50 mt-2">
                            carga horária total
                        </div>
                        <div
                            className="mt-4 rounded-pill"
                            style={{
                                width: '4.5rem',
                                height: '0.35rem',
                                background: 'rgba(255, 255, 255, 0.42)',
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="card-body p-4 d-flex flex-column gap-3">
                    <div className="d-flex flex-wrap gap-2">
                        <span
                            className={`${STATUS_BADGE_STYLE} bg-success text-white`}
                        >
                            {etapaLabel}
                        </span>
                        {evento.setor ? (
                            <span className={GHOST_BADGE_STYLE}>
                                {evento.setor}
                            </span>
                        ) : null}
                    </div>

                    <h3 className="h4 fw-semibold mb-0 text-body-emphasis">
                        {evento.nome}
                    </h3>

                    <p className="mb-0 text-secondary">{evento.descricao}</p>

                    <div className="d-flex flex-wrap gap-3 text-secondary small">
                        <span className="d-inline-flex align-items-center gap-2">
                            <MdAccessTime aria-hidden="true" />
                            {`${evento.carga_horaria}h`}
                        </span>
                        <span className="d-inline-flex align-items-center gap-2">
                            <MdCalendarToday aria-hidden="true" />
                            {formatarData(evento)}
                        </span>
                        {evento.tema ? (
                            <span className="d-inline-flex align-items-center gap-2">
                                <MdOutlineLocalOffer aria-hidden="true" />
                                {evento.tema}
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3">
                        <button
                            type="button"
                            className="btn btn-success text-white"
                            onClick={onDetalhes}
                        >
                            Ver detalhes
                            <MdOutlineArrowForward aria-hidden="true" />
                        </button>

                        {mostrarBotaoInscricao ? (
                            <button
                                type="button"
                                className={inscriptionButtonClass}
                                onClick={onInscrever}
                                disabled={
                                    possuiInscricao &&
                                    statusInscricao !== 'CANCELADA'
                                }
                            >
                                {getButtonLabel(
                                    possuiInscricao,
                                    statusInscricao,
                                )}
                            </button>
                        ) : null}
                    </div>
                </div>
            )}
        </article>
    );
}
