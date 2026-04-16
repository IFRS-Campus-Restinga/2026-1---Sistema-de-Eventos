import axios from 'axios';
import { API_URL } from '../config';

const cacheOptions = new Map();

function buildUrl(path) {
    if (!path) return API_URL;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (!path.startsWith('/')) path = '/' + path;
    return `${API_URL}${path}`;
}

export async function pegarOptions(path) {
    const url = buildUrl(path);
    if (cacheOptions.has(url)) return cacheOptions.get(url);
    try {
        const resp = await axios.options(url);
        const data = resp.data;
        cacheOptions.set(url, data);
        return data;
    } catch (err) {
        console.error('erro pegarOptions', url, err);
        throw err;
    }
}

function validarComSchema(schema, payload, method = 'POST') {
    const erros = {};
    const metodo = String(method || 'POST').toUpperCase();
    const camposSchema =
        schema?.actions?.[metodo] ||
        schema?.actions?.POST ||
        schema?.actions?.PUT ||
        schema?.actions?.PATCH;

    if (!camposSchema) {
        return { valido: true, erros: {} };
    }

    function adicionarErro(chave, mensagem) {
        if (!erros[chave]) erros[chave] = [];
        erros[chave].push(mensagem);
    }

    Object.keys(camposSchema).forEach((campo) => {
        const regras = camposSchema[campo];
        const valor = payload?.[campo];

        if (
            regras.required &&
            (valor === undefined || valor === null || valor === '')
        ) {
            adicionarErro(campo, 'Campo obrigatório');
            return;
        }

        if (valor === undefined || valor === null || valor === '') return;

        if (regras.type === 'string') {
            if (regras.min_length && String(valor).length < regras.min_length) {
                adicionarErro(
                    campo,
                    `Deve ter ao menos ${regras.min_length} caracteres`,
                );
            }
            if (regras.max_length && String(valor).length > regras.max_length) {
                adicionarErro(
                    campo,
                    `Deve ter no máximo ${regras.max_length} caracteres`,
                );
            }
        }

        if (regras.type === 'integer' || regras.type === 'number') {
            const num = Number(valor);
            if (Number.isNaN(num)) {
                adicionarErro(campo, 'Deve ser um número');
            } else {
                if (regras.min_value !== undefined && num < regras.min_value) {
                    adicionarErro(campo, `Valor mínimo ${regras.min_value}`);
                }
                if (regras.max_value !== undefined && num > regras.max_value) {
                    adicionarErro(campo, `Valor máximo ${regras.max_value}`);
                }
            }
        }

        if (
            regras.type === 'choice' &&
            regras.choices &&
            Array.isArray(regras.choices)
        ) {
            const choices = regras.choices.map((c) => String(c.value));
            if (!choices.includes(String(valor))) {
                adicionarErro(campo, 'Valor inválido');
            }
        }

        if (
            regras.child &&
            regras.child.type &&
            regras.child.type.includes('nested') &&
            Array.isArray(valor)
        ) {
            const childSchema = regras.child.children || {};
            valor.forEach((item, idx) => {
                Object.keys(childSchema).forEach((subcampo) => {
                    const subRegras = childSchema[subcampo];
                    const v = item?.[subcampo];
                    if (
                        subRegras.required &&
                        (v === undefined || v === null || v === '')
                    ) {
                        if (!erros[campo]) erros[campo] = {};
                        if (!erros[campo][idx]) erros[campo][idx] = {};
                        if (!erros[campo][idx][subcampo])
                            erros[campo][idx][subcampo] = [];
                        erros[campo][idx][subcampo].push('Campo obrigatório');
                        return;
                    }
                    if (v === undefined || v === null || v === '') return;
                    if (subRegras.type === 'string') {
                        if (
                            subRegras.min_length &&
                            String(v).length < subRegras.min_length
                        ) {
                            if (!erros[campo]) erros[campo] = {};
                            if (!erros[campo][idx]) erros[campo][idx] = {};
                            if (!erros[campo][idx][subcampo])
                                erros[campo][idx][subcampo] = [];
                            erros[campo][idx][subcampo].push(
                                `Deve ter ao menos ${subRegras.min_length} caracteres`,
                            );
                        }
                        if (
                            subRegras.max_length &&
                            String(v).length > subRegras.max_length
                        ) {
                            if (!erros[campo]) erros[campo] = {};
                            if (!erros[campo][idx]) erros[campo][idx] = {};
                            if (!erros[campo][idx][subcampo])
                                erros[campo][idx][subcampo] = [];
                            erros[campo][idx][subcampo].push(
                                `Deve ter no máximo ${subRegras.max_length} caracteres`,
                            );
                        }
                    }
                });
            });
        }
    });

    const valido = Object.keys(erros).length === 0;
    return { valido, erros };
}

export async function validarComOptions(path, payload, method = 'POST') {
    try {
        const schema = await pegarOptions(path);
        return validarComSchema(schema, payload, method);
    } catch (err) {
        // se falhar ao obter schema, considera válido (deixa o backend validar)
        console.warn(
            'validarComOptions: não foi possível obter OPTIONS, pulando validação',
            err,
        );
        return { valido: true, erros: {} };
    }
}

export default {
    pegarOptions,
    validarComOptions,
};
