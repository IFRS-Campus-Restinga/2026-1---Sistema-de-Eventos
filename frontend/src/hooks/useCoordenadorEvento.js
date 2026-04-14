import { useState } from 'react';
import { definirCoordenadorEvento } from '../services/eventoService';

export function useCoordenadorEvento() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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

    return { handleDefinirCoordenador, 
        loading, 
        message, 
        setMessage };
}