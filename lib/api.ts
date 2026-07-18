const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Client-side fetch helper for making requests to the Express backend.
 * Includes credentials by default so cookies are sent.
 */
export async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const mergedHeaders = new Headers(options.headers);
  if (!mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
    credentials: 'include',
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