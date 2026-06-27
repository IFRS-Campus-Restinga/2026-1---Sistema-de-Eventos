import Tabela from '../common/Tabela';
import Tag from '../common/Tag';
import formatAreaConhecimento from '../../utils/formatAreaConhecimento';
import { obterCorPorTag } from '../../utils/themeTags';
import AvaliadorChip from './AvaliadorChip';
import { BsTrash } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiUserPlus } from 'react-icons/fi';

export default function TabelaAtribuicao({
    trabalhos,
    modalidadesMap = {},
    avaliacoesMap = {},
    destaquesMap = {},
    eventosMap = {},
    onAbrirAvaliacao,
    onRemoverAvaliador,
    onAtribuir,
    onHomologar,
    onCancelar,
    destaque = false,
    homologar = false,
    status = false,
    cancelar = false,
}) {
    const acoes = [homologar, cancelar];

    return (
        <Tabela
            className="rounded-4"
            style={{ overflow: 'hidden' }}
            cabecarios={[
                'Qtd. avaliadores',
                'Trabalho/Autores',
                status ? 'Status' : null, // Nova coluna exclusiva adicionada na ordem correta
                'Tipo',
                'Área',
                'Avaliadores',
                'Média',
                destaque ? 'Destaque' : null,
                {
                    label: 'Ações',
                    colSpan: acoes.filter((d) => d === true).length + 1,
                },
            ].filter(Boolean)}
            dados={(trabalhos || []).map((a) => {
                const modalidadeId =
                    typeof a.modalidade === 'object'
                        ? a.modalidade?.id
                        : a.modalidade;
                const modalidadeObj =
                    modalidadesMap?.[modalidadeId] ||
                    (typeof a.modalidade === 'object' ? a.modalidade : null);

                const tipoTexto =
                    modalidadeObj?.nome ||
                    modalidadeObj?.titulo ||
                    modalidadeObj?.descricao ||
                    a.tipo ||
                    '—';

                const num = (a.avaliadores || []).length || 0;
                const limiteRaw =
                    modalidadeObj?.limite_avaliadores ??
                    a.limite_avaliadores ??
                    null;
                const limite =
                    limiteRaw != null && limiteRaw !== ''
                        ? Number(limiteRaw)
                        : null;

                const cor = (() => {
                    if (num === 0) return 'red';
                    if (Number.isFinite(limite) && limite > 0 && num >= limite)
                        return 'green';
                    return '#FFC107';
                })();

                const textoContagem = Number.isFinite(limite)
                    ? `${num}/${limite} avaliadores`
                    : `${num}/— avaliadores`;

                const statusSubmissao =
                    a?.status_submissao || a?.status || 'SUBMETIDA';
                const statusLocked =
                    statusSubmissao === 'CONVERTIDA_EM_ATRACAO' ||
                    statusSubmissao === 'REPROVADA';

                // Helper de renderização visual e amigável do status da submissão
                const renderStatusTag = () => {
                    switch (statusSubmissao) {
                        case 'CONVERTIDA_EM_ATRACAO':
                        case 'HOMOLOGADA':
                        case 'APROVADA':
                            return (
                                <Tag
                                    corFundo="#198754"
                                    corTexto="#fff"
                                    texto="Homologada"
                                />
                            );
                        case 'REPROVADA':
                            return (
                                <Tag
                                    corFundo="#dc3545"
                                    corTexto="#fff"
                                    texto="Reprovada"
                                />
                            );
                        case 'EM_AVALIACAO':
                            return (
                                <Tag
                                    corFundo="#0dcaf0"
                                    corTexto="#000"
                                    texto="Em Avaliação"
                                />
                            );
                        case 'RASCUNHO':
                            return (
                                <Tag
                                    corFundo="#6c757d"
                                    corTexto="#fff"
                                    texto="Rascunho"
                                />
                            );
                        default:
                            return (
                                <Tag
                                    corFundo="#0d6efd"
                                    corTexto="#fff"
                                    texto="Submetida"
                                />
                            );
                    }
                };

                const linha = [
                    {
                        value: (
                            <div className="d-inline-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle"
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: cor,
                                    }}
                                ></div>
                                <span className="text-center">
                                    {textoContagem}
                                </span>
                            </div>
                        ),
                        style: { verticalAlign: 'middle' },
                    },
                    {
                        value: (
                            <div className="d-flex flex-column">
                                <span className="fw-semibold">{a.titulo}</span>
                                <span className="text-muted small">
                                    {a.autores_text || '—'}
                                </span>
                            </div>
                        ),
                        style: { verticalAlign: 'middle' },
                    },
                    status
                        ? {
                              value: renderStatusTag(), // Célula de valor da nova coluna inserida
                              style: { verticalAlign: 'middle' },
                          }
                        : null,
                    {
                        value: <span>{tipoTexto}</span>,
                        style: { verticalAlign: 'middle' },
                    },
                    {
                        value: (
                            <Tag
                                texto={formatAreaConhecimento(
                                    a.area_conhecimento || modalidadeId,
                                )}
                                corFundo={obterCorPorTag(
                                    formatAreaConhecimento(
                                        a.area_conhecimento || modalidadeId,
                                    ),
                                )}
                                corTexto="#fff"
                            />
                        ),
                        style: { verticalAlign: 'middle' },
                    },
                    {
                        value: (
                            <div className="d-flex flex-wrap gap-2 justify-content-start">
                                {(a.avaliadores || []).map((av) => {
                                    const perfilId = av.perfil_id || av.id;

                                    const chavePossiveis = [
                                        `${a.id}_${av.id}`,
                                        `${a.id}_${perfilId}`,
                                        `${a.id}-${av.id}`,
                                        `${a.id}-${perfilId}`,
                                    ];

                                    const jaAvaliou = chavePossiveis.some(
                                        (chave) => !!avaliacoesMap?.[chave],
                                    );

                                    return (
                                        <AvaliadorChip
                                            key={av.id}
                                            nome={
                                                av.nome ||
                                                av.name ||
                                                av.username
                                            }
                                            canRemove={!jaAvaliou}
                                            onView={
                                                jaAvaliou
                                                    ? () =>
                                                          onAbrirAvaliacao(
                                                              a,
                                                              av,
                                                          )
                                                    : null
                                            }
                                            onRemove={() =>
                                                onRemoverAvaliador(a, av)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        ),
                        style: { verticalAlign: 'middle' },
                    },
                    {
                        value: window.Number.isFinite(a.nota_media)
                            ? window.Number(a.nota_media).toFixed(1)
                            : '-',
                        className: 'text-end',
                        style: { verticalAlign: 'middle' },
                    },
                ];

                if (destaque) {
                    linha.push({
                        value: destaquesMap?.[a.id] ? 'Sim' : 'Não',
                        className: 'text-center',
                        style: { verticalAlign: 'middle' },
                    });
                }

                linha.push({
                    value: (
                        <div className="d-flex gap-3">
                            {eventosMap?.[a.evento] ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                        if (!statusLocked) onAtribuir(a);
                                    }}
                                    disabled={statusLocked}
                                >
                                    <FiUserPlus className="me-1" />
                                    Atribuir
                                </button>
                            ) : (
                                <span
                                    className="d-inline-block"
                                    title="Não é possível atribuir avaliadores porque a etapa deste evento já encerrou."
                                >
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled
                                    >
                                        Atribuir
                                    </button>
                                </span>
                            )}
                        </div>
                    ),
                    style: { verticalAlign: 'middle' },
                });

                if (homologar) {
                    linha.push({
                        value: (
                            <div className="d-flex gap-3">
                                {eventosMap?.[a.evento] ? (
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => {
                                            if (!statusLocked) onHomologar?.(a);
                                        }}
                                        disabled={statusLocked}
                                    >
                                        <FaCheckCircle className="me-1" />
                                        Aprovar
                                    </button>
                                ) : (
                                    <span
                                        className="d-inline-block"
                                        title="Indisponível"
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            disabled
                                        >
                                            Aprovar
                                        </button>
                                    </span>
                                )}
                            </div>
                        ),
                        style: { verticalAlign: 'middle' },
                    });
                }

                if (cancelar) {
                    linha.push({
                        value: (
                            <div className="d-flex gap-3">
                                {eventosMap?.[a.evento] ? (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            if (!statusLocked) onCancelar?.(a);
                                        }}
                                        disabled={statusLocked}
                                    >
                                        <BsTrash className="me-1" />
                                        Reprovar
                                    </button>
                                ) : (
                                    <span
                                        className="d-inline-block"
                                        title="Indisponível"
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            disabled
                                        >
                                            Reprovar
                                        </button>
                                    </span>
                                )}
                            </div>
                        ),
                        style: { verticalAlign: 'middle' },
                    });
                }

                return linha;
            })}
        />
    );
}
