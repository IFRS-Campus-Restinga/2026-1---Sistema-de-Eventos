import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarEspacos,
    pegarEspaco,
    atualizarEspaco,
    criarEspaco,
} from '../services/espacoService';

export function useEspacos() {
    const [idLocalSelecionado, setIdLocalSelecionado] = useState(null); //pega o idlocal selecionado no dropdown
    const [localSelecionado, setLocalSelecionado] = useState(null);
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // pega os dados de listagem
    const fetchEspacos = async () => {
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            const data = await pegarEspacos();
            const listaEspacos = eArray(data)
                ? data
                : eArray(data?.results)
                  ? data.results
                  : [];
            setEspacos(listaEspacos);
        } catch (erro) {
            console.error('erro ao listar espaços: ', erro);
            setError('Erro ao carregar espaços');
            setEspacos([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        espacos,
        idLocalSelecionado,
        setIdLocalSelecionado,
        localSelecionado,

        fetchEspacos,
    };
}
