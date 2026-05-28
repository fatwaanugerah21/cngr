export type ApiResponseMeta = {
  code: number;
  status: string;
  message: string;
  timestamp: string;
};

export type BaseSuccessResponse<T> = {
  data?: T;
  meta: ApiResponseMeta;
};

/** Payload shape for `GET /auth/me`. */
export type AuthMeData = {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  site_id: number;
  email: string;
  role: string;
  nik: string;
  gender: string;
  position: string;
  birth_date: string;
  province: string | null;
  city: string | null;
  postal_code: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readApiMeta(value: unknown): ApiResponseMeta | undefined {
  if (!isRecord(value) || !isRecord(value.meta)) {
    return undefined;
  }

  const { meta } = value;
  if (
    typeof meta.code !== 'number' ||
    typeof meta.status !== 'string' ||
    typeof meta.message !== 'string' ||
    typeof meta.timestamp !== 'string'
  ) {
    return undefined;
  }

  return {
    code: meta.code,
    status: meta.status,
    message: meta.message,
    timestamp: meta.timestamp,
  };
}

export function isApiSuccess(value: unknown): boolean {
  const meta = readApiMeta(value);
  if (!meta) {
    return true;
  }

  const status = meta.status.trim().toLowerCase();
  if (status === 'success') {
    return true;
  }

  return meta.code >= 200 && meta.code < 300;
}

export function unwrapApiData<T>(value: unknown): T | undefined {
  if (!isRecord(value)) {
    return value as T | undefined;
  }

  if ('data' in value) {
    return value.data as T | undefined;
  }

  return value as T;
}
