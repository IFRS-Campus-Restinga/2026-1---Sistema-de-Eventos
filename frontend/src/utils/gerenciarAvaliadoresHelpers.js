import formatAreaConhecimento from './formatAreaConhecimento';

export const construirOpcoesArea = (atracoes) => {
    const valores = Array.from(
        new Set(
            (atracoes || []).map((a) => a.area_conhecimento).filter(Boolean),
        ),
    );

    return valores.map((valor) => ({
        valor,
        rotulo: formatAreaConhecimento(valor),
    }));
};

export const construirOpcoesModalidade = (modalidadesMap) => {
    const valores = Object.values(modalidadesMap || {});
    return valores.map((m) => ({
        valor: m.id,
        rotulo: m.nome || m.titulo || m.descricao || String(m.id),
    }));
};

export const filtrarAtracoes = (
    todasAtracoes,
    filtroArea,
    filtroBusca,
    filtroModalidade,
) => {
    const area = filtroArea?.toLowerCase?.() || '';
    const busca = filtroBusca?.toLowerCase?.() || '';
    const modalidadeFiltro = filtroModalidade || '';

    return (todasAtracoes || []).filter((a) => {
        const correspondeArea = area
            ? (a.area_conhecimento || a.modalidade || '')
                  .toString()
                  .toLowerCase()
                  .includes(area)
            : true;
        const correspondeBusca = busca
            ? (a.titulo || '').toLowerCase().includes(busca) ||
              (a.autores_text || '').toLowerCase().includes(busca)
            : true;
        const modalidadeId =
            typeof a.modalidade === 'object' && a.modalidade
                ? a.modalidade.id
                : a.modalidade;
        const correspondeModalidade = modalidadeFiltro
            ? String(modalidadeId) === String(modalidadeFiltro)
            : true;

        return correspondeArea && correspondeBusca && correspondeModalidade;
    });
};

export const ordenarAtracoesPorMedia = (lista, ordem, destaquesMap) => {
    return [...(lista || [])].sort((a, b) => {
        const mediaA = Number.isFinite(a.nota_media) ? a.nota_media : null;
        const mediaB = Number.isFinite(b.nota_media) ? b.nota_media : null;

        const destaA = destaquesMap?.[a.id] ? 1 : 0;
        const destaB = destaquesMap?.[b.id] ? 1 : 0;

        if (ordem === 'destaque_desc' || ordem === 'destaque_asc') {
            if (destaA !== destaB) return destaB - destaA;
        }

        if (mediaA === null && mediaB === null) return 0;
        if (mediaA === null) return 1;
        if (mediaB === null) return -1;
        return ordem === 'asc' || ordem === 'destaque_asc'
            ? mediaA - mediaB
            : mediaB - mediaA;
    });
};

export const mapearAvaliacoes = (avaliacoesResp, ids) => {
    const avaliacoes = Array.isArray(avaliacoesResp) ? avaliacoesResp : [];
    const soma = {};
    const qtd = {};
    const avaliacoesMap = {};
    const destaquesMap = {};

    avaliacoes.forEach((av) => {
        if (ids && !ids.has(av.atracao)) return;
        const nota = Number(av.nota_final);
        if (!Number.isFinite(nota)) return;
        soma[av.atracao] = (soma[av.atracao] || 0) + nota;
        qtd[av.atracao] = (qtd[av.atracao] || 0) + 1;
        if (av.avaliador) {
            avaliacoesMap[`${av.atracao}-${av.avaliador}`] = av.id;
        }
        if (av.destaque_do_dia) {
            destaquesMap[av.atracao] = true;
        }
    });

    const mediasMap = {};
    Object.keys(soma).forEach((id) => {
        mediasMap[id] = soma[id] / qtd[id];
    });

    return { mediasMap, avaliacoesMap, destaquesMap };
};

export const contarDesignacoes = (listaComAvaliadores) => {
    const contagemMap = {};
    (listaComAvaliadores || []).forEach((item) => {
        (item.avaliadores || []).forEach((av) => {
            const pid = av.perfil_id || av.id;
            if (!pid) return;
            contagemMap[pid] = (contagemMap[pid] || 0) + 1;
        });
    });
    return contagemMap;
};

export const gerarSugestoesPorArea = (listaUsuarios, atracao) => {
    return (listaUsuarios || []).filter((usr) => {
        return (
            (usr.area_conhecimento &&
                usr.area_conhecimento ===
                    (atracao.area_conhecimento || atracao.modalidade)) ||
            (usr.areas &&
                Array.isArray(usr.areas) &&
                usr.areas.includes(atracao.area_conhecimento))
        );
    });
};
