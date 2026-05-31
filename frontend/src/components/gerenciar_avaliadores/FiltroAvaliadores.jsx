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
                    nome: 'area',
                    tipo: 'select',
                    placeholder: 'Todas as áreas',
                    opcoes: areaOptions,
                    valor: filtroArea,
                    aoMudar: onAreaChange,
                },
                {
                    nome: 'ordenacao',
                    tipo: 'select',
                    placeholder: 'Ordenar por nota',
                    opcoes: ordenarOpcoes,
                    valor: valorOrdenacao,
                    aoMudar: onOrdenacaoChange,
                },
            ]}
            aoFiltrar={aoFiltrar}
        />
    );
}
