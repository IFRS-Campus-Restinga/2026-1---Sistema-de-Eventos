import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import { buscarEventoPorId } from '../services/eventoService';
import {
    criarSessao,
    atualizarSessao,
    pegarSessao,
    pegarSessoes,
    salvarOrdensSessao,
} from '../services/sessoesService';

export default function useSessoes() {
    const [evento, setEvento] = useState(null);
    const [espaco, setEspaco] = useState([null]);
    const [dias, setDias] = useState([]);
    const [dia, setDia] = useState(null);

    const [sessoes, setSessoes] = useState([]);
    const [sessaoSelecionada, setSessaoSelecionada] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const carregarEvento = async (eventoId) => {
        try {
            setLoading(true);
            const data = await buscarEventoPorId(eventoId);

            setEvento(data);

            console.log('(useSessoes)Evento:', data);

            // filtrar a etapa do evento por REALIZACAO_EVENTO
            const etapa = data?.etapas?.find(
                (e) => e.tipo_etapa === 'REALIZACAO_EVENTO',
            );
            try {
                if (etapa) {
                    const diasRange = gerarDias(
                        etapa.data_inicio,
                        etapa.data_fim,
                    );
                    setDias(diasRange);
                }
            } catch (erro) {
                setError('Erro: evento deve ter uma etapa de realização');
                console.error('Erro ao processar evento:', erro);
                setDias(false);
            }
        } catch (erro) {
            console.error('Erro ao buscar evento:', erro);
        } finally {
            setLoading(false);
        }
    };

    // gerar lista de dias entre datas(etapa_evento)
    function gerarDias(inicio, fim) {
        const dias = [];

        let dataInicio = new Date(inicio);
        const dataFim = new Date(fim);

        while (dataInicio <= dataFim) {
            dias.push(new Date(dataInicio));
            dataInicio.setDate(dataInicio.getDate() + 1);
        }

        return dias;
    }

    const fetchSessoes = async (eventoId = null) => {
        setLoading(true);
        setError(null);

        try {
            const data = await pegarSessoes(eventoId);

            const listaSessoes = eArray(data)
                ? data
                : eArray(data?.results)
                  ? data.results
                  : [];

            setSessoes(listaSessoes);

            return listaSessoes;
        } catch (erro) {
            console.error('Erro ao carregar sessões:', erro);

            setError('Erro ao carregar sessões');

            setSessoes([]);
        } finally {
            setLoading(false);
        }
    };

    const buscarSessao = async (id) => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const data = await pegarSessao(id);

            setSessaoSelecionada(data);

            return data;
        } catch (erro) {
            console.error('Erro ao buscar sessão:', erro);

            setError('Erro ao buscar sessão');
        } finally {
            setLoading(false);
        }
    };

    const adicionaSessao = async (dados) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const novaSessao = await criarSessao(dados);
            setSessoes((prev) => [...prev, novaSessao]);

            setMessage('Sessão criada com sucesso');
            return novaSessao;
        } catch (erro) {
            console.error('Erro ao criar sessão:', erro);
            setError(erro.response?.data || 'Erro ao criar sessão');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const editarSessao = async (id, dados) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const sessaoAtualizada = await atualizarSessao(id, dados);

            setSessoes((prev) =>
                prev.map((sessao) =>
                    sessao.id === id ? sessaoAtualizada : sessao,
                ),
            );

            setMessage('Sessão atualizada com sucesso');

            return sessaoAtualizada;
        } catch (erro) {
            console.error('Erro ao atualizar sessão:', erro);

            setError(erro.response?.data || 'Erro ao atualizar sessão');

            return null;
        } finally {
            setLoading(false);
        }
    };

    const salvarOrdemApresentacoes = async (sessao) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            setLoading(true);

            const dados = {
                sessao: sessao.id,
                ordens: (sessao.ordem_apresentacoes || []).map(
                    (item, index) => ({
                        atracao: item.atracao.id,
                        ordem: index + 1,
                    }),
                ),
            };

            await salvarOrdensSessao(dados);

            setMessage('Ordem salva com sucesso');

            return true;
        } catch (err) {
            setError('Erro ao salvar ordem');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        evento,
        espaco,
        dias,

        loading,
        error,
        message,

        sessoes,
        sessaoSelecionada,

        fetchSessoes,
        buscarSessao,
        editarSessao,
        carregarEvento,
        adicionaSessao,
        salvarOrdemApresentacoes,
    };
}
