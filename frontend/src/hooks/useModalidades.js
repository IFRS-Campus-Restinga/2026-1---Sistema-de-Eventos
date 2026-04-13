import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import { pegarModalidades } from '../services/modalidadeService';

export function useModalidades() {
    const [modalidades, setModalidades] = useState([]);

    useEffect(() => {
        async function fetchModalidades() {
            try {
                const data = await pegarModalidades();
                console.log(data);
                const listaModalidades = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setModalidades(listaModalidades);
            } catch (erro) {
                console.error('erro', erro);
                setModalidades([]);
            }
        }
        fetchModalidades();
    }, []);
    return { modalidades: modalidades };
}
