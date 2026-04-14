import { useEffect, useState } from 'react';

import { listarEventos } from '../services/eventoService';

export function useEventos() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return { eventos, loading };
}