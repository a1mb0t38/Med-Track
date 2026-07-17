import { headers } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Server-side fetch helper that forwards the request headers (including Better Auth cookies)
 * to the Express backend.
 */
export async function fetchServer(endpoint: string, options: RequestInit = {}) {
  // Await headers() in Next.js 15+
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie');
  
  const mergedHeaders = new Headers(options.headers);
  
  // Forward cookies to maintain the session
  if (cookieHeader) {
    mergedHeaders.set('cookie', cookieHeader);
  }
  
  mergedHeaders.set('Content-Type', 'application/json');

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
  });
  
  if (!res.ok) {
    // Attempt to parse error message, otherwise throw generic error
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

/**
 * Client-side fetch helper for making requests to the Express backend.
 * Assumes credentials are included by default so cookies are sent.
 */
export async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const mergedHeaders = new Headers(options.headers);
  if (!mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
    credentials: 'true' === 'true' ? 'include' : 'include', // Ensure cookies are sent
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
