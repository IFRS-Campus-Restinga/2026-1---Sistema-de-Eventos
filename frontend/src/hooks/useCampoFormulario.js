import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarCampoFormulario,
    criarCampoFormulario,
} from '../services/campoFormularioService';

export const useCampoFormulario = () => {
    const [campoFormulario, setCampoFormulario] = useState([]);

    useEffect(() => {
        async function buscarModalidades() {
            try {
                const data = await pegarCampoFormulario();
                const listaModalidades = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setCampoFormulario(listaModalidades);
            } catch (erro) {
                console.error('erro', erro);
                setCampoFormulario([]);
            }
        }
        buscarModalidades();
    }, []);

    const criarCampoFormularios = async (e) => {
        try {
            const response = await criarCampoFormulario(e);

            return response;
        } catch (erro) {
            console.log(erro);
        }
    };
    return { campoFormulario, criarCampoFormularios };
};
