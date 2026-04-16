function removeTrailingSlash(url) {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

function removeTrailingApiSegment(url) {
    return url.endsWith('/api') ? url.slice(0, -4) : url;
}

export const BACKEND_BASE_URL = removeTrailingSlash(
    import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8001',
);

export const HUB_BASE_URL = removeTrailingSlash(
    import.meta.env.VITE_HUB_BASE_URL || 'http://localhost:8000',
);

const apiBaseFromEnv = import.meta.env.VITE_API_URL;
export const API_URL = removeTrailingApiSegment(
    removeTrailingSlash(apiBaseFromEnv || BACKEND_BASE_URL),
);
