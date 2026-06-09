import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    checkSession,
    handleAuthCallback,
    logoutLocal,
} from '../services/authService';

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
                const session = await checkSession();
                const currentUserId =
                    session?.user?.id != null ? String(session.user.id) : null;

                if (
                    session?.authenticated &&
                    currentUserId &&
                    currentUserId !== String(userId)
                ) {
                    setStatus('Sessão anterior detectada. Encerrando...');
                    await logoutLocal();
                }

                const data = await handleAuthCallback(userId);
                const foiCadastro =
                    data.created === true ||
                    data.created === 'true' ||
                    data.created === 1 ||
                    data.created === '1';

                setStatus('Autenticação concluída. Redirecionando...');

                if (foiCadastro) {
                    // Primeiro login: redirecionar para cadastro complementar
                    navigate('/cadastro_complementar', { replace: true });
                } else {
                    // Login subsequentes
                    navigate('/', {
                        replace: true,
                        state: {
                            loginAlert: {
                                mensagem: 'Login confirmado.',
                                variacao: 'info',
                            },
                        },
                    });
                }
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
