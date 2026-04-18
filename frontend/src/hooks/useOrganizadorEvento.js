import { useState } from 'react';
import {
    definirOrganizadorEvento,
    listarOrganizadoresEvento,
} from '../services/eventoService';

export function useOrganizadorEvento() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [organizadores, setOrganizadores] = useState([]);

    const carregarOrganizadores = async (eventoId) => {
        if (!eventoId) {
            setOrganizadores([]);
            return;
        }

        try {
            const response = await listarOrganizadoresEvento(eventoId);
            setOrganizadores(response?.organizadores || []);
        } catch (erro) {
            console.error('erro ao listar organizadores:', erro);
            setOrganizadores([]);
        }
    };

    const handleDefinirOrganizador = async (eventoId, userId) => {
        if (!eventoId || !userId) {
            setMessage({
                type: 'warning',
                text: 'Selecione um evento e um usuário',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await definirOrganizadorEvento(eventoId, userId);
            setOrganizadores(response?.organizadores || []);
            setMessage({
                type: 'success',
                text: `${response.organizador_adicionado.username} agora é organizador`,
            });
        } catch (erro) {
            console.error('erro:', erro);
            setMessage({
                type: 'danger',
                text: 'Erro ao definir organizador',
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        handleDefinirOrganizador,
        carregarOrganizadores,
        organizadores,
        loading,
        message,
        setMessage,
    };
}