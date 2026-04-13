import { BACKEND_BASE_URL, HUB_BASE_URL } from '../config';

function setToken(name, value) {
    localStorage.setItem(name, value);
}

function getToken(name) {
    return localStorage.getItem(name);
}

function removeToken(name) {
    localStorage.removeItem(name);
}

export function redirectToLogin() {
    window.location.href = `${HUB_BASE_URL}/session/`;
}

export async function handleAuthCallback(userId) {
    if (!userId) {
        throw new Error('Parâmetro user não fornecido pelo Hub.');
    }

    const response = await fetch(`${BACKEND_BASE_URL}/session/tokens/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user: userId }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Falha ao autenticar com o backend local.');
    }

    if (!data.access_token || !data.refresh_token) {
        throw new Error('Resposta de autenticação sem tokens.');
    }

    setToken('access_token', data.access_token);
    setToken('refresh_token', data.refresh_token);

    return data;
}

export async function getCurrentUser() {
    const accessToken = getToken('access_token');
    if (!accessToken) {
        return null;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/session/me/`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch {
        return null;
    }
}

export async function refreshToken() {
    const refreshTokenValue = getToken('refresh_token');
    if (!refreshTokenValue) {
        return null;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/session/tokens/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshTokenValue}`,
            },
            credentials: 'include',
            body: JSON.stringify({ refresh_token: refreshTokenValue }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.access_token) {
            setToken('access_token', data.access_token);
        }

        return data;
    } catch {
        return null;
    }
}

export async function checkSession() {
    try {
        const user = await getCurrentUser();
        if (user) {
            return { authenticated: true, user };
        }

        const refreshed = await refreshToken();
        if (!refreshed) {
            return { authenticated: false, user: null };
        }

        const userAfterRefresh = await getCurrentUser();
        if (userAfterRefresh) {
            return { authenticated: true, user: userAfterRefresh };
        }

        return { authenticated: false, user: null };
    } catch {
        return { authenticated: false, user: null };
    }
}

export async function logout() {
    removeToken('access_token');
    removeToken('refresh_token');

    try {
        await fetch(`${BACKEND_BASE_URL}/session/logout/`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch {
        // Ignora erro de rede no logout porque os tokens locais já foram limpos.
    }
}