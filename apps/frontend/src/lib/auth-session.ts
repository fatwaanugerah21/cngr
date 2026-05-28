export const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'cngr_access_token';

export function getStoredAccessToken(): string | undefined {
  const token = sessionStorage.getItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  const trimmed = typeof token === 'string' ? token.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

export function setStoredAccessToken(token: string): void {
  sessionStorage.setItem(AUTH_ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAccessToken(): void {
  sessionStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
}
