import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkSession, redirectToLogin } from '../../services/authService';
import { listarMeusEventosAvaliador } from '../../services/meusAvaliacoesService';

export default function ProtectedRoute({
    children,
    fallback = <p>Verificando sessão...</p>,
    redirectMode = 'hub',
    redirectTo = '/',
    gruposPermitidos = [],
    permitirAvaliador = false,
    redirectUnauthorizedTo = '/',
}) {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [temAcessoAvaliador, setTemAcessoAvaliador] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function validarSessao() {
            try {
                const result = await checkSession();
                if (ativo) {
                    setIsAuthenticated(Boolean(result?.authenticated));
                    const usuario = result?.user ?? null;
                    setUser(usuario);

                    const gruposDoUsuario = Array.isArray(usuario?.groups)
                        ? usuario.groups
                              .map((group) =>
                                  typeof group === 'string'
                                      ? group
                                      : group?.name,
                              )
                              .filter(Boolean)
                        : [];

                    const temGrupoPermitido =
                        !Array.isArray(gruposPermitidos) ||
                        gruposPermitidos.length === 0 ||
                        gruposPermitidos.some((group) =>
                            gruposDoUsuario.includes(group),
                        );

                    if (!result?.authenticated) {
                        setTemAcessoAvaliador(false);
                    } else if (temGrupoPermitido || !permitirAvaliador) {
                        setTemAcessoAvaliador(false);
                    } else {
                        const eventosAvaliador =
                            await listarMeusEventosAvaliador();

                        if (ativo) {
                            setTemAcessoAvaliador(
                                Array.isArray(eventosAvaliador) &&
                                    eventosAvaliador.length > 0,
                            );
                        }
                    }
                }
            } catch {
                if (ativo) {
                    setIsAuthenticated(false);
                    setUser(null);
                    setTemAcessoAvaliador(false);
                }
            } finally {
                if (ativo) {
                    setLoading(false);
                }
            }
        }

        validarSessao();

        return () => {
            ativo = false;
        };
    }, [gruposPermitidos, permitirAvaliador]);

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

    const temPermissaoAvaliador = permitirAvaliador && temAcessoAvaliador;

    if (loading) {
        return fallback;
    }

    if (!isAuthenticated) {
        if (redirectMode === 'hub') {
            return null;
        }

        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    if (!temGrupoPermitido && !temPermissaoAvaliador) {
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
