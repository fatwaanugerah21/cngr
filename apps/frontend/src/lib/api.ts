import { getStoredAccessToken } from './auth-session';

const API_V1_PREFIX = '/api/v1';

function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error('VITE_API_URL belum diatur. Tambahkan ke apps/frontend/.env');
  }
  return raw.replace(/\/+$/, '');
}

/** Server origin from `VITE_API_URL` (no trailing slash). */
export const API_ORIGIN = getApiOrigin();

/** Full base URL for versioned JSON API, e.g. `https://host:5001/api/v1`. */
export const API_V1_BASE = `${API_ORIGIN}${API_V1_PREFIX}`;

/**
 * Absolute URL for a path under `/api/v1`.
 * @param path e.g. `health` or `/documents` → `{origin}/api/v1/documents`
 */
export function apiV1Url(path: string): string {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${API_V1_BASE}${segment}`;
}

export class ApiHttpError extends Error {
  readonly name = 'ApiHttpError';

  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly responseBody: string
  ) {
    super(`Permintaan gagal: ${status} ${statusText}`);
  }
}

function mergeHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  const accessToken = getStoredAccessToken();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  const body = init?.body;
  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
}

/**
 * `fetch` against `/api/v1` + `path`. Throws {@link ApiHttpError} when the response is not ok.
 */
export async function apiV1Fetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(apiV1Url(path), {
    ...init,
    headers: mergeHeaders(init),
  });
  if (!response.ok) {
    const responseBody = await response.text();
    throw new ApiHttpError(response.status, response.statusText, responseBody);
  }
  return response;
}

/** Parse JSON from a successful `/api/v1` response. Empty body resolves to `undefined`. */
export async function apiV1Json<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiV1Fetch(path, init);
  const text = await response.text();
  if (text === '') {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
