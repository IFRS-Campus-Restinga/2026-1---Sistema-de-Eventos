import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarCriterioAvaliacao,
    criarCriterioAvaliacao,
} from '../services/criterioAvaliacaoService';

export const useCriterioAvaliacao = () => {
    const [campoFormulario, setCampoFormulario] = useState([]);

    useEffect(() => {
        async function buscarMCriteriosAvalicao() {
            try {
                const data = await pegarCriterioAvaliacao();
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
        buscarMCriteriosAvalicao();
    }, []);

    const criarCriteriosAvaliacao = async (e) => {
        try {
            const response = await criarCriterioAvaliacao(e);

            return response;
        } catch (erro) {
            console.log(erro);
        }
    };
    return { campoFormulario, criarCriteriosAvaliacao };
};
