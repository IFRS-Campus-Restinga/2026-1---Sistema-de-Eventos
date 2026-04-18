import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkSession, redirectToLogin } from '../../services/authService';

export default function ProtectedRoute({
    children,
    fallback = <p>Verificando sessão...</p>,
    redirectMode = 'hub',
    redirectTo = '/',
}) {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function validarSessao() {
            try {
                const result = await checkSession();
                if (!ativo) return;
                setIsAuthenticated(Boolean(result?.authenticated));
            } catch {
                if (!ativo) return;
                setIsAuthenticated(false);
            } finally {
                if (!ativo) return;
                setLoading(false);
            }
        }

        validarSessao();

        return () => {
            ativo = false;
        };
    }, []);

    useEffect(() => {
        if (loading || isAuthenticated) return;
        if (redirectMode === 'hub') {
            redirectToLogin();
        }
    }, [loading, isAuthenticated, redirectMode]);

    if (loading) {
        return fallback;
    }

    if (!isAuthenticated) {
        if (redirectMode === 'hub') {
            return null;
        }

        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    return children;
}
