const API_URL = import.meta.env.VITE_API_URL;

export async function getDashboard() {
    const response = await fetch(`${API_URL}/api/dashboard/`);
    return response.json();
}

///alterar para env do Bruno///
