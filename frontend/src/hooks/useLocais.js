import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarLocais,
    pegarLocal,
    criarLocal,
    atualizarLocal,
    excluirLocal,
} from '../services/localService';

export default function useLocais() {
    const [locais, setLocais] = useState([]); // lista de locais
    const [idLocalSelecionado, setIdLocalSelecionado] = useState(null); //pega o idlocal selecionado no dropdown
    const [localSelecionado, setLocalSelecionado] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // pega os dados de listagem
    const fetchLocais = async () => {
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            const data = await pegarLocais();
            const listaLocais = eArray(data)
                ? data
                : eArray(data?.results)
                  ? data.results
                  : [];
            setLocais(listaLocais);
        } catch (erro) {
            console.error('erro ao listar locais: ', erro);
            setError('Erro ao carregar locais');
            setLocais([]);
        } finally {
            setLoading(false);
        }
    };

    // pega o local especifico
    const buscarLocal = async (id) => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const data = await pegarLocal(id);
            setLocalSelecionado(data);
        } catch (erro) {
            console.error('Erro ao buscar local:', erro);
            setError('Erro ao buscar local');
        } finally {
            setLoading(false);
        }
    };

    // cria um local
    const adicionaLocal = async (dados) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const novoLocal = await criarLocal(dados);

            // atualiza lista automaticamente
            setLocais((prev) => [...prev, novoLocal]);

            setMessage('Local criado com sucesso!');
            return true;
        } catch (erro) {
            console.error('Erro ao criar local:', erro);

            setError(erro.response?.data || 'Erro ao criar local');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // atualiza um local
    const editarLocal = async (id, dados) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const localAtualizado = await atualizarLocal(id, dados);

            // atualiza lista
            setLocais((prev) =>
                prev.map((local) =>
                    local.id === id ? localAtualizado : local,
                ),
            );

            setMessage('Local atualizado com sucesso!');
            return true;
        } catch (erro) {
            console.error('Erro ao atualizar local:', erro);

            setError(erro.response?.data || 'Erro ao atualizar local');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const excluiLocal = async (id) => {
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const sucesso = await excluirLocal(id);
            if (sucesso) {
                setLocais((prev) => prev.filter((local) => local.id !== id));
            }
            setMessage('Local excluído com sucesso!');
            return true;
        } catch (erro) {
            console.error('Erro ao excluir local:', erro);

            const mensagem =
                erro.response?.data?.erro ||
                erro.response?.data?.detail ||
                'Erro ao excluir local';

            setError(mensagem);
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
        fetchLocais();
    }, []);

    return {
        locais,
        idLocalSelecionado,
        localSelecionado,
        loading,
        message,
        error,
        setMessage,
        setIdLocalSelecionado,

        fetchLocais,
        buscarLocal,
        adicionaLocal,
        editarLocal,
        excluiLocal,

        handleSave,
    };
}
