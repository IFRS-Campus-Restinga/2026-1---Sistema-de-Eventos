import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import { pegarEspacos } from '../services/espacoService';

export function useEspacos() {
    const [espacos, setEspacos] = useState([]);

    useEffect(() => {
        async function fetchEspacos() {
            try {
                const data = await pegarEspacos();
                const listaEspacos = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setEspacos(listaEspacos);
            } catch (erro) {
                console.error('erro', erro);
                setEspacos([]);
            }
        }
        fetchEspacos();
    }, []);
    return { espacos };
}
