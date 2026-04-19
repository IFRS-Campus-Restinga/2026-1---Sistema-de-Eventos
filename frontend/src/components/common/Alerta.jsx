import { useEffect, useState } from 'react';
import { Alert, ProgressBar } from 'react-bootstrap';

export default function Alerta({
    mensagem,
    variacao = 'success',
    duracao = 3000,
    reacao = null,
}) {
    const [visivel, setVisivel] = useState(true);
    const [progresso, setProgresso] = useState(100);

    useEffect(() => {
        if (!mensagem) return;

        let intervaloId = null;
        const initId = setTimeout(() => {
            setVisivel(true);
            setProgresso(100);

            if (!duracao || duracao <= 0) return;

            const inicio = Date.now();
            const intervalo = 20;
            const fatorConclusao = 0.8;

            const atualizar = () => {
                const decorrido = Date.now() - inicio;
                const pct = Math.max(
                    0,
                    100 - (decorrido / (duracao * fatorConclusao)) * 100,
                );
                setProgresso(pct);

                if (decorrido >= duracao) {
                    if (intervaloId) clearInterval(intervaloId);
                    setProgresso(0);
                    setVisivel(false);
                }
            };

            // chamada imediata para evitar atraso visual
            atualizar();

            intervaloId = setInterval(atualizar, intervalo);
        }, 0);

        return () => {
            clearTimeout(initId);
            if (intervaloId) clearInterval(intervaloId);
        };
    }, [mensagem, duracao, reacao]);

    if (!visivel) return null;

    return (
        <div className="fixed-bottom d-flex justify-content-end me-5">
            <Alert
                variant={variacao}
                className="overflow-hidden"
                style={{
                    width: '300px',
                    position: 'relative',
                }}
            >
                {mensagem}

                {duracao > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    >
                        <ProgressBar
                            now={progresso}
                            variant={variacao}
                            style={{ height: '4px' }}
                        />
                    </div>
                )}
            </Alert>
        </div>
    );
}
