import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarCriterioAvaliacaoSubmissao,
    criarCriterioAvaliacaoSubmissao,
} from '../services/criterioAvaliacaoSubmissaoService';

export const useCriterioAvaliacaoSubmissao = () => {
    const [criteriosSubmissao, setCriteriosSubmissao] = useState([]);

    useEffect(() => {
        async function buscarCriteriosSubmissao() {
            try {
                const data = await pegarCriterioAvaliacaoSubmissao();
                const lista = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setCriteriosSubmissao(lista);
            } catch (erro) {
                console.error('erro', erro);
                setCriteriosSubmissao([]);
            }
        }
        buscarCriteriosSubmissao();
    }, []);

    const criarCriteriosSubmissao = async (e) => {
        try {
            const response = await criarCriterioAvaliacaoSubmissao(e);
            return response;
        } catch (erro) {
            console.log(erro);
        }
    };

    return { criteriosSubmissao, criarCriteriosSubmissao };
};
