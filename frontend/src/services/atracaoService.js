import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

const CAMPOS_ATRACAO = [
    'titulo',
    'resumo',
    'palavras_chave',
    'modalidade',
    'nivel_ensino',
    'area_conhecimento',
    'orientador',
    'sou_orientador',
    'anexo_pdf',
    'acessibilidade',
    'evento',
    'status',
    'sugestao_vagas',
    'data_hora_inicio',
    'data_hora_fim',
    'local_atracao',
    'equipe',
    'respostas_campos',
];

const normalizarRespostasCampos = (respostas) => {
    if (!respostas || typeof respostas !== 'object') {
        return {};
    }

    return Object.entries(respostas).reduce((acc, [chave, valor]) => {
        if (valor === null || valor === undefined) {
            return acc;
        }

        if (valor instanceof File || valor instanceof Blob) {
            return acc;
        }

        if (typeof valor === 'string' && valor.trim() === '') {
            return acc;
        }

        acc[chave] = valor;
        return acc;
    }, {});
};

const montarPayloadAtracao = (dados) => {
    const payload = new FormData();

    CAMPOS_ATRACAO.forEach((key) => {
        if (!(key in dados)) {
            return;
        }

        if (key === 'equipe') {
            payload.append('equipe_json', JSON.stringify(dados[key]));
            return;
        }

        if (key === 'respostas_campos') {
            payload.append(
                'respostas_campos_json',
                JSON.stringify(normalizarRespostasCampos(dados[key])),
            );
            return;
        }

        if (key === 'anexo_pdf') {
            const arquivo = dados[key];
            if (arquivo instanceof File || arquivo instanceof Blob) {
                payload.append(key, arquivo);
            }
            return;
        }

        if (key === 'nivel_ensino') {
            const niveis = Array.isArray(dados[key])
                ? dados[key].filter((item) => String(item || '').trim() !== '')
                : String(dados[key] || '')
                      .split(',')
                      .map((item) => item.trim())
                      .filter((item) => item !== '');

            payload.append(key, niveis.join(','));
            return;
        }

        if (key === 'sugestao_vagas') {
            const valor = dados[key];
            if (valor === '' || valor === null || valor === undefined) {
                return;
            }
            payload.append(key, Number(valor));
            return;
        }

        if (dados[key] !== null && dados[key] !== undefined) {
            payload.append(key, dados[key]);
        }
    });

    return payload;
};

export const listarAtracoes = async (eventoId = null) => {
    const params = eventoId ? { evento: eventoId } : {};
    const response = await axios.get(`${API_URL}/api/atracoes/`, { params });
    return response.data;
};

export const criarAtracao = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.post(`${API_URL}/api/atracoes/`, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
    });
    return response.data;
};

export const salvarRascunho = async (dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.post(`${API_URL}/api/atracoes/`, payload, {
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
    });
    return response.data;
};

export const editarAtracao = async (id, dados) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const payload = montarPayloadAtracao(dados);

    const response = await axios.put(
        `${API_URL}/api/atracoes/${id}/`,
        payload,
        {
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
        },
    );

    return response.data;
};

export const excluirAtracao = async (id) => {
    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    await axios.delete(`${API_URL}/api/atracoes/${id}/`, {
        headers: {
            'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
    });
};

export const buscarOpcoesAtracao = async () => {
    const response = await axios.get(`${API_URL}/api/atracoes/opcoes/`, {
        withCredentials: true,
    });
    return response.data;
};

export const buscarEventos = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/`, {
        withCredentials: true,
    });
    return response.data;
};

export const buscarUsuarios = async (q) => {
    // apenas servidores/avaliadores, aceita parâmetro q para busca
    const response = await axios.get(`${API_URL}/api/users/servidores/`, {
        params: q ? { q } : {},
        withCredentials: true,
    });
    return response.data;
};
