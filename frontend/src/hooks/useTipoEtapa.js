import { useState, useEffect } from 'react';
import { pegarTipoEtapa } from '../services/tipoEtapaService';
import eArray from '../utils/eArray';

export const useTipoEtapa = () => {
    const [tipoEtapas, setEtapas] = useState([]);

    useEffect(() => {
        async function buscarTipoEtapa() {
            try {
                const data = await pegarTipoEtapa();

                const lista = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setEtapas(lista);
            } catch (erro) {
                console.error('erro', erro);
                setEtapas([]);
            }
        }

        buscarTipoEtapa();
    }, []);

    return { tipoEtapas };
};
