import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleAuthCallback } from '../services/authService';

export default function SessionTokenCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Processando autenticação...');

    useEffect(() => {
        async function authenticate() {
            const userId = searchParams.get('user');

            if (!userId) {
                setStatus('Callback inválido: parâmetro user ausente.');
                return;
            }

            try {
                const data = await handleAuthCallback(userId);
                const foiCadastro =
                    data.created === true ||
                    data.created === 'true' ||
                    data.created === 1 ||
                    data.created === '1';

                const mensagem = foiCadastro
                    ? 'Usuário cadastrado com sucesso no sistema.'
                    : 'Login confirmado.';

                setStatus('Autenticação concluída. Redirecionando...');
                navigate('/', {
                    replace: true,
                    state: {
                        loginAlert: {
                            mensagem,
                            variacao: foiCadastro ? 'success' : 'info',
                        },
                    },
                });
            } catch (error) {
                setStatus(error.message || 'Falha ao autenticar.');
            }
        }

        authenticate();
    }, [navigate, searchParams]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <p>{status}</p>
        </div>
    );
}