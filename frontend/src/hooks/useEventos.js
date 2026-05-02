import { useCallback, useEffect, useState } from 'react';

import {
    criarEvento,
    listarEventos,
    atualizarEvento,
    deletarEvento,
} from '../services/eventoService';
import { criarEtapa } from '../services/etapaEventoService';

export function useEventos() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        async function fetchEventos() {
            setLoading(true);
            try {
                const data = await listarEventos();
                setEventos(data);
            } catch (erro) {
                console.error('erro', erro);
            } finally {
                setLoading(false);
            }
        }

        fetchEventos();
    }, []);

    const criarEventos = useCallback(
        async (dadosEvento, fases = [], modalidades = []) => {
            setLoading(true);
            setErro(null);

            try {
                const eventoData = await criarEvento(dadosEvento);
                const eventoId = eventoData?.id;

                if (!eventoId) {
                    throw new Error('Evento criado mas sem ID retornado');
                }

                const etapas = [];
                for (const fase of fases) {
                    const dadosEtapa = {
                        tipo_etapa: fase.tipo,
                        data_inicio: fase.inicio,
                        data_fim: fase.fim,
                        evento_id: eventoId,
                    };

                    const etapaData = await criarEtapa(dadosEtapa);
                    etapas.push(etapaData);
                }

                // Associar modalidades ao evento se houver
                let modalidadesAssociadas = [];
                if (modalidades && modalidades.length > 0) {
                    const idsModalidades = modalidades.map(
                        (m) => m.value || m.id,
                    );

                    // Atualizar evento com as modalidades
                    const eventoAtualizado = await atualizarEvento(eventoId, {
                        ...dadosEvento,
                        modalidade_ids: idsModalidades,
                    });
                    modalidadesAssociadas = eventoAtualizado?.modalidades || [];
                }

                return {
                    evento: eventoData,
                    etapas,
                    modalidadesAssociadas,
                };
            } catch (erro) {
                console.error('Erro ao criar evento:', erro);
                setErro(
                    erro?.response?.data?.detail ||
                        erro?.message ||
                        'Erro ao criar evento',
                );
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const atualizarEventos = useCallback(async (eventoId, dadosEvento) => {
        setLoading(true);
        setErro(null);

        try {
            const eventoData = await atualizarEvento(eventoId, dadosEvento);

            return eventoData;
        } catch (erro) {
            console.error('Erro ao atualizar evento:', erro);
            setErro(
                erro?.response?.data?.detail ||
                    erro?.message ||
                    'Erro ao atualizar evento',
            );
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletarEventos = useCallback(async (eventoId) => {
        setLoading(true);
        setErro(null);

        try {
            await deletarEvento(eventoId);
            setEventos((anterior) =>
                anterior.filter((evento) => evento.id !== eventoId),
            );

            return true;
        } catch (erro) {
            console.error('Erro ao deletar evento:', erro);
            setErro(
                erro?.response?.data?.detail ||
                    erro?.message ||
                    'Erro ao deletar evento',
            );
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        eventos,
        loading,
        erro,
        criarEventos,
        atualizarEventos,
        deletarEventos,
    };
}
