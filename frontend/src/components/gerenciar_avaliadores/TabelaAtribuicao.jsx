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
                'Tipo',
                'Área',
                'Avaliadores',
                'Média',
                destaque ? 'Destaque' : null,
                {
                    label: 'Ações',
                    colSpan: acoes.filter((d) => d === true).length + 1,
                },
            ].filter(Boolean)} // Mantém os cabeçalhos alinhados com o estado do componente
            dados={(trabalhos || []).map((a) => {
                // Resolve o ID da modalidade de forma segura para exibir o nome por extenso
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
                    a.tipo || // Fallback para o campo textual do mock caso exista
                    '—';

                // Calcula os limites de avaliadores
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

                const statusSubmissao = a?.status_submissao ?? null;
                const statusLocked =
                    statusSubmissao === 'CONVERTIDA_EM_ATRACAO' ||
                    statusSubmissao === 'REPROVADA';

                // Monta o array da linha mantendo estritamente a ordem das colunas
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
                                    // A chave usada no backend/estado pode variar entre:
                                    //  - "${submissaoId}_${avaliadorId}"
                                    //  - "${submissaoId}-${avaliadorId}" (legado)
                                    //  - e pode buscar por perfil_id dependendo do retorno da API.
                                    const perfilId = av.perfil_id || av.id;

                                    const chavePossiveis = [
                                        // formato atual do hook
                                        `${a.id}_${av.id}`,
                                        `${a.id}_${perfilId}`,
                                        // formato alternativo/legado
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

                // Se a coluna destaque estiver ativa, insere o dado no local correto da linha
                if (destaque) {
                    linha.push({
                        value: destaquesMap?.[a.id] ? 'Sim' : 'Não',
                        className: 'text-center',
                        style: { verticalAlign: 'middle' },
                    });
                }

                // Coluna básica da ação principal (Atribuir)
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

                // Se homologar estiver ativo, adiciona a estrutura de célula correspondente
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
                                        Homologar
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
                                            Homologar
                                        </button>
                                    </span>
                                )}
                            </div>
                        ),
                        style: { verticalAlign: 'middle' },
                    });
                }

                // Se cancelar estiver ativo, adiciona a estrutura de célula correspondente
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
