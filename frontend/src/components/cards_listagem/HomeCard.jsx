import { useState } from 'react';
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
    // custom button props (optional) - when provided, they override the default
    textoBotao1,
    textoBotao2,
    onClick1,
    onClick2,
    desabilitarBotao2 = false,
    corBotao1,
    varianteBotao2,
    showDestaqueBadge = true,
    opcoesBotaoPrincipal = null,
}) {
    const [menuAberto, setMenuAberto] = useState(false);
    const etapaLabel = etapaAtual || 'Etapa atual';
    const mostrarBotaoInscricao = permiteInscricao || possuiInscricao;
    const inscricaoCancelada =
        Boolean(possuiInscricao) && statusInscricao === 'CANCELADA';
    const botaoInscricaoDesabilitado =
        Boolean(possuiInscricao) || inscricaoCancelada;
    const inscriptionButtonClass = `${getInscriptionButtonClass(
        possuiInscricao,
        statusInscricao,
    )} ${destaque ? '' : 'btn-sm'}`.trim();

    const handleInscrever = () => {
        if (inscricaoCancelada) {
            return;
        }

        onInscrever?.();
    };

    const detalheLabel = textoBotao1 ?? 'Ver detalhes';
    const detalheHandler = onClick1 ?? onDetalhes;
    const segundaLabel = textoBotao2 ?? null;
    const segundaHandler = onClick2 ?? onInscrever;
    const resumoStyle = {
        display: '-webkit-box',
        WebkitLineClamp: destaque ? 4 : 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        // fixed height to keep all cards identical regardless of text length
        height: destaque ? '7.5rem' : '5.25rem',
    };

    return (
        <article
            className="card border-0 h-100"
            style={{
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: destaque ? '1.5rem' : '1.25rem',
                boxShadow: '0 18px 40px rgba(19, 44, 26, 0.08)',
                overflow: 'visible',
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
                            {showDestaqueBadge ? (
                                <span className={MUTED_BADGE_STYLE}>
                                    Destaque
                                </span>
                            ) : null}
                            {evento.setor ? (
                                <span className={GHOST_BADGE_STYLE}>
                                    {evento.setor}
                                </span>
                            ) : null}
                        </div>

                        <h2 className="display-6 fw-semibold mb-0 text-body-emphasis">
                            {evento.nome}
                        </h2>

                        <p
                            className="mb-0 text-secondary fs-5 lh-lg"
                            style={resumoStyle}
                        >
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
                                {Array.isArray(opcoesBotaoPrincipal) &&
                                opcoesBotaoPrincipal.length > 1 ? (
                                    <div className="position-relative">
                                        <button
                                            type="button"
                                            className="btn btn-success text-white"
                                            style={
                                                corBotao1
                                                    ? {
                                                          background: corBotao1,
                                                          border: corBotao1,
                                                      }
                                                    : undefined
                                            }
                                            onClick={() =>
                                                setMenuAberto((valor) => !valor)
                                            }
                                        >
                                            {detalheLabel}
                                            <MdOutlineArrowForward aria-hidden="true" />
                                        </button>

                                        {menuAberto ? (
                                            <div
                                                className="position-absolute start-0 mt-2 shadow rounded border bg-white"
                                                style={{
                                                    zIndex: 10,
                                                    minWidth: '12rem',
                                                }}
                                            >
                                                {opcoesBotaoPrincipal.map(
                                                    (opcao) => (
                                                        <button
                                                            key={opcao.label}
                                                            type="button"
                                                            className="btn btn-link text-start text-decoration-none w-100 px-3 py-2 text-secondary"
                                                            onClick={() => {
                                                                opcao.onClick?.();
                                                                setMenuAberto(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            {opcao.label}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-success text-white"
                                        style={
                                            corBotao1
                                                ? {
                                                      background: corBotao1,
                                                      border: corBotao1,
                                                  }
                                                : undefined
                                        }
                                        onClick={detalheHandler}
                                    >
                                        {detalheLabel}
                                        <MdOutlineArrowForward aria-hidden="true" />
                                    </button>
                                )}

                                {segundaLabel ? (
                                    <button
                                        type="button"
                                        className={
                                            varianteBotao2
                                                ? `btn ${varianteBotao2}`
                                                : inscriptionButtonClass
                                        }
                                        onClick={segundaHandler}
                                        disabled={desabilitarBotao2}
                                    >
                                        {segundaLabel}
                                    </button>
                                ) : mostrarBotaoInscricao ? (
                                    <button
                                        type="button"
                                        className={inscriptionButtonClass}
                                        onClick={handleInscrever}
                                        disabled={botaoInscricaoDesabilitado}
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
                        {showDestaqueBadge ? (
                            <span className="badge rounded-pill bg-white text-uppercase text-secondary fw-semibold px-3 py-2">
                                Destaque
                            </span>
                        ) : null}
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

                    <p className="mb-0 text-secondary" style={resumoStyle}>
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

                    <div className="mt-auto pt-3 border-top d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3">
                        {Array.isArray(opcoesBotaoPrincipal) &&
                        opcoesBotaoPrincipal.length > 1 ? (
                            <div className="position-relative">
                                <button
                                    type="button"
                                    className="btn btn-success text-white"
                                    style={
                                        corBotao1
                                            ? {
                                                  background: corBotao1,
                                                  border: corBotao1,
                                              }
                                            : undefined
                                    }
                                    onClick={() =>
                                        setMenuAberto((valor) => !valor)
                                    }
                                >
                                    {detalheLabel}
                                    <MdOutlineArrowForward aria-hidden="true" />
                                </button>

                                {menuAberto ? (
                                    <div
                                        className="position-absolute start-0 mt-2 shadow rounded border bg-white"
                                        style={{
                                            zIndex: 10,
                                            minWidth: '12rem',
                                        }}
                                    >
                                        {opcoesBotaoPrincipal.map((opcao) => (
                                            <button
                                                key={opcao.label}
                                                type="button"
                                                className="btn btn-link text-start text-decoration-none w-100 px-3 py-2 text-secondary"
                                                onClick={() => {
                                                    opcao.onClick?.();
                                                    setMenuAberto(false);
                                                }}
                                            >
                                                {opcao.label}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-success text-white"
                                style={
                                    corBotao1
                                        ? {
                                              background: corBotao1,
                                              border: corBotao1,
                                          }
                                        : undefined
                                }
                                onClick={detalheHandler}
                            >
                                {detalheLabel}
                                <MdOutlineArrowForward aria-hidden="true" />
                            </button>
                        )}

                        {segundaLabel ? (
                            <button
                                type="button"
                                className={
                                    varianteBotao2
                                        ? `btn ${varianteBotao2}`
                                        : inscriptionButtonClass
                                }
                                onClick={segundaHandler}
                                disabled={desabilitarBotao2}
                            >
                                {segundaLabel}
                            </button>
                        ) : mostrarBotaoInscricao ? (
                            <button
                                type="button"
                                className={inscriptionButtonClass}
                                onClick={handleInscrever}
                                disabled={botaoInscricaoDesabilitado}
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
