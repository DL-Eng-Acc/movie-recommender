const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// used only by RandomButton??? why
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: options.credentials ?? "include",
    headers,
  });
  if (!res.ok) {
    const err : unknown = await res.json().catch(() => null);
    let message = `HTTP ${res.status}`;
    if (typeof err === "object" && err !== null && "message" in err && typeof err.message === "string") {
      message = err.message;
    }
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
