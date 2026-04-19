import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkSession, redirectToLogin } from '../../services/authService';

export default function ProtectedRoute({
    children,
    fallback = <p>Verificando sessão...</p>,
    redirectMode = 'hub',
    redirectTo = '/',
    gruposPermitidos = [],
    redirectUnauthorizedTo = '/',
}) {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        let ativo = true;

        async function validarSessao() {
            try {
                const result = await checkSession();
                if (!ativo) return;
                setIsAuthenticated(Boolean(result?.authenticated));
                setUser(result?.user ?? null);
            } catch {
                if (!ativo) return;
                setIsAuthenticated(false);
                setUser(null);
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

    const gruposDoUsuario = useMemo(() => {
        if (!Array.isArray(user?.groups)) return [];

        return user.groups
            .map((group) => (typeof group === 'string' ? group : group?.name))
            .filter(Boolean);
    }, [user]);

    const temGrupoPermitido =
        !Array.isArray(gruposPermitidos) ||
        gruposPermitidos.length === 0 ||
        gruposPermitidos.some((group) => gruposDoUsuario.includes(group));

    if (loading) {
        return fallback;
    }

    if (!isAuthenticated) {
        if (redirectMode === 'hub') {
            return null;
        }

        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    if (!temGrupoPermitido) {
        return (
            <Navigate
                to={redirectUnauthorizedTo}
                replace
                state={{ from: location, reason: 'forbidden' }}
            />
        );
    }

    return children;
}
