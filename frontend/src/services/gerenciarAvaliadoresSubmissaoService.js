import axios from 'axios';
import { API_URL } from '../config';
import { listarAvaliadoresPorSubmissao } from './submissaoAvaliadorService';
import {
    listarAvaliacoesSubmissao,
    listarItensAvaliacaoSubmissao,
} from './avaliacaoSubmissaoService';

export const listarSubmissoesEvento = async (eventoId) => {
    // Reutiliza o endpoint de submissoes filtrando por evento
    const response = await axios.get(`${API_URL}/api/submissoes/`, {
        params: { evento: eventoId },
        withCredentials: true,
    });
    return response.data;
};

export const listarUsuariosServidores = async (texto) => {
    const response = await axios.get(`${API_URL}/api/users/servidores/`, {
        params: texto ? { q: texto } : {},
        withCredentials: true,
    });
    return response.data;
};

export const listarEventos = async () => {
    const response = await axios.get(`${API_URL}/api/eventos/`, {
        withCredentials: true,
    });
    return response.data;
};

export const listarModalidades = async () => {
    const response = await axios.get(`${API_URL}/api/modalidades/`, {
        withCredentials: true,
    });
    return response.data;
};

export const listarCriteriosSubmissao = async () => {
    const response = await axios.get(
        `${API_URL}/api/criterio_avaliacao_submissao/`,
        { withCredentials: true },
    );
    return response.data;
};

export default {
    listarSubmissoesEvento,
    listarUsuariosServidores,
    listarEventos,
    listarModalidades,
    listarAvaliadoresSubmissao: listarAvaliadoresPorSubmissao,
    listarAvaliacoes: listarAvaliacoesSubmissao,
    listarItensAvaliacao: listarItensAvaliacaoSubmissao,
    listarCriteriosSubmissao,
};
