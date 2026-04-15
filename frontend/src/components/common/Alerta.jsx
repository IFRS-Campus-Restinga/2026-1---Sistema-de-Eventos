import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

export default function Alerta({
    mensagem,
    variacao = 'success',
    duracao = 5000,
    reacao = null,
}) {
    const [visivel, setVisivel] = useState(true);

    useEffect(() => {
        if (!mensagem) return;

        // Sempre que a mensagem mudar, (re)exibe o alerta e agenda o esconder
        setVisivel(true);

        if (!duracao || duracao <= 0) return;

        const temporizador = setTimeout(() => {
            setVisivel(false);
        }, duracao);

        return () => clearTimeout(temporizador);
    }, [mensagem, duracao, reacao]);

    if (!visivel) return null;

    return (
        <div className="fixed-bottom d-flex justify-content-end me-5">
            <Alert
                variant={variacao}
                className="overflow-hidden"
                style={{
                    width: '300px',
                }}
            >
                {mensagem}
            </Alert>
        </div>
    );
}
