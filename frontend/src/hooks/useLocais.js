import { useEffect, useState } from 'react';

import { pegarLocais } from '../services/localService';

export function useLocais() {
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchLocais() {
            try {
                const data = await pegarLocais();
                setLocais(data);
            } catch (erro) {
                console.error('erro', erro);
            }
        }
        fetchLocais();
    }, []);
    return { locais };
}


