import { useState, useEffect } from 'react';
import { pegarTipoCampo } from '../services/tipoCampoService';
import eArray from '../utils/eArray';

export const useTipoCampo = () => {
    const [tipoCampo, setTipoCampo] = useState([]);

    useEffect(() => {
        async function buscarTipoCampos() {
            try {
                const data = await pegarTipoCampo();

                const listaTipos = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setTipoCampo(listaTipos);
            } catch (erro) {
                console.error('erro', erro);
                setTipoCampo([]);
            }
        }

        buscarTipoCampos();
    }, []);

    return { tipoCampo };
};
