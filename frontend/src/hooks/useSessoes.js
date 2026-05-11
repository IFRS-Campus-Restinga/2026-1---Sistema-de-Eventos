import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import { buscarEventoPorId } from '../services/eventoService';

//pegar service quando existir

export default function useSessoes() {
    const [evento, setEvento] = useState(null);
    const [espaco, setEspaco] = useState([null]);
    const [dias, setDias] = useState([]);

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

    return {
        evento,
        espaco,
        dias,
        loading,
        error,
        message,
        carregarEvento,
    };
}
