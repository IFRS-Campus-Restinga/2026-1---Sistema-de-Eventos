import { BACKEND_BASE_URL, HUB_BASE_URL } from '../config';

// [TEMP-FALLBACK] Funções removidas: setToken, getToken, removeToken (eram localStorage)
// Tokens agora são armazenados em HttpOnly cookies no servidor

export async function redirectToLogin() {
    let systemId = '';
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/session/system-id/`);
        if (response.ok) {
            const data = await response.json();
            systemId = data.system || '';
        }
    } catch {
        // Redireciona mesmo sem o system ID se o backend estiver indisponível.
    }
    const params = systemId ? `?system=${encodeURIComponent(systemId)}` : '';
    window.location.href = `${HUB_BASE_URL}/session/${params}`;
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
        credentials: 'include',  // Importante: permitir leitura/escrita de cookies
        body: JSON.stringify({ user: userId }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Falha ao autenticar com o backend local.');
    }

    // [TEMP-FALLBACK] Tokens agora vêm como HttpOnly cookies, não em JSON
    // Validar que ao menos user_id está presente na resposta
    if (!data.id) {
        throw new Error('Resposta de autenticação sem informações do usuário.');
    }

    return data;
}

export async function getCurrentUser() {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/session/me/`, {
            method: 'GET',
            // [TEMP-FALLBACK] Não precisa mais de Authorization header com token em localStorage
            credentials: 'include',  // Permite enviar cookies automaticamente
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
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/session/tokens/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // [TEMP-FALLBACK] Não precisa mais enviar token em Authorization header
            credentials: 'include',  // Permite enviar refresh_token cookie e receber novo access_token cookie
            body: JSON.stringify({}),  // Body vazio, token vem do cookie
        });

        if (!response.ok) {
            return null;
        }

        // Token novo foi enviado como cookie automaticamente pelo servidor
        return response.json();
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
    try {
        await fetch(`${BACKEND_BASE_URL}/session/logout/`, {
            method: 'POST',
            credentials: 'include',  // Permite enviar cookies e receber delete-cookie
        });
    } catch {
        // Ignora erro de rede no logout porque os cookies já serão deletados pelo servidor
    }
}
