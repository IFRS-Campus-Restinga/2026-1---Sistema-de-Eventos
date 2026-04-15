import { useEffect, useState } from 'react';
import eArray from '../utils/eArray';
import {
    pegarModalidades,
    criarModalidade,
    validarModalidade,
    validarCampoFormulario,
    validarCriterioAvaliacao,
} from '../services/modalidadeService';
import { useCampoFormulario } from './useCampoFormulario';
import { useCriterioAvaliacao } from './useCriterioAvalicao';

export const useModalidades = () => {
    const [modalidades, setModalidades] = useState([]);
    const { criarCampoFormularios } = useCampoFormulario();
    const { criarCriteriosAvaliacao } = useCriterioAvaliacao();

    useEffect(() => {
        async function buscarModalidades() {
            try {
                const data = await pegarModalidades();
                const listaModalidades = eArray(data)
                    ? data
                    : eArray(data?.results)
                      ? data.results
                      : [];
                setModalidades(listaModalidades);
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

            // Cria cada campo vinculando à modalidade criada
            if (eArray(campos) && campos.length) {
                for (const campo of campos) {
                    try {
                        const campoPayload = {
                            ...campo,
                            modalidade: createdModalidade.id,
                        };
                        await criarCampoFormularios(campoPayload);
                    } catch (errCampo) {
                        console.error('Erro ao criar campo:', errCampo);
                    }
                }
            }

            // Cria cada criterio vinculando à modalidade criada
            if (eArray(criterios) && criterios.length) {
                for (const criterio of criterios) {
                    try {
                        const criterioPayload = {
                            ...criterio,
                            modalidade: createdModalidade.id,
                        };
                        await criarCriteriosAvaliacao(criterioPayload);
                    } catch (errCriterio) {
                        console.error('Erro ao criar criterio:', errCriterio);
                    }
                }
            }

            return createdModalidade;
        } catch (erro) {
            console.log(erro);
            throw erro;
        }
    };

    const submeterModalidade = async (payload) => {
        // payload: { ...modalidadeFields, campos: [], criterios: [] }
        const { campos = [], criterios = [], ...base } = payload || {};

        // Valida modalidade
        const resultado = await validarModalidade(base);
        if (!resultado.valido) {
            return { valido: false, erros: resultado.erros || {} };
        }

        // Valida campos filhos
        const erros = {};
        let temErros = false;

        if (eArray(campos) && campos.length) {
            for (let i = 0; i < campos.length; i++) {
                const res = await validarCampoFormulario(campos[i]);
                if (!res.valido) {
                    temErros = true;
                    erros.campos = erros.campos || {};
                    erros.campos[i] = res.erros || {};
                }
            }
        }

        if (eArray(criterios) && criterios.length) {
            for (let i = 0; i < criterios.length; i++) {
                const res = await validarCriterioAvaliacao(criterios[i]);
                if (!res.valido) {
                    temErros = true;
                    erros.criterios = erros.criterios || {};
                    erros.criterios[i] = res.erros || {};
                }
            }
        }

        if (temErros) {
            return { valido: false, erros };
        }

        // Se tudo válido, cria modalidade e itens
        const created = await criarModalidades({ ...base, campos, criterios });
        return { valido: true, modalidade: created };
    };
    return { modalidades: modalidades, criarModalidades, submeterModalidade };
};
