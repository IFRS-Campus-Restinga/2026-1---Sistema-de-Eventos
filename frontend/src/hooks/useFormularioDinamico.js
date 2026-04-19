import { useState, useCallback } from 'react';

export default function useFormularioDinamico(inicial = {}) {
    const [instancias, setInstancias] = useState(inicial);

    const aoAlterar = useCallback((valor, chaveInst, nomeCampo) => {
        setInstancias((prev) => {
            const proximo = { ...prev };
            const atual = proximo[chaveInst] ? { ...proximo[chaveInst] } : {};
            atual[nomeCampo] = valor;
            proximo[chaveInst] = atual;
            return proximo;
        });
    }, []);

    const paraArray = useCallback(
        () => Object.values(instancias),
        [instancias],
    );

    const removerInstancia = useCallback((chaveInst) => {
        setInstancias((prev) => {
            const proximo = { ...prev };
            delete proximo[chaveInst];
            return proximo;
        });
    }, []);

    return { instancias, aoAlterar, paraArray, removerInstancia };
}
