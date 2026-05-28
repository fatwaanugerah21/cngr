import { apiV1Json, ApiHttpError } from './api';
import { type BaseSuccessResponse, isApiSuccess, readApiMeta, unwrapApiData } from './api-response';
import { fetchCurrentAccountProfile } from './cngr-api';
import { clearStoredAccessToken, getStoredAccessToken } from './auth-session';
import { clearNavigationSession, type EUserRole, parseApiUserRole } from './navigation-session';
import { redirect } from 'react-router-dom';

export function clearSessionAuth(): void {
  clearStoredAccessToken();
}

export function isAuthenticated(): boolean {
  return getStoredAccessToken() !== undefined;
}

/**
 * React Router guard for protected routes.
 * Redirects to `/login` when there's no token or the token is no longer valid.
 */
export async function requireAuthLoader() {
  if (!isAuthenticated()) {
    return redirect('/login');
  }

  try {
    const profile = await fetchCurrentAccountProfile();
    if (!profile?.id) {
      clearStoredAccessToken();
      clearNavigationSession();
      return redirect('/login');
    }
  } catch (error) {
    if (error instanceof ApiHttpError && (error.status === 401 || error.status === 403)) {
      clearStoredAccessToken();
      clearNavigationSession();
      return redirect('/login');
    }

    // Keep transient API failures from logging users out.
    return null;
  }

  return null;
}

export type LoginCredentials = {
  username: string;
  password: string;
};

export type LoginResponseData = {
  token?: string;
  role?: string;
  user?: {
    role?: string;
  };
};

export type LoginSuccessPayload = {
  message: string;
  token: string;
  role?: EUserRole;
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

function readLoginFailureMessage(response: BaseSuccessResponse<LoginResponseData>): string | undefined {
  if (!isApiSuccess(response)) {
    const metaMessage = response.meta.message.trim();
    return metaMessage !== '' ? formatLoginErrorMessage(metaMessage) : 'Gagal masuk. Silakan coba lagi.';
  }

  const legacyBody = response as unknown as Record<string, unknown>;
  const legacyError = typeof legacyBody.error === 'string' ? legacyBody.error.trim() : '';
  if (legacyError !== '') {
    return formatLoginErrorMessage(legacyError);
  }

  return undefined;
}

function readLoginToken(data: LoginResponseData | undefined): string {
  const raw = typeof data?.token === 'string' ? data.token : '';
  return raw.trim();
}

function readLoginMessage(response: BaseSuccessResponse<LoginResponseData>): string | undefined {
  const trimmed = response.meta.message.trim();
  return trimmed === '' ? undefined : trimmed;
}

function readLoginRole(data: LoginResponseData | undefined): EUserRole | undefined {
  const rawRole =
    typeof data?.role === 'string'
      ? data.role
      : typeof data?.user?.role === 'string'
        ? data.user.role
        : undefined;
  return parseApiUserRole(rawRole);
}

export async function loginWithUsernamePassword(
  credentials: LoginCredentials
): Promise<LoginSuccessPayload> {
  const response = await apiV1Json<BaseSuccessResponse<LoginResponseData>>('auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  const failureMessage = readLoginFailureMessage(response);
  if (failureMessage !== undefined) {
    throw new LoginApiError(failureMessage);
  }

  const payload = unwrapApiData<LoginResponseData>(response);
  const token = readLoginToken(payload);
  if (token === '') {
    throw new LoginApiError('Gagal masuk. Token tidak diterima.');
  }

  const message = readLoginMessage(response) ?? 'Login berhasil';
  const role = readLoginRole(payload);

  return { message, token, role };
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof LoginApiError) {
    return error.message;
  }
  if (error instanceof ApiHttpError) {
    try {
      const parsed = JSON.parse(error.responseBody) as Record<string, unknown>;
      const metaMessage = readApiMeta(parsed)?.message;
      const raw =
        (typeof metaMessage === 'string' && metaMessage) ||
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
