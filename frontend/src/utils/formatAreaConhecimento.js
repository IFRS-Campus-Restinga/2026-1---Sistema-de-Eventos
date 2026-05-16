const MAP = {
    // coloque mapeamentos específicos aqui quando necessário, exemplo:
    // 'CIENCIAS_EXATAS': 'Ciências Exatas',
};

function humanizeToken(token) {
    if (!token) return '';
    const s = String(token).replace(/_/g, ' ').toLowerCase();
    return s
        .split(' ')
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : ''))
        .join(' ');
}

export default function formatAreaConhecimento(value) {
    if (value === null || value === undefined) return null;
    // arrays of areas
    if (Array.isArray(value)) {
        return value.map((v) => formatAreaConhecimento(v)).join(', ');
    }

    const key = String(value);
    if (MAP[key]) return MAP[key];

    // already readable
    if (key.indexOf('_') === -1 && /[a-z]/.test(key)) return key;

    return humanizeToken(key);
}
