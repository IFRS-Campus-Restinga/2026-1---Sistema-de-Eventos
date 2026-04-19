import { useEffect, useState } from 'react';
import { checkSession, logout, redirectToLogin } from '../../services/authService';

export default function AuthButton() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        async function loadSession() {
            try {
                const result = await checkSession();
                setIsAuthenticated(result.authenticated);
                setUser(result.user);
            } finally {
                setLoading(false);
            }
        }

        loadSession();
    }, []);

    async function handleLogout() {
        setLoggingOut(true);
        await logout();
        setIsAuthenticated(false);
        setUser(null);
        setLoggingOut(false);
    }

    if (loading) {
        return <span className="text-white">Carregando...</span>;
    }

    if (isAuthenticated) {
        const displayName =
            user?.first_name || user?.display_name || user?.username || 'Usuário';

        return (
            <div className="d-flex align-items-center gap-2">
                <span className="text-white">Olá, {displayName}</span>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="nav-login-button text-white"
                    disabled={loggingOut}
                >
                    {loggingOut ? 'Saindo...' : 'Logout'}
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={redirectToLogin}
            className="nav-login-button text-white"
        >
            Login
        </button>
    );
}