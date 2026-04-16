import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarEspacos,
    pegarEspaco,
    atualizarEspaco,
    criarEspaco,
    excluirEspaco,
} from '../services/espacoService';

export default function useEspacos() {
    const [idLocalSelecionado, setIdLocalSelecionado] = useState(null); //pega o idlocal selecionado no dropdown
    const [localSelecionado, setLocalSelecionado] = useState(null);
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // pega os dados de listagem
    const fetchEspacos = async (localId) => {
        if (!localId) return;

        setLoading(true);
        setMessage('');
        setError(null);

        try {
            const data = await pegarEspacos(localId);
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

    // pega o espaço especifico
    const buscarEspaco = async (id) => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const data = await pegarEspaco(id);
            setLocalSelecionado(data);
        } catch (erro) {
            console.error('Erro ao buscar espaço:', erro);
            setError('Erro ao buscar espaço');
        } finally {
            setLoading(false);
        }
    };

    // cria um espaço
    const adicionaEspaco = async (dados) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const novoEspaco = await criarEspaco(dados);

            // atualiza lista automaticamente
            setEspacos((prev) => [...prev, novoEspaco]);

            setMessage('Espaço criado com sucesso!');
            return true;
        } catch (erro) {
            console.error('Erro ao criar espaço:', erro);

            setError(erro.response?.data || 'Erro ao criar espaço');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // atualiza um espaço
    const editarEspaco = async (id, dados) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const espacoAtualizado = await atualizarEspaco(id, dados);

            // atualiza lista
            setEspacos((prev) =>
                prev.map((espaco) =>
                    espaco.id === id ? espacoAtualizado : espaco,
                ),
            );

            setMessage('Espaço atualizado com sucesso!');
            return true;
        } catch (erro) {
            console.error('Erro ao atualizar espaço:', erro);

            setError(erro.response?.data || 'Erro ao atualizar espaço');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const excluirEspaco = async (id) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            await excluirEspaco(id);
            setEspacos((prev) => prev.filter((espaco) => espaco.id !== id));
            setMessage('Espaço excluído com sucesso!');
            return true;
        } catch (erro) {
            console.error('Erro ao excluir espaço:', erro);
            setError(erro.response?.data || 'Erro ao excluir espaço');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (dados) => {
        setError(null);
        setMessage('');

        try {
            let resultado;

            if (dados.id) {
                resultado = await editarLocal(dados.id, dados);
                setMessage('Local atualizado com sucesso!');
            } else {
                resultado = await adicionaLocal(dados);
                setMessage('Local criado com sucesso!');
            }

            return { sucesso: true, data: resultado };
        } catch (erro) {
            console.error('Erro ao salvar:', erro);

            const erroBackend = erro.response?.data || 'Erro ao salvar local';
            setError(erroBackend);

            return { sucesso: false, erro: erroBackend };
        }
    };

    useEffect(() => {
        if (idLocalSelecionado) {
            fetchEspacos(idLocalSelecionado);
        }
    }, [idLocalSelecionado]);

    return {
        espacos,
        idLocalSelecionado,
        setIdLocalSelecionado,
        localSelecionado,
        loading,
        error,
        message,

        fetchEspacos,
        buscarEspaco,
        adicionaEspaco,
        editarEspaco,
        excluirEspaco,
        handleSave,
    };
}
