import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarCriterioAvaliacaoAtracao,
    criarCriterioAvaliacaoAtracao,
} from '../services/criterioAvaliacaoAtracaoService';

export const useCriterioAvaliacaoAtracao = () => {
    const [campoFormulario, setCampoFormulario] = useState([]);

    useEffect(() => {
        async function buscarMCriteriosAvalicao() {
            try {
                const data = await pegarCriterioAvaliacaoAtracao();
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

    const criarCriteriosAvaliacaoAtracao = async (e) => {
        try {
            const response = await criarCriterioAvaliacaoAtracao(e);

            return response;
        } catch (erro) {
            console.log(erro);
        }
    };
    return { campoFormulario, criarCriteriosAvaliacaoAtracao };
};
