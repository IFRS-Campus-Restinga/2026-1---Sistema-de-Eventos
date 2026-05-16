const MAP = {
    ENSINO_MEDIO_INTEGRADO: 'Ensino Médio Integrado',
    SUBSEQUENTE: 'Subsequente',
    GRADUACAO: 'Graduação',
    POS_GRADUACAO: 'Pós Graduação',
    MESTRADO: 'Mestrado',
    LIVRE: 'Livre',
};

export default function formatNivelEnsino(value) {
    if (!value && value !== 0) return null;
    if (
        typeof value === 'string' &&
        value.indexOf('_') === -1 &&
        value.length > 0 &&
        (value === value.toLowerCase()) === false
    ) {
        return value;
    }
    return MAP[String(value)] || String(value || '');
}
