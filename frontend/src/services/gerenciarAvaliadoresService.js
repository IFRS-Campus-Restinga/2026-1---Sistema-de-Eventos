import {
    listarAtracoes,
    buscarUsuarios,
    buscarEventos,
} from './atracaoService';
import { pegarModalidades } from './modalidadeService';
import { listarAvaliadoresPorAtracao } from './atracaoAvaliadorService';
import {
    listarAvaliacoesAtracao,
    listarItensAvaliacaoAtracao,
} from './avaliacaoAtracaoService';
import { pegarCriterioAvaliacaoAtracao } from './criterioAvaliacaoAtracaoService';

export const listarAtracoesEvento = async (eventoId) =>
    listarAtracoes(eventoId);

export const listarUsuariosServidores = async (texto) => buscarUsuarios(texto);

export const listarEventos = async () => buscarEventos();

export const listarModalidades = async () => pegarModalidades();

export const listarAvaliadoresAtracao = async (atracaoId) =>
    listarAvaliadoresPorAtracao(atracaoId);

export const listarAvaliacoes = async (params) =>
    listarAvaliacoesAtracao(params);

export const listarItensAvaliacao = async (avaliacaoId) =>
    listarItensAvaliacaoAtracao(avaliacaoId);

export const listarCriteriosAtracao = async () =>
    pegarCriterioAvaliacaoAtracao();

export default {
    listarAtracoesEvento,
    listarUsuariosServidores,
    listarEventos,
    listarModalidades,
    listarAvaliadoresAtracao,
    listarAvaliacoes,
    listarItensAvaliacao,
    listarCriteriosAtracao,
};
