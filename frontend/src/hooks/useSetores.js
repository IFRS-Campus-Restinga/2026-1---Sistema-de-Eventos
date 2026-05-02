import { useState, useEffect } from 'react';
import { pegarSetores } from '../services/setoresService';

export function useSetores() {
    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDados() {
            setCarregando(true);
            try {
                const data = await pegarSetores();

                // O Django retorna 'label', mas o seu formulário usa 'text'
                const areasFormatadas = data.map((item) => ({
                    value: item.value,
                    text: item.label,
                }));

                setSetores(areasFormatadas);
            } catch (err) {
                console.error('Erro ao buscar áreas de conhecimento:', err);
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    return { setores, carregando };
}
