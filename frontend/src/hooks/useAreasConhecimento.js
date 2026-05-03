import { useState, useEffect } from 'react';
import { pegarAreasConhecimento } from '../services/areaConhecimentoService';

export function useAreasConhecimento() {
    const [areas, setAreas] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDados() {
            setCarregando(true);
            try {
                const data = await pegarAreasConhecimento();

                // O Django retorna 'label', mas o seu formulário usa 'text'
                const areasFormatadas = data.map((item) => ({
                    value: item.value,
                    text: item.label,
                }));

                setAreas(areasFormatadas);
            } catch (err) {
                console.error('Erro ao buscar áreas de conhecimento:', err);
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    return { areas, carregando };
}
