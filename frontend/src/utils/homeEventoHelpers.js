const ETAPA_LABELS = {
    SUBMISSAO_TRABALHOS: 'Submissão de trabalhos',
    AVALIACAO_PREVIA: 'Avaliação prévia',
    HOMOLOGACAO: 'Homologação',
    INSCRICAO_PUBLICO: 'Inscrição do público',
    REALIZACAO_EVENTO: 'Realização do evento',
};

const TIPOS_INSCRICAO = new Set(['INSCRICAO_PUBLICO', 'SUBMISSAO_TRABALHOS']);
const TIPO_REALIZACAO = 'REALIZACAO_EVENTO';

export function formatarEtapa(tipoEtapa) {
    return ETAPA_LABELS[tipoEtapa] || 'Etapa atual';
}

export function normalizarStatusCadastro(statusEvento) {
    const valor = String(statusEvento || '').toUpperCase();

    if (valor.includes('PLANEJ')) {
        return 'EM_PLANEJAMENTO';
    }

    if (valor.includes('ENCERR')) {
        return 'ENCERRADO';
    }

    if (
        valor.includes('ANDAM') ||
        valor.includes('ABERTO') ||
        valor.includes('ATIVO')
    ) {
        return 'EM_ANDAMENTO';
    }

    return null;
}

export function obterStatusHome(evento, agora = new Date()) {
    const etapas = Array.isArray(evento?.etapas) ? evento.etapas : [];

    const etapasOrdenadas = [...etapas].sort((etapaA, etapaB) => {
        const inicioA = new Date(etapaA?.data_inicio ?? 0).getTime();
        const inicioB = new Date(etapaB?.data_inicio ?? 0).getTime();

        return inicioA - inicioB;
    });

    const etapaRealizacaoAtiva = etapas.find(
        (etapa) =>
            etapa?.tipo_etapa === TIPO_REALIZACAO &&
            etapa?.data_inicio &&
            etapa?.data_fim &&
            new Date(etapa.data_inicio) <= agora &&
            agora <= new Date(etapa.data_fim),
    );

    if (etapaRealizacaoAtiva) {
        return {
            status: 'EM_ANDAMENTO',
            etapaAtual: formatarEtapa(etapaRealizacaoAtiva.tipo_etapa),
        };
    }

    const etapaInscricaoAtiva = etapas.find(
        (etapa) =>
            TIPOS_INSCRICAO.has(etapa?.tipo_etapa) &&
            etapa?.data_inicio &&
            etapa?.data_fim &&
            new Date(etapa.data_inicio) <= agora &&
            agora <= new Date(etapa.data_fim),
    );

    if (etapaInscricaoAtiva) {
        return {
            status: 'INSCRICOES_ABERTAS',
            etapaAtual: formatarEtapa(etapaInscricaoAtiva.tipo_etapa),
        };
    }

    const etapaRealizacaoEncerrada = etapas.find(
        (etapa) =>
            etapa?.tipo_etapa === TIPO_REALIZACAO &&
            etapa?.data_fim &&
            new Date(etapa.data_fim) < agora,
    );

    if (etapaRealizacaoEncerrada) {
        return {
            status: 'ENCERRADO',
            etapaAtual: formatarEtapa(TIPO_REALIZACAO),
        };
    }

    const statusCadastro = normalizarStatusCadastro(evento?.status_evento);

    if (statusCadastro === 'EM_PLANEJAMENTO') {
        return null;
    }

    if (statusCadastro) {
        return {
            status: statusCadastro,
            etapaAtual: etapas.find((etapa) => etapa?.tipo_etapa)?.tipo_etapa
                ? formatarEtapa(
                      etapas.find((etapa) => etapa?.tipo_etapa).tipo_etapa,
                  )
                : 'Etapa atual',
        };
    }

    const ultimaEtapa = etapasOrdenadas[etapasOrdenadas.length - 1] ?? null;

    if (ultimaEtapa?.tipo_etapa) {
        return {
            status: null,
            etapaAtual: formatarEtapa(ultimaEtapa.tipo_etapa),
        };
    }

    return {
        status: null,
        etapaAtual: 'Etapa atual',
    };
}

export function formatarDataEvento(evento) {
    const etapas = evento?.etapas || [];
    const etapaMaisProxima = etapas.find(
        (etapa) => etapa?.data_inicio || etapa?.data_fim,
    );

    if (etapaMaisProxima?.data_inicio) {
        const data = new Date(etapaMaisProxima.data_inicio);

        if (!Number.isNaN(data.getTime())) {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).format(data);
        }
    }

    return `ID ${evento?.id ?? '-'}`;
}
