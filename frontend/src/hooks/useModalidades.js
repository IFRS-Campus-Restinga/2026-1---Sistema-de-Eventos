import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarModalidades,
    criarModalidade,
    atualizarModalidade,
    deletarModalidade,
    validarModalidade,
    validarCampoFormulario,
    validarCriterioAvaliacao,
} from '../services/modalidadeService';
import {
    criarCampoFormulario,
    atualizarCampoFormulario,
    deletarCampoFormulario,
    pegarCampoFormulario,
} from '../services/campoFormularioService';
import {
    criarCriterioAvaliacao,
    atualizarCriterioAvaliacao,
    deletarCriterioAvaliacao,
    pegarCriterioAvaliacao,
} from '../services/criterioAvaliacaoService';

const paraLista = (data) =>
    eArray(data) ? data : eArray(data?.results) ? data.results : [];

const removerErrosDeModalidade = (errosEntrada = {}) => {
    const errosFiltrados = { ...errosEntrada };
    delete errosFiltrados.modalidade;
    delete errosFiltrados.modalidade_id;
    return errosFiltrados;
};

const validarLista = async (lista, validador) => {
    const errosPorIndice = {};

    for (let i = 0; i < lista.length; i++) {
        const resultado = await validador(lista[i]);
        if (resultado.valido) continue;

        const errosLimpos = removerErrosDeModalidade(resultado.erros || {});
        if (Object.keys(errosLimpos).length > 0) {
            errosPorIndice[i] = errosLimpos;
        }
    }

    return errosPorIndice;
};

const limparCamposGerenciados = (item = {}) => {
    const { id: _ID, modalidade: _MODALIDADE, ...restante } = item;
    return restante;
};

const filtrarPorModalidade = (lista, modalidadeId) =>
    lista.filter((item) => Number(item.modalidade) === Number(modalidadeId));

const sincronizarListaRelacionada = async ({
    existentes = [],
    recebidos = [],
    modalidadeId,
    criar,
    atualizar,
    deletar,
}) => {
    const totalComum = Math.min(existentes.length, recebidos.length);

    for (let i = 0; i < totalComum; i++) {
        await atualizar(existentes[i].id, {
            ...limparCamposGerenciados(recebidos[i]),
            modalidade: modalidadeId,
        });
    }

    for (let i = totalComum; i < recebidos.length; i++) {
        await criar({
            ...limparCamposGerenciados(recebidos[i]),
            modalidade: modalidadeId,
        });
    }

    for (let i = totalComum; i < existentes.length; i++) {
        await deletar(existentes[i].id);
    }
};

export const useModalidades = () => {
    const [modalidades, setModalidades] = useState([]);

    useEffect(() => {
        async function buscarModalidades() {
            try {
                const data = await pegarModalidades();
                setModalidades(paraLista(data));
            } catch (erro) {
                console.error('erro', erro);
                setModalidades([]);
            }
        }
        buscarModalidades();
    }, []);

    const criarModalidades = async (e) => {
        try {
            // Extrai campos e criterios do payload, pois o endpoint de modalidade
            // não aceita esses relacionamentos no POST
            const { campos = [], criterios = [], ...payload } = e || {};

            const createdModalidade = await criarModalidade(payload);
            setModalidades((prev) => [createdModalidade, ...prev]);

            await Promise.allSettled(
                campos.map((campo) =>
                    criarCampoFormulario({
                        ...campo,
                        modalidade: createdModalidade.id,
                    }),
                ),
            );

            await Promise.allSettled(
                criterios.map((criterio) =>
                    criarCriterioAvaliacao({
                        ...criterio,
                        modalidade: createdModalidade.id,
                    }),
                ),
            );

            return createdModalidade;
        } catch (erro) {
            console.log(erro);
            throw erro;
        }
    };

    const sincronizarRelacionadosModalidade = async (
        modalidadeId,
        campos = [],
        criterios = [],
    ) => {
        const [todosCampos, todosCriterios] = await Promise.all([
            pegarCampoFormulario(),
            pegarCriterioAvaliacao(),
        ]);

        const camposAtuais = filtrarPorModalidade(
            paraLista(todosCampos),
            modalidadeId,
        );
        const criteriosAtuais = filtrarPorModalidade(
            paraLista(todosCriterios),
            modalidadeId,
        );

        await sincronizarListaRelacionada({
            existentes: camposAtuais,
            recebidos: campos,
            modalidadeId,
            criar: criarCampoFormulario,
            atualizar: atualizarCampoFormulario,
            deletar: deletarCampoFormulario,
        });

        await sincronizarListaRelacionada({
            existentes: criteriosAtuais,
            recebidos: criterios,
            modalidadeId,
            criar: criarCriterioAvaliacao,
            atualizar: atualizarCriterioAvaliacao,
            deletar: deletarCriterioAvaliacao,
        });
    };

    const atualizarModalidades = async (id, dados) => {
        try {
            const { campos = [], criterios = [], ...payload } = dados || {};

            const modalidadeAtualizada = await atualizarModalidade(id, payload);

            await sincronizarRelacionadosModalidade(
                Number(id),
                campos,
                payload.requer_avaliacao || payload.requer_avaliacao_submissao
                    ? criterios
                    : [],
            );

            setModalidades((prev) =>
                prev.map((modalidade) =>
                    modalidade.id === Number(id)
                        ? modalidadeAtualizada
                        : modalidade,
                ),
            );

            return modalidadeAtualizada;
        } catch (erro) {
            console.log(erro);
            throw erro;
        }
    };

    const excluirModalidades = async (id) => {
        try {
            await deletarModalidade(id);
            setModalidades((prev) =>
                prev.filter((modalidade) => modalidade.id !== Number(id)),
            );
            return true;
        } catch (erro) {
            console.log(erro);
            throw erro;
        }
    };

    const validarPayloadModalidade = async (payload, method = 'POST') => {
        // payload: { ...modalidadeFields, campos: [], criterios: [] }
        const { campos = [], criterios = [], ...base } = payload || {};
        const criteriosConsiderados =
            base.requer_avaliacao || base.requer_avaliacao_submissao
                ? criterios
                : [];

        // Valida tudo e agrega erros para exibir no formulario completo
        const erros = {};

        const resultado = await validarModalidade(base, method);
        if (!resultado.valido) {
            Object.assign(erros, resultado.erros || {});
        }

        const errosCampos = await validarLista(campos, validarCampoFormulario);
        if (Object.keys(errosCampos).length > 0) {
            erros.campos = errosCampos;
        }

        const errosCriterios = await validarLista(
            criteriosConsiderados,
            validarCriterioAvaliacao,
        );
        if (Object.keys(errosCriterios).length > 0) {
            erros.criterios = errosCriterios;
        }

        if (Object.keys(erros).length > 0) {
            return { valido: false, erros };
        }

        return {
            valido: true,
            payloadNormalizado: {
                ...base,
                campos,
                criterios: criteriosConsiderados,
            },
        };
    };

    const submeterModalidade = async (payload) => {
        const validacao = await validarPayloadModalidade(payload, 'POST');

        if (!validacao.valido) {
            return validacao;
        }

        // Se tudo válido, cria modalidade e itens
        const created = await criarModalidades(validacao.payloadNormalizado);
        return { valido: true, modalidade: created };
    };

    const submeterAtualizacaoModalidade = async (id, payload) => {
        const validacao = await validarPayloadModalidade(payload, 'PUT');

        if (!validacao.valido) {
            return validacao;
        }

        const updated = await atualizarModalidades(
            id,
            validacao.payloadNormalizado,
        );
        return { valido: true, modalidade: updated };
    };

    return {
        modalidades,
        criarModalidades,
        atualizarModalidades,
        excluirModalidades,
        submeterModalidade,
        submeterAtualizacaoModalidade,
    };
};
