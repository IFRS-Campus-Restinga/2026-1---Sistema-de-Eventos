import { useEffect, useState } from 'react';
import {
    listarMinhasInscricoesEventos,
    cancelarInscricaoEvento,
} from '../services/inscricaoEventoService';

export function useMinhasInscricoes(eventos = []) {
    const [inscricoes, setInscricoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;

        async function carregarInscricoes() {
            setCarregando(true);
            setErro('');

            try {
                const dados = await listarMinhasInscricoesEventos();
                if (!ativo) return;
                setInscricoes(Array.isArray(dados) ? dados : []);
            } catch (error) {
                if (!ativo) return;
                console.error('Erro ao carregar minhas inscrições:', error);
                setErro(
                    error?.response?.data?.erro ||
                        error?.message ||
                        'Não foi possível carregar suas participações.',
                );
                setInscricoes([]);
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarInscricoes();

        return () => {
            ativo = false;
        };
    }, []);

    const eventosInscritosIds = new Set(
        inscricoes.map((inscricao) => Number(inscricao.evento_id)),
    );

    const eventosInscritos = eventos.filter((evento) =>
        eventosInscritosIds.has(Number(evento.id)),
    );

    const podeCancelarEvento = (evento) => {
        const etapa = (evento?.etapas || []).find(
            (e) => e.tipo_etapa === 'INSCRICAO_PUBLICO',
        );

        if (!etapa || !etapa.data_inicio || !etapa.data_fim) return false;

        const agora = new Date();
        const inicio = new Date(etapa.data_inicio);
        const fim = new Date(etapa.data_fim);

        return inicio <= agora && agora <= fim;
    };

    const cancelarInscricao = async (inscricaoId) => {
        try {
            await cancelarInscricaoEvento(inscricaoId);
            setInscricoes((prev) =>
                prev.map((i) =>
                    Number(i.id) === Number(inscricaoId)
                        ? { ...i, status: 'CANCELADA' }
                        : i,
                ),
            );
            return true;
        } catch (erro) {
            console.error('Erro ao cancelar inscrição:', erro);
            throw erro;
        }
    };

    return {
        inscricoes,
        eventosInscritos,
        carregando,
        erro,
        podeCancelarEvento,
        cancelarInscricao,
    };
}
