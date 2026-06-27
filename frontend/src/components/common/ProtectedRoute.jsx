import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { checkSession, redirectToLogin } from '../../services/authService';
import { listarMeusEventosAvaliador } from '../../services/meusAvaliacoesService';
import {
    listarMeusEventosCoordenador,
    listarMeusEventosOrganizador,
} from '../../services/eventoService';

const GRUPOS_VAZIOS = [];

export default function ProtectedRoute({
    children,
    fallback = <p>Verificando sessão...</p>,
    redirectMode = 'hub',
    redirectTo = '/',
    gruposPermitidos = GRUPOS_VAZIOS,
    permitirAvaliador = false,
    redirectUnauthorizedTo = '/',
    validarAcessoEvento = false,
}) {
    const location = useLocation();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [temAcessoAvaliador, setTemAcessoAvaliador] = useState(false);
    const [temAcessoEvento, setTemAcessoEvento] = useState(true);

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
                        setTemAcessoEvento(false);
                    } else {
                        if (validarAcessoEvento) {
                            const eventoId =
                                params?.id ||
                                params?.eventoId ||
                                new URLSearchParams(location.search).get(
                                    'eventoId',
                                ) ||
                                new URLSearchParams(location.search).get('id');
                            const ehAdministrador =
                                gruposDoUsuario.includes('Administrador');
                            const ehGestorEvento =
                                gruposDoUsuario.includes('Coordenador') ||
                                gruposDoUsuario.includes('Organizador');

                            if (
                                eventoId &&
                                !ehAdministrador &&
                                ehGestorEvento
                            ) {
                                const [eventosCoordenador, eventosOrganizador] =
                                    await Promise.all([
                                        listarMeusEventosCoordenador().catch(
                                            () => [],
                                        ),
                                        listarMeusEventosOrganizador().catch(
                                            () => [],
                                        ),
                                    ]);
                                const idsPermitidos = [
                                    ...(Array.isArray(eventosCoordenador)
                                        ? eventosCoordenador
                                              .map((evento) =>
                                                  String(
                                                      evento?.id ??
                                                          evento?.evento_id ??
                                                          '',
                                                  ),
                                              )
                                              .filter(Boolean)
                                        : []),
                                    ...(Array.isArray(eventosOrganizador)
                                        ? eventosOrganizador
                                              .map((evento) =>
                                                  String(
                                                      evento?.id ??
                                                          evento?.evento_id ??
                                                          '',
                                                  ),
                                              )
                                              .filter(Boolean)
                                        : []),
                                ];

                                setTemAcessoEvento(
                                    [...new Set(idsPermitidos)].includes(
                                        String(eventoId),
                                    ),
                                );
                            } else {
                                setTemAcessoEvento(true);
                            }
                        } else {
                            setTemAcessoEvento(true);
                        }

                        if (temGrupoPermitido || !permitirAvaliador) {
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
    }, [
        gruposPermitidos,
        permitirAvaliador,
        validarAcessoEvento,
        params?.id,
        params?.eventoId,
        location.search,
    ]);

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

    if (
        (validarAcessoEvento && !temAcessoEvento) ||
        (!temGrupoPermitido && !temPermissaoAvaliador)
    ) {
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
