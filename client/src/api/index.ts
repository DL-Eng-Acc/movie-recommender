const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function messageFromErrorBody(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }
  return null;
}

/**
 * Calls our own backend and returns its JSON body as `T`. The body is not
 * validated at runtime, so `T` must match what the route actually sends.
 * Throws with the backend's `{ message }` (or the status) on a non-2xx response.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Merged through Headers so callers can pass any HeadersInit form
  // (object, array or Headers) without losing the JSON content type.
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new Error(messageFromErrorBody(body) || `HTTP ${res.status}`);
  }

  const body: unknown = await res.json();
  return body as T;
}
