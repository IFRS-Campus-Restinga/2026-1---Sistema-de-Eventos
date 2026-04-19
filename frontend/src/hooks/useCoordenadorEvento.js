import { useState } from 'react';
import {
    definirCoordenadorEvento,
    listarCoordenadoresEvento,
    removerCoordenadorEvento,
} from '../services/eventoService';

export function useCoordenadorEvento() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [coordenadores, setCoordenadores] = useState([]);

    const carregarCoordenadores = async (eventoId) => {
        if (!eventoId) {
            setCoordenadores([]);
            return;
        }

        try {
            const response = await listarCoordenadoresEvento(eventoId);
            setCoordenadores(response?.coordenadores || []);
        } catch (erro) {
            console.error('erro ao listar coordenadores:', erro);
            setCoordenadores([]);
        }
    };

    const handleDefinirCoordenador = async (eventoId, userId) => {
        if (!eventoId || !userId) {
            setMessage({
                type: 'warning',
                text: 'Selecione um evento e um usuário',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await definirCoordenadorEvento(eventoId, userId);
            setCoordenadores(response?.coordenadores || []);
            setMessage({
                type: 'success',
                text: `${response.coordenador.username} agora é coordenador`,
            });
        } catch (erro) {
            console.error('erro:', erro);
            setMessage({
                type: 'danger',
                text: 'Erro ao definir coordenador',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoverCoordenador = async (eventoId, userId) => {
        if (!eventoId || !userId) {
            setMessage({
                type: 'warning',
                text: 'Selecione um coordenador para remover',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await removerCoordenadorEvento(eventoId, userId);
            setCoordenadores(response?.coordenadores || []);
            setMessage({
                type: 'success',
                text: `${response.coordenador_removido.username} REMOVIDO de coordenadores`,
            });
        } catch (erro) {
            console.error('erro ao remover coordenador:', erro);
            setMessage({
                type: 'danger',
                text: 'Erro ao remover coordenador',
            });
        } finally {
            setLoading(false);
        }
    };

    return { handleDefinirCoordenador,
        handleRemoverCoordenador,
        carregarCoordenadores,
        coordenadores,
        loading,
        message,
        setMessage };
}