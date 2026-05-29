// src/utils/themeTags.js

/**
 * Dicionário centralizado de cores para as tags do sistema.
 * Mapeia o termo chave encontrado na tag para sua respectiva cor em formato Hexadecimal.
 */
export const CORES_TAGS = {
    oficina: '#EAB308', // Amarelo
    palestra: '#5ce9ba', // Verde
    poster: '#ff8b2d', // Laranja
    engenharia: '#EF4444', // Vermelho
    apresentacao: '#3B82F6', // Azul
    exatas: '#212529', // Escuro/Preto
    performance: '#DB2777', // Rosa
    artes: '#8B5CF6', // Roxo
    letras: '#8B5CF6', // Roxo (mesma categoria de artes)
    informatica: '#06B6D4', // Ciano
    tecnologia: '#111827', // Grafite Escuro
    padrao: '#6B7280', // Cinza para tags genéricas
};

/**
 * Função utilitária para descobrir a cor de uma tag com base no texto dela.
 * Remove acentos e espaços para evitar quebras por digitação.
 *
 * @param {string} texto - O texto da tag (ex: "Apresentação Oral")
 * @returns {string} Código da cor em Hexadecimal
 */
export const obterCorPorTag = (texto) => {
    if (!texto) return CORES_TAGS.padrao;

    // Trata a string: remove acentos, espaços nas pontas e deixa em minúsculo
    const textoLimpo = texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    // Busca se alguma das chaves configuradas está contida no texto da tag
    const chaveEncontrada = Object.keys(CORES_TAGS).find((chave) =>
        textoLimpo.includes(chave),
    );

    return CORES_TAGS[chaveEncontrada] || CORES_TAGS.padrao;
};
