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
    mostrarBusca = true,
    mostrarModalidade = true,
    mostrarArea = true,
    mostrarOrdenacao = true,
}) {
    const filtros = [];

    if (mostrarBusca) {
        filtros.push({
            nome: 'busca',
            tipo: 'text',
            placeholder: 'Buscar por título ou autor...',
            valor: filtroBusca,
            aoMudar: onBuscaChange,
        });
    }

    if (mostrarModalidade) {
        filtros.push({
            nome: 'modalidade',
            tipo: 'select',
            placeholder: 'Todas as modalidades',
            opcoes: opcoesModalidade,
            valor: filtroModalidade,
            aoMudar: onModalidadeChange,
        });
    }

    if (mostrarArea) {
        filtros.push({
            nome: 'area',
            tipo: 'select',
            placeholder: 'Todas as áreas',
            opcoes: areaOptions,
            valor: filtroArea,
            aoMudar: onAreaChange,
        });
    }

    if (mostrarOrdenacao) {
        filtros.push({
            nome: 'ordenacao',
            tipo: 'select',
            placeholder: 'Ordenar por nota',
            opcoes: ordenarOpcoes,
            valor: valorOrdenacao,
            aoMudar: onOrdenacaoChange,
        });
    }

    return <Filtro filtros={filtros} aoFiltrar={aoFiltrar} />;
}
