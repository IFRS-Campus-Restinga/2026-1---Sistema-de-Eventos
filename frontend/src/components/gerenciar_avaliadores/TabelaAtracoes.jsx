import Tabela from '../common/Tabela';
import Tag from '../common/Tag';
import formatAreaConhecimento from '../../utils/formatAreaConhecimento';
import { obterCorPorTag } from '../../utils/themeTags';
import AvaliadorChip from './AvaliadorChip';

export default function TabelaAtracoes({
    atracoes,
    modalidadesMap,
    avaliacoesMap,
    destaquesMap,
    eventosMap,
    onAbrirAvaliacao,
    onRemoverAvaliador,
    onAtribuir,
}) {
    return (
        <Tabela
            className="rounded-4"
            style={{ overflow: 'hidden' }}
            cabecarios={[
                'Qtd. avaliadores',
                'Trabalho/Autores',
                'Área',
                'Avaliadores',
                'Média',
                'Destaque',
                'Ações',
            ]}
            dados={(atracoes || []).map((a) => [
                {
                    value: (() => {
                        const num = (a.avaliadores || []).length || 0;
                        const modalidadeObj =
                            typeof a.modalidade === 'object' && a.modalidade
                                ? a.modalidade
                                : modalidadesMap[a.modalidade];
                        const limite = Number(
                            modalidadeObj?.limite_avaliadores ??
                                a.limite_avaliadores ??
                                a.modalidade_limite ??
                                0,
                        );
                        const cor = (() => {
                            if (num === 0) return 'red';
                            if (limite > 0 && num >= limite) return 'green';
                            return '#FFC107';
                        })();
                        const texto =
                            limite > 0
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
                                <span className="">{texto}</span>
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
                    value: (
                        <Tag
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
                {
                    value: destaquesMap[a.id] ? 'Sim' : 'Não',
                    className: 'text-center',
                    style: { verticalAlign: 'middle' },
                },
                {
                    value: (
                        <div className="d-flex gap-3">
                            {eventosMap?.[a.evento] ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => onAtribuir(a)}
                                >
                                    Atribuir
                                </button>
                            ) : (
                                <span
                                    className="d-inline-block"
                                    title="Não é possível atribuir avaliadores porque a etapa de realização deste evento já encerrou."
                                >
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
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
            ])}
        />
    );
}
