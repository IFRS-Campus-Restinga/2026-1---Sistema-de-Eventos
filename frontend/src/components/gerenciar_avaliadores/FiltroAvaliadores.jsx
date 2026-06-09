import Filtro from '../common/Filtro';

export default function FiltroAvaliadores({
    filtroBusca,
    onBuscaChange,
    filtroArea,
    onAreaChange,
    areaOptions,
    ordenarOpcoes,
    valorOrdenacao,
    onOrdenacaoChange,
    aoFiltrar,
    filtroModalidade,
    onModalidadeChange,
    opcoesModalidade,
}) {
    return (
        <Filtro
            filtros={[
                {
                    nome: 'busca',
                    tipo: 'text',
                    placeholder: 'Buscar por título ou autor...',
                    lg: 4,
                    valor: filtroBusca,
                    aoMudar: onBuscaChange,
                },
                {
                    nome: 'modalidade',
                    tipo: 'select',
                    placeholder: 'Todas as modalidades',
                    lg: 2,
                    opcoes: opcoesModalidade,
                    valor: filtroModalidade,
                    aoMudar: onModalidadeChange,
                },
                {
                    nome: 'area',
                    tipo: 'select',
                    placeholder: 'Todas as áreas',
                    lg: 2,
                    opcoes: areaOptions,
                    valor: filtroArea,
                    aoMudar: onAreaChange,
                },
                {
                    nome: 'ordenacao',
                    tipo: 'select',
                    placeholder: 'Ordenar por nota',
                    opcoes: ordenarOpcoes,
                    lg: 2,
                    valor: valorOrdenacao,
                    aoMudar: onOrdenacaoChange,
                },
            ]}
            aoFiltrar={aoFiltrar}
        />
    );
}
