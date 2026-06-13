import Tabela from '../common/Tabela';
import Tag from '../common/Tag';
import formatAreaConhecimento from '../../utils/formatAreaConhecimento';
import { obterCorPorTag } from '../../utils/themeTags';
import AvaliadorChip from './AvaliadorChip';
import { BsTrash } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiUserPlus } from 'react-icons/fi';

export default function TabelaAtibuicao({
    trabalhos,
    modalidadesMap,
    avaliacoesMap,
    destaquesMap,
    eventosMap,
    onAbrirAvaliacao,
    onRemoverAvaliador,
    onAtribuir,
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
                    colSpan: acoes.filter((d) => d == true).length + 1,
                },
            ]}
            dados={(trabalhos || []).map((a) => [
                {
                    value: (() => {
                        const num = (a.avaliadores || []).length || 0;
                        const modalidadeObj =
                            typeof a.modalidade === 'object' && a.modalidade
                                ? a.modalidade
                                : modalidadesMap[a.modalidade];
                        const limiteRaw =
                            modalidadeObj?.limite_avaliadores ??
                            a.limite_avaliadores ??
                            a.modalidade_limite ??
                            null;
                        const limite =
                            limiteRaw != null && limiteRaw !== ''
                                ? Number(limiteRaw)
                                : null;
                        const cor = (() => {
                            if (num === 0) return 'red';
                            if (
                                Number.isFinite(limite) &&
                                limite > 0 &&
                                num >= limite
                            )
                                return 'green';
                            return '#FFC107';
                        })();
                        const texto = Number.isFinite(limite)
                            ? `${num}/${limite} avaliadores`
                            : `${num}/— avaliadores`;

                        return (
                            <div className="d-inline-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle"
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: cor,
                                    }}
                                ></div>
                                <span className="text-center">{texto}</span>
                            </div>
                        );
                    })(),
                    style: { verticalAlign: 'middle' },
                },
                {
                    value: (
                        <div className="d-flex flex-column">
                            <span>{a.titulo}</span>
                            <span>{a.autores_text}</span>
                        </div>
                    ),
                    style: { verticalAlign: 'middle' },
                },
                {
                    value: (() => {
                        const modalidadeObj =
                            typeof a.modalidade === 'object' && a.modalidade
                                ? a.modalidade
                                : modalidadesMap[a.modalidade];
                        const tipoTexto =
                            modalidadeObj?.nome ||
                            modalidadeObj?.titulo ||
                            modalidadeObj?.descricao ||
                            a.modalidade ||
                            '—';
                        return <span>{tipoTexto}</span>;
                    })(),
                    style: { verticalAlign: 'middle' },
                },
                {
                    value: (
                        <Tag
                            className=""
                            texto={formatAreaConhecimento(
                                a.area_conhecimento || a.modalidade,
                            )}
                            corFundo={obterCorPorTag(
                                formatAreaConhecimento(
                                    a.area_conhecimento || a.modalidade,
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
                            {(a.avaliadores || []).map((av) => (
                                <AvaliadorChip
                                    key={av.id}
                                    nome={av.nome || av.name || av.username}
                                    canRemove={
                                        !avaliacoesMap[`${a.id}-${av.id}`]
                                    }
                                    onView={
                                        avaliacoesMap[`${a.id}-${av.id}`]
                                            ? () => onAbrirAvaliacao(a, av)
                                            : null
                                    }
                                    onRemove={() => onRemoverAvaliador(a, av)}
                                />
                            ))}
                        </div>
                    ),
                    style: { verticalAlign: 'middle' },
                },
                {
                    value: Number.isFinite(a.nota_media)
                        ? a.nota_media.toFixed(1)
                        : '-',
                    className: 'text-end',
                    style: { verticalAlign: 'middle' },
                },
                destaque
                    ? {
                          value: destaquesMap[a.id] ? 'Sim' : 'Não',
                          className: 'text-center',
                          style: { verticalAlign: 'middle' },
                      }
                    : null,
                {
                    value: (
                        <div className="d-flex gap-3">
                            {eventosMap?.[a.evento] ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => onAtribuir(a)}
                                >
                                    <FiUserPlus className="me-1" />
                                    Atribuir
                                </button>
                            ) : (
                                <span
                                    className="d-inline-block"
                                    title="Não é possível atribuir avaliadores porque a etapa de realização deste evento já encerrou."
                                >
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => onAtribuir(a)}
                                        disabled
                                    >
                                        Atribuir
                                    </button>
                                </span>
                            )}
                        </div>
                    ),
                    style: { verticalAlign: 'middle' },
                },
                homologar
                    ? {
                          value: (
                              <div className="d-flex gap-3">
                                  {eventosMap?.[a.evento] ? (
                                      <button
                                          type="button"
                                          className="btn btn-success"
                                      >
                                          <FaCheckCircle className="me-1" />
                                          Homologar
                                      </button>
                                  ) : (
                                      <span
                                          className="d-inline-block"
                                          title="Indisponivel"
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
                      }
                    : null,
                cancelar
                    ? {
                          value: (
                              <div className="d-flex gap-3">
                                  {eventosMap?.[a.evento] ? (
                                      <button
                                          type="button"
                                          className="btn btn-danger"
                                      >
                                          <BsTrash className="me-1" />
                                          Cancelar
                                      </button>
                                  ) : (
                                      <span
                                          className="d-inline-block"
                                          title="Indisponivel"
                                      >
                                          <button
                                              type="button"
                                              className="btn btn-outline-secondary"
                                              disabled
                                          >
                                              Cancelar
                                          </button>
                                      </span>
                                  )}
                              </div>
                          ),
                          style: { verticalAlign: 'middle' },
                      }
                    : null,
            ])}
        />
    );
}
