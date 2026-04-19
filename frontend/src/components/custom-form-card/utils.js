import eArray from '../../utils/eArray';

function normalizarErro(valorErro) {
    if (eArray(valorErro)) return valorErro;
    if (typeof valorErro === 'string' && valorErro.trim()) return [valorErro];
    return null;
}

export function obterNomeCampo(campo) {
    return campo?.name ?? campo?.titulo ?? `${campo?.tipo ?? 'campo'}`;
}

export function obterChaveInstancia(id) {
    return String(id).split('-')[0];
}

export function obterErrosCampo(erros, campo, id, indiceGrupo) {
    const nome = campo?.name ?? campo?.titulo;
    if (!nome || !erros) return null;

    const erroSimples = normalizarErro(erros[nome]);
    if (erroSimples) return erroSimples;

    if (
        Number.isInteger(indiceGrupo) &&
        indiceGrupo >= 0 &&
        erros[indiceGrupo]
    ) {
        const erroPorIndice = normalizarErro(erros[indiceGrupo][nome]);
        if (erroPorIndice) return erroPorIndice;
    }

    const idx = Number(obterChaveInstancia(id));
    if (Number.isNaN(idx) || typeof erros !== 'object') return null;

    if (erros[idx]) {
        const erroPorChave = normalizarErro(erros[idx][nome]);
        if (erroPorChave) return erroPorChave;
    }

    return null;
}

export function limparEstadoDaInstancia(estado, chaveInstancia) {
    const prefixo = `${chaveInstancia}-`;
    return Object.fromEntries(
        Object.entries(estado).filter(([chave]) => !chave.startsWith(prefixo)),
    );
}
