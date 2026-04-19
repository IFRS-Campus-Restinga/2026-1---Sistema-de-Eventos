import { useState } from 'react';
import {
    definirOrganizadorEvento,
    listarOrganizadoresEvento,
    removerOrganizadorEvento,
} from '../services/eventoService';

export function useOrganizadorEvento() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [organizadores, setOrganizadores] = useState([]);
    const [organizadoresErro, setOrganizadoresErro] = useState('');

    const carregarOrganizadores = async (eventoId) => {
        if (!eventoId) {
            setOrganizadores([]);
            setOrganizadoresErro('');
            return;
        }

        setOrganizadoresErro('');

        try {
            const response = await listarOrganizadoresEvento(eventoId);
            setOrganizadores(response?.organizadores || []);
        } catch (erro) {
            const statusCode = erro?.response?.status;
            let textoErro = 'Erro ao carregar organizadores deste evento.';

            if (statusCode === 404) {
                textoErro = 'Evento não encontrado para listar organizadores.';
            }

            console.error('erro ao listar organizadores:', erro);
            setOrganizadores([]);
            setOrganizadoresErro(textoErro);
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
            setOrganizadoresErro('');
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

    const handleRemoverOrganizador = async (eventoId, userId) => {
        if (!eventoId || !userId) {
            setMessage({
                type: 'warning',
                text: 'Selecione um organizador para remover',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await removerOrganizadorEvento(eventoId, userId);
            setOrganizadores(response?.organizadores || []);
            setOrganizadoresErro('');
            setMessage({
                type: 'success',
                text: `${response.organizador_removido.username} REMOVIDO de organizadores`,
            });
        } catch (erro) {
            console.error('erro ao remover organizador:', erro);
            setMessage({
                type: 'danger',
                text: 'Erro ao remover organizador',
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        handleDefinirOrganizador,
        handleRemoverOrganizador,
        carregarOrganizadores,
        organizadores,
        organizadoresErro,
        loading,
        message,
        setMessage,
    };
}