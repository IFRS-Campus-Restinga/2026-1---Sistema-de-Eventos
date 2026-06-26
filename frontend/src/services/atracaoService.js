import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';
import { API_URL } from '../config';

const CAMPOS_ATRACAO = [
    'fluxo_direto_atracao',
    'titulo',
    'resumo',
    'palavras_chave',
    'modalidade',
    'nivel_ensino',
    'area_conhecimento',
    'anexo_pdf',
    'acessibilidade',
    'evento',
    'status',
    'sugestao_vagas',
    'vagas_disponiveis',
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
            const equipeNormalizada = Array.isArray(dados[key])
                ? dados[key].map((membro, index) => ({
                      user_id: membro?.user_id || null,
                      nome: membro?.nome || '',
                      instituicao_curso: membro?.instituicao_curso || '',
                      funcao: membro?.funcao || '',
                      ordem: index + 1,
                  }))
                : [];

            payload.append('equipe_json', JSON.stringify(equipeNormalizada));

            const autoriaNormalizada = equipeNormalizada
                .filter((membro) => String(membro?.user_id || '').trim() !== '')
                .map((membro) => ({
                    usuario: Number(membro.user_id),
                    tipo: membro.funcao,
                    ordem: membro.ordem,
                }));

            payload.append('autoria_json', JSON.stringify(autoriaNormalizada));
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

        if (key === 'sugestao_vagas' || key === 'vagas_disponiveis') {
            const valor = dados[key];
            if (valor === '' || valor === null || valor === undefined) return;
            payload.append(key, Number(valor));
            return;
        }

        if (dados[key] !== null && dados[key] !== undefined) {
            payload.append(key, dados[key]);
        }
    });

    return payload;
};

export const listarAtracoes = async (eventoId = null, params = {}) => {
    const queryParams = eventoId
        ? { evento: eventoId, ...params }
        : { ...params };
    const response = await axios.get(`${API_URL}/api/atracoes/`, {
        params: queryParams,
    });
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

export const buscarUsuarios = async (q, options = {}) => {
    const mode = options?.mode || 'elegiveis';
    const limit = options?.limit || 200;

    const endpoint =
        mode === 'servidores'
            ? `${API_URL}/api/users/servidores/`
            : `${API_URL}/api/users/elegiveis/`;

    const params = {
        ...(q ? { q } : {}),
    };

    if (mode !== 'servidores') {
        params.limit = limit;
    }

    const response = await axios.get(endpoint, {
        params,
        withCredentials: true,
    });
    return response.data;
};

export const listarEquipeAtracao = async (atracaoId) => {
    if (!atracaoId) return { equipe: [] };

    const response = await axios.get(
        `${API_URL}/api/atracoes/${atracaoId}/equipe/`,
        {
            withCredentials: true,
        },
    );

    return response.data;
};

export const definirMembroEquipeAtracao = async (
    atracaoId,
    { user_id, funcao, instituicao_curso = '' },
) => {
    if (!atracaoId || !user_id || !funcao) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.patch(
        `${API_URL}/api/atracoes/${atracaoId}/equipe/`,
        { user_id, funcao, instituicao_curso },
        {
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};

export const removerMembroEquipeAtracao = async (atracaoId, userId) => {
    if (!atracaoId || !userId) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const response = await axios.delete(
        `${API_URL}/api/atracoes/${atracaoId}/equipe/`,
        {
            data: { user_id: userId },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
        },
    );

    return response.data;
};
