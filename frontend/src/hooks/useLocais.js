import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import { pegarLocais } from '../services/localService';

export function useLocais() {
    const [locais, setLocais] = useState([]);

    useEffect(() => {
        async function fetchLocais() {
            try {
                const data = await pegarLocais();
                const listaLocais = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setLocais(listaLocais);
            } catch (erro) {
                console.error('erro', erro);
                setLocais([]);
            }
        }
        fetchLocais();
    }, []);
    return { locais };
}
