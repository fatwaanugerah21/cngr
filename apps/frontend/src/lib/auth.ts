import { apiV1Json, ApiHttpError } from './api';

export const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'cngr_access_token';

export function clearSessionAuth(): void {
  sessionStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginSuccessPayload = {
  message: string;
  token: string;
};

/** Normalizes backend `error` strings (e.g. bcrypt details) for the UI. */
export function formatLoginErrorMessage(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return 'Gagal masuk. Silakan coba lagi.';
  }
  if (trimmed.toLowerCase().includes('invalid credentials')) {
    return 'Email atau kata sandi salah.';
  }
  return trimmed;
}

export class LoginApiError extends Error {
  readonly name = 'LoginApiError';

  constructor(message: string) {
    super(message);
  }
}

type LoginResponseBody = {
  message?: unknown;
  status?: unknown;
  token?: unknown;
  error?: unknown;
};

function readLoginFailureMessage(data: LoginResponseBody): string | undefined {
  if (typeof data.error !== 'string') {
    return undefined;
  }
  const trimmed = data.error.trim();
  return trimmed === '' ? undefined : formatLoginErrorMessage(trimmed);
}

export async function loginWithEmailPassword(
  credentials: LoginCredentials
): Promise<LoginSuccessPayload> {
  const data = (await apiV1Json<LoginResponseBody>('auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })) as LoginResponseBody;

  const failureMessage = readLoginFailureMessage(data);
  if (failureMessage !== undefined) {
    throw new LoginApiError(failureMessage);
  }

  const token = typeof data.token === 'string' ? data.token.trim() : '';
  if (token === '') {
    throw new LoginApiError('Gagal masuk. Token tidak diterima.');
  }

  const message =
    typeof data.message === 'string' && data.message.trim() !== ''
      ? data.message.trim()
      : 'Login berhasil';

  return { message, token };
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof LoginApiError) {
    return error.message;
  }
  if (error instanceof ApiHttpError) {
    try {
      const parsed = JSON.parse(error.responseBody) as Record<string, unknown>;
      const raw =
        (typeof parsed.error === 'string' && parsed.error) ||
        (typeof parsed.message === 'string' && parsed.message) ||
        (typeof parsed.detail === 'string' && parsed.detail);
      if (raw && raw.trim() !== '') {
        return formatLoginErrorMessage(raw);
      }
    } catch {
      if (error.responseBody.trim() !== '') {
        return formatLoginErrorMessage(error.responseBody);
      }
    }
    return `Gagal masuk (${error.status})`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}
