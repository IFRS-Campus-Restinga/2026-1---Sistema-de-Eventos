const MAP = {
    ENSINO_MEDIO_INTEGRADO: 'Ensino Médio Integrado',
    SUBSEQUENTE: 'Subsequente',
    GRADUACAO: 'Graduação',
    POS_GRADUACAO: 'Pós Graduação',
    MESTRADO: 'Mestrado',
    LIVRE: 'Livre',
};

function humanizeToken(token) {
    if (!token) return '';
    const s = String(token).replace(/_/g, ' ').toLowerCase();
    return s
        .split(' ')
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : ''))
        .join(' ');
}

export default function formatNivelEnsino(value) {
    if (!value && value !== 0) return null;

    if (Array.isArray(value)) {
        const itens = value
            .map((item) => formatNivelEnsino(item))
            .filter((item) => item);
        return itens.join(', ');
    }

    if (typeof value === 'string' && value.includes(',')) {
        const itens = value
            .split(',')
            .map((item) => formatNivelEnsino(item.trim()))
            .filter((item) => item);
        return itens.join(', ');
    }

    if (typeof value === 'string' && value.indexOf('_') === -1) {
        const hasLowercase = /[a-z]/.test(value);
        if (hasLowercase) return value;
    }
    const key = String(value || '');
    if (MAP[key]) return MAP[key];
    if (key.indexOf('_') >= 0) return humanizeToken(key);
    return key;
}
