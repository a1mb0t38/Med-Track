import { headers } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Server-side fetch helper that forwards the request headers (including Better Auth cookies)
 * to the Express backend.
 */
export async function fetchServer(endpoint: string, options: RequestInit = {}) {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    const mergedHeaders = new Headers(options.headers);

    if (cookieHeader) {
        mergedHeaders.set('cookie', cookieHeader);
    }

    mergedHeaders.set('Content-Type', 'application/json');

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: mergedHeaders,
    });

    if (!res.ok) {
        let errorMessage = `API Error: ${res.status}`;
        try {
            const errorData = await res.json();
            if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
            // Ignored
        }
        throw new Error(errorMessage);
    }

    return res.json();
}