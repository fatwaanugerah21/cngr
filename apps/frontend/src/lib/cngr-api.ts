import { API_ORIGIN, ApiHttpError, apiV1Fetch, apiV1Json } from './api';
import { type AuthMeData, type BaseSuccessResponse, unwrapApiData } from './api-response';
import { EUserRole, parseApiUserRole } from './navigation-session';
import type { SiteRecord } from '../data/sites-dummy';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRecord(value: unknown): UnknownRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function unwrapNestedUser(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (isRecord(value.user)) {
    return value.user;
  }

  if (isRecord(value.data)) {
    return value.data;
  }

  return value;
}

function extractArray(value: unknown): unknown[] {
  const data = unwrapApiData<unknown>(value);
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const arrayKeys = ['items', 'rows', 'results', 'sites', 'users', 'records'];
  for (const key of arrayKeys) {
    const candidate = data[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function extractTotalCount(value: unknown): number | undefined {
  const data = unwrapApiData<unknown>(value);
  const source = isRecord(data) ? data : isRecord(value) ? value : undefined;
  if (!source) {
    return undefined;
  }

  const meta = isRecord(source.meta) ? source.meta : undefined;
  const total = firstNumber(
    meta?.total,
    meta?.count,
    meta?.total_count,
    source.total,
    source.count,
    source.total_count,
    source.totalCount
  );
  return total;
}

function firstDateString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }
  return undefined;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function firstNestedRecord(...values: unknown[]): UnknownRecord | undefined {
  for (const value of values) {
    if (isRecord(value)) {
      return value;
    }
  }
  return undefined;
}

function joinName(firstName: string, lastName: string, fallback: string): string {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName !== '' ? fullName : fallback;
}

function normalizeStatus(value: unknown): SiteRecord['status'] {
  const status = firstString(value).toLowerCase();
  return status === 'inactive' || status === 'nonaktif' ? 'inactive' : 'active';
}

function normalizeLocation(record: UnknownRecord): string {
  const address = firstString(record.address, record.location, record.address_line, record.addressLine);
  if (address !== '') {
    return address;
  }

  const city = firstString(record.city);
  const province = firstString(record.province);
  const location = [city, province].filter(Boolean).join(', ');
  return location !== '' ? location : '—';
}

export type SupervisorOption = {
  value: string;
  label: string;
};

export type CreateSitePayload = {
  address: string;
  city: string;
  province: string;
  sitename: string;
  supervisor_id: number;
};

export type CreateProductionPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type UpdateProductionPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type ProductionEditState = {
  date: string;
  realization: number;
  target: number;
};

export type CreateReclamationPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type UpdateReclamationPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type ReclamationEditState = {
  date: string;
  realization: number;
  target: number;
};

export type CreateLandOpeningPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type UpdateLandOpeningPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type LandOpeningEditState = {
  date: string;
  realization: number;
  target: number;
};

export type CreateRehabDasPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type UpdateRehabDasPayload = {
  actual: number;
  date: string;
  site_id: number;
  target: number;
};

export type RehabDasEditState = {
  date: string;
  realization: number;
  target: number;
};

export type UpdateProfilePayload = {
  birth_date?: string;
  city?: string;
  email?: string;
  firstname?: string;
  gender?: string;
  lastname?: string;
  nik?: string;
  password?: string;
  position?: string;
  postal_code?: string;
  phone_number?: string;
  province?: string;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
};

export type AccountProfileData = {
  id: string;
  role: EUserRole;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  gender: string;
  jobTitle: string;
  city: string;
  province: string;
  postalCode: string;
  birthDate: string;
  phone: string;
  locationLabel: string;
  siteId?: string;
};

export type UserManagementRecord = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  role: string;
  nik: string;
  email: string;
  gender: string;
  position: string;
  avatarUrl?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  birthDate?: string;
  phone?: string;
};

export type CreateUserPayload = {
  email: string;
  firstname: string;
  gender: string;
  lastname: string;
  nik: string;
  password: string;
  phone_number?: string;
  position: string;
  role: string;
  username: string;
};

export type UpdateUserPayload = {
  email: string;
  firstname: string;
  gender: string;
  lastname: string;
  nik: string;
  position: string;
  role: string;
  username: string;
  password?: string;
};

export type ProductionRecord = {
  id: string;
  date: string;
  site: string;
  realization: number;
  target: number;
  efficiency: string;
  status: string;
};

export type UploadedFileRecord = {
  id: string;
  title: string;
  uploadTime: string;
  uploader: string;
  uploaderAvatar?: string;
  fileUrl?: string;
  siteId?: string;
  description?: string;
};

export type DocumentRecord = UploadedFileRecord;
export type ReportRecord = UploadedFileRecord;
export type RegulationRecord = UploadedFileRecord;

export type UploadedFileEditState = {
  title: string;
  description?: string;
};

export type DocumentEditState = UploadedFileEditState;
export type ReportEditState = UploadedFileEditState;
export type RegulationEditState = UploadedFileEditState;

export type CreateUploadedFilePayload = {
  title: string;
  description?: string;
  file: File;
  siteId: string;
};

export type CreateDocumentPayload = CreateUploadedFilePayload;
export type CreateReportPayload = CreateUploadedFilePayload;
export type CreateRegulationPayload = CreateUploadedFilePayload;

export type UpdateUploadedFilePayload = {
  title: string;
  description?: string;
  file?: File | null;
};

export type UpdateDocumentPayload = UpdateUploadedFilePayload;
export type UpdateReportPayload = UpdateUploadedFilePayload;
export type UpdateRegulationPayload = UpdateUploadedFilePayload;

const UPLOAD_MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

function normalizeSite(raw: unknown): SiteRecord | undefined {
  const record = readRecord(raw);
  if (!record) {
    return undefined;
  }

  const id = firstString(record.id, record.siteID, record.siteId, record.site_id);
  if (id === '') {
    return undefined;
  }

  const supervisor = firstNestedRecord(record.supervisor, record.pic, record.user);
  const name = firstString(record.sitename, record.siteName, record.name);
  const picName = firstString(
    record.picName,
    record.pic_name,
    record.supervisor_name,
    record.supervisorName,
    supervisor?.firstname,
    supervisor?.firstName,
    supervisor?.first_name,
    supervisor?.name,
    supervisor?.full_name,
    supervisor?.fullName,
    supervisor?.displayName,
    record.supervisor_fullname,
    record.supervisorFullName
  );
  const picAvatar = firstString(
    record.picAvatar,
    record.pic_avatar,
    record.supervisor_avatar,
    record.supervisorAvatar,
    supervisor?.avatarUrl,
    supervisor?.avatar_url,
    supervisor?.avatar,
    supervisor?.photo
  );

  return {
    id,
    name: name !== '' ? name : `Site ${id}`,
    picName: picName !== '' ? picName : '-',
    picAvatar: picAvatar !== '' ? picAvatar : undefined,
    province: firstString(record.province, record.province_name) || '-',
    location: normalizeLocation(record),
    status: normalizeStatus(record.status),
    supervisorId: firstString(record.supervisor_id, record.supervisorId, record.supervisor_id),
  };
}

function normalizeSupervisorOption(raw: unknown): SupervisorOption | undefined {
  const record = readRecord(raw);
  if (!record) {
    return undefined;
  }

  const value = firstString(record.id, record.user_id, record.userId, record.userid);
  if (value === '') {
    return undefined;
  }

  const firstName = firstString(record.firstname, record.first_name, record.firstName);
  const lastName = firstString(record.lastname, record.last_name, record.lastName);
  const username = firstString(record.username);
  const email = firstString(record.email);

  return {
    value,
    label: joinName(firstName, lastName, username || email || `User ${value}`),
  };
}

function toDisplayDate(value: unknown): string {
  const text = firstString(value);
  return text !== '' ? text : '-';
}

function formatUploadTime(value: unknown): string {
  const record = readRecord(value);
  const iso = firstDateString(
    record?.created_at,
    record?.createdAt,
    record?.updated_at,
    record?.updatedAt,
    record?.uploaded_at,
    record?.uploadedAt,
    value
  );
  if (!iso) {
    return firstString(value) || '-';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return firstString(value) || '-';
  }

  const day = date.getDate();
  const month = UPLOAD_MONTHS_ID[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} – ${hours}.${minutes}`;
}

export function resolveUploadedFileUrl(path: string): string {
  const trimmed = path.trim();
  if (trimmed === '') {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_ORIGIN}${normalized}`;
}

/** @deprecated Use {@link resolveUploadedFileUrl} */
export const resolveDocumentFileUrl = resolveUploadedFileUrl;

type NormalizeUploadedFileOptions = {
  extraIdKeys?: string[];
  extraTitleKeys?: string[];
  extraFileKeys?: string[];
};

function normalizeUploadedFileRecord(
  raw: unknown,
  options: NormalizeUploadedFileOptions = {}
): UploadedFileRecord | undefined {
  const record = readRecord(raw);
  if (!record) {
    return undefined;
  }

  const id = firstString(record.id, record.uuid, ...(options.extraIdKeys ?? []));
  if (id === '') {
    return undefined;
  }

  const title = firstString(record.title, record.name, ...(options.extraTitleKeys ?? []));
  if (title === '') {
    return undefined;
  }

  const uploaderUser = firstNestedRecord(record.user, record.uploader, record.uploaded_by, record.created_by);
  const uploaderFirstName = firstString(
    uploaderUser?.firstname,
    uploaderUser?.first_name,
    uploaderUser?.firstName,
    record.uploader_firstname,
    record.uploaderFirstname
  );
  const uploaderLastName = firstString(
    uploaderUser?.lastname,
    uploaderUser?.last_name,
    uploaderUser?.lastName,
    record.uploader_lastname,
    record.uploaderLastname
  );
  const uploaderFallback = firstString(
    record.created_by,
    record.createdBy,
    record.uploader_name,
    record.uploaderName,
    record.uploaded_by_name,
    record.uploadedByName,
    record.uploader,
    record.uploaded_by,
    record.uploadedBy
  );
  const uploader = joinName(uploaderFirstName, uploaderLastName, uploaderFallback);

  const uploaderAvatar = firstString(
    uploaderUser?.avatarUrl,
    uploaderUser?.avatar_url,
    uploaderUser?.avatar,
    uploaderUser?.photo,
    record.uploader_avatar,
    record.uploaderAvatar
  );

  const filePath = firstString(
    record.file_url,
    record.fileUrl,
    record.file_path,
    record.filePath,
    record.url,
    record.path,
    ...(options.extraFileKeys ?? [])
  );

  const siteIdRaw = firstNumber(record.site_id, record.siteId, record.siteID);
  const siteId = siteIdRaw !== undefined && siteIdRaw > 0 ? String(siteIdRaw) : undefined;

  return {
    id,
    title,
    uploadTime: formatUploadTime(record),
    uploader,
    uploaderAvatar:
      uploaderAvatar !== '' ? resolveUploadedFileUrl(uploaderAvatar) : undefined,
    fileUrl: filePath !== '' ? resolveUploadedFileUrl(filePath) : undefined,
    siteId,
    description: firstString(record.description, record.summary) || undefined,
  };
}

function normalizeDocument(raw: unknown): DocumentRecord | undefined {
  return normalizeUploadedFileRecord(raw, {
    extraIdKeys: ['documentId', 'documentID'],
    extraTitleKeys: ['document_title', 'documentTitle'],
    extraFileKeys: ['document_url', 'documentUrl'],
  });
}

function normalizeReport(raw: unknown): ReportRecord | undefined {
  return normalizeUploadedFileRecord(raw, {
    extraIdKeys: ['reportId', 'reportID'],
    extraTitleKeys: ['report_title', 'reportTitle'],
    extraFileKeys: ['report_url', 'reportUrl'],
  });
}

function normalizeRegulation(raw: unknown): RegulationRecord | undefined {
  return normalizeUploadedFileRecord(raw, {
    extraIdKeys: ['regulationId', 'regulationID'],
    extraTitleKeys: ['regulation_title', 'regulationTitle'],
    extraFileKeys: ['regulation_url', 'regulationUrl'],
  });
}

async function listUploadedFilesPaginated(
  path: string,
  page: number,
  limit: number,
  normalize: (raw: unknown) => UploadedFileRecord | undefined
): Promise<{ items: UploadedFileRecord[]; total?: number }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiV1Json<unknown>(`${path}?${query.toString()}`);

  return {
    items: extractArray(response)
      .map(normalize)
      .filter((item): item is UploadedFileRecord => item != null),
    total: extractTotalCount(response),
  };
}

async function fetchUploadedFileByPath(
  path: string,
  normalize: (raw: unknown) => UploadedFileRecord | undefined
): Promise<UploadedFileRecord | undefined> {
  const response = await apiV1Json<unknown>(path);
  return normalize(unwrapApiData(response) ?? response);
}

async function createUploadedFile(path: string, payload: CreateUploadedFilePayload): Promise<void> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('title', payload.title);
  if (payload.description != null && payload.description.trim() !== '') {
    formData.append('description', payload.description.trim());
  }
  formData.append('site_id', payload.siteId);

  await apiV1Fetch(path, {
    method: 'POST',
    body: formData,
  });
}

async function updateUploadedFile(
  path: string,
  payload: UpdateUploadedFilePayload
): Promise<void> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', (payload.description ?? '').trim());
  if (payload.file) {
    formData.append('file', payload.file);
  }

  await apiV1Fetch(path, {
    method: 'PUT',
    body: formData,
  });
}

function parseContentDispositionFilename(header: string | null): string | undefined {
  if (!header) {
    return undefined;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const quotedMatch = /filename="([^"]+)"/i.exec(header);
  if (quotedMatch?.[1]) {
    return quotedMatch[1].trim();
  }

  const plainMatch = /filename=([^;]+)/i.exec(header);
  return plainMatch?.[1]?.trim().replace(/^"|"$/g, '');
}

function downloadFallbackFilename(title: string | undefined, id: string, prefix: string): string {
  const base = (title?.trim() || `${prefix}-${id}`).replace(/[/\\?%*:|"<>]/g, '-');
  return base.includes('.') ? base : `${base}.pdf`;
}

async function fetchUploadedFileAsFile(path: string, fallbackFilename: string): Promise<File> {
  const response = await apiV1Fetch(path);
  const blob = await response.blob();
  const filename =
    parseContentDispositionFilename(response.headers.get('Content-Disposition')) ?? fallbackFilename;
  const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'application/pdf';
  return new File([blob], filename, { type });
}

async function downloadUploadedFile(path: string, fallbackFilename: string): Promise<void> {
  const file = await fetchUploadedFileAsFile(path, fallbackFilename);
  const objectUrl = URL.createObjectURL(file);

  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = file.name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function normalizeProductionRecord(raw: unknown, siteName: string): ProductionRecord | undefined {
  const record = readRecord(raw);
  if (!record) {
    return undefined;
  }

  const id = firstString(record.id, record.productionId, record.productionID, record.uuid, record.key);
  if (id === '') {
    return undefined;
  }

  const actual = firstNumber(record.actual, record.realization, record.realisasi) ?? 0;
  const target = firstNumber(record.target) ?? 0;
  const efficiency = firstNumber(record.efficiency);
  const efficiencyValue =
    efficiency != null
      ? `${efficiency.toFixed(0)}%`
      : target > 0
        ? `${Math.round((actual / target) * 100)}%`
        : '0%';

  return {
    id,
    date: toDisplayDate(record.date),
    site: firstString(record.site, record.siteName, record.sitename) || siteName,
    realization: actual,
    target,
    efficiency: efficiencyValue,
    status: firstString(record.status, record.efficiency_status) || 'Unknown',
  };
}

function normalizeAccountProfile(raw: unknown): AccountProfileData | undefined {
  const record = readRecord(unwrapNestedUser(raw));
  if (!record) {
    return undefined;
  }

  const id = firstString(record.id, record.user_id, record.userId, record.userid);
  const firstname = firstString(record.firstname, record.first_name, record.firstName);
  const lastname = firstString(record.lastname, record.last_name, record.lastName);
  const email = firstString(record.email);
  const employeeId = firstString(record.nik, record.employee_id, record.employeeId);
  const gender = firstString(record.gender);
  const position = firstString(record.position, record.jobTitle, record.job_title);
  const city = firstString(record.city);
  const province = firstString(record.province);
  const postalCode = firstString(record.postal_code, record.postalCode);
  const birthDate = firstString(record.birth_date, record.birthDate);
  const phone = firstString(record.phone_number, record.phone, record.mobile, record.telephone);
  const avatarUrl = firstString(
    record.avatarUrl,
    record.avatar_url,
    record.photo,
    record.profile_image,
    record.profileImage,
    record.profile_picture,
    record.profilePicture
  );
  const role = parseApiUserRole(record.role);
  const siteIdRaw = firstNumber(record.site_id, record.siteId, record.siteID);
  const siteId = siteIdRaw !== undefined && siteIdRaw > 0 ? String(siteIdRaw) : undefined;

  if (id === '' || !role) {
    return undefined;
  }

  return {
    id,
    role,
    avatarUrl,
    firstName: firstname,
    lastName: lastname,
    email,
    employeeId,
    gender,
    jobTitle: position,
    city,
    province,
    postalCode,
    birthDate,
    phone,
    locationLabel: [city, province].filter(Boolean).join(', ') || '-',
    siteId,
  };
}

function normalizeUserManagementRecord(raw: unknown): UserManagementRecord | undefined {
  const record = readRecord(unwrapNestedUser(unwrapApiData(raw)));
  if (!record) {
    return undefined;
  }

  const id = firstString(record.id, record.user_id, record.userId, record.userid);
  if (id === '') {
    return undefined;
  }

  const firstName = firstString(record.firstname, record.first_name, record.firstName);
  const lastName = firstString(record.lastname, record.last_name, record.lastName);
  const username = firstString(record.username, record.user_name, record.login);
  const role = firstString(record.role, record.userRole, record.user_role);
  const nik = firstString(record.nik, record.employee_id, record.employeeId);
  const email = firstString(record.email);
  const gender = firstString(record.gender);
  const position = firstString(record.position, record.jobTitle, record.job_title);
  const avatarUrl = firstString(
    record.avatarUrl,
    record.avatar_url,
    record.photo,
    record.profile_image,
    record.profileImage,
    record.profile_picture,
    record.profilePicture
  );

  return {
    id,
    firstName,
    lastName,
    fullName: joinName(firstName, lastName, username || email || `User ${id}`),
    username,
    role,
    nik,
    email,
    gender,
    position,
    avatarUrl: avatarUrl !== '' ? avatarUrl : undefined,
    city: firstString(record.city) || undefined,
    province: firstString(record.province) || undefined,
    postalCode: firstString(record.postal_code, record.postalCode) || undefined,
    birthDate: firstDateString(record.birth_date, record.birthDate) || undefined,
    phone: firstString(record.phone_number, record.phone, record.mobile, record.telephone) || undefined,
  };
}

export async function fetchCurrentAccountProfile(): Promise<AccountProfileData | undefined> {
  const me = await apiV1Json<BaseSuccessResponse<AuthMeData>>('auth/me');
  const profile = normalizeAccountProfile(unwrapApiData<AuthMeData>(me));
  if (!profile?.id) {
    return profile;
  }

  try {
    const detail = await fetchUserDetail(profile.id);
    const detailedProfile = detail ? mapUserDetailToAccountProfile(detail, profile.role) : undefined;
    return detailedProfile ? { ...profile, ...detailedProfile } : profile;
  } catch {
    return profile;
  }
}

export async function listSites(): Promise<SiteRecord[]> {
  const response = await apiV1Json<unknown>('site/');
  return extractArray(response).map(normalizeSite).filter((site): site is SiteRecord => site != null);
}

export async function fetchSiteDetail(siteId: string): Promise<SiteRecord | undefined> {
  const response = await apiV1Json<unknown>(`site/${encodeURIComponent(siteId)}`);
  return normalizeSite(unwrapApiData(response));
}

export async function listSitesBySupervisor(userId: string): Promise<SiteRecord[]> {
  const response = await apiV1Json<unknown>(`site/supervisor/${encodeURIComponent(userId)}`);
  return extractArray(response).map(normalizeSite).filter((site): site is SiteRecord => site != null);
}

const USER_MANAGEMENT_LIST_LIMIT = 1000;

export async function listUsers(page = 1, limit = 10): Promise<{ items: UserManagementRecord[]; total?: number }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiV1Json<unknown>(`user/?${query.toString()}`);

  return {
    items: extractArray(response)
      .map(normalizeUserManagementRecord)
      .filter((user): user is UserManagementRecord => user != null),
    total: extractTotalCount(response),
  };
}

export async function fetchAllUsers(): Promise<UserManagementRecord[]> {
  const { items } = await listUsers(1, USER_MANAGEMENT_LIST_LIMIT);
  return items;
}

export async function listSupervisorUsers(): Promise<UserManagementRecord[]> {
  const response = await apiV1Json<unknown>('user/list-supervisors');
  return extractArray(response)
    .map(normalizeUserManagementRecord)
    .filter((user): user is UserManagementRecord => user != null);
}

export function mapUserDetailToAccountProfile(
  detail: UserManagementRecord,
  fallbackRole?: EUserRole
): AccountProfileData | undefined {
  const role = parseApiUserRole(detail.role) ?? fallbackRole;
  if (!role) {
    return undefined;
  }

  const city = detail.city ?? '';
  const province = detail.province ?? '';

  return {
    id: detail.id,
    role,
    avatarUrl: detail.avatarUrl ?? '',
    firstName: detail.firstName,
    lastName: detail.lastName,
    email: detail.email,
    employeeId: detail.nik,
    gender: detail.gender,
    jobTitle: detail.position,
    city,
    province,
    postalCode: detail.postalCode ?? '',
    birthDate: detail.birthDate ?? '',
    phone: detail.phone ?? '',
    locationLabel: [city, province].filter(Boolean).join(', ') || '-',
  };
}

export async function fetchUserDetail(userId: string): Promise<UserManagementRecord | undefined> {
  const response = await apiV1Json<unknown>(`user/${encodeURIComponent(userId)}/detail`);
  return normalizeUserManagementRecord(response);
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  await apiV1Json<unknown>('user/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiV1Json<unknown>(`user/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<void> {
  await apiV1Json<unknown>(`user/${encodeURIComponent(userId)}/profile`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function createSite(payload: CreateSitePayload): Promise<void> {
  await apiV1Json<unknown>('site/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteSite(siteId: string): Promise<void> {
  await apiV1Json<unknown>(`site/${encodeURIComponent(siteId)}`, {
    method: 'DELETE',
  });
}

export async function listSupervisors(): Promise<SupervisorOption[]> {
  const response = await apiV1Json<unknown>('user/list-supervisors');
  return extractArray(response)
    .map(normalizeSupervisorOption)
    .filter((supervisor): supervisor is SupervisorOption => supervisor != null);
}

export async function listReclamationBySite(siteId: string): Promise<ProductionRecord[]> {
  const response = await apiV1Json<unknown>(`reclamation/site/${encodeURIComponent(siteId)}`);
  return extractArray(response)
    .map((row) => normalizeProductionRecord(row, siteId))
    .filter((production): production is ProductionRecord => production != null);
}

export async function listLandOpeningBySite(siteId: string): Promise<ProductionRecord[]> {
  const response = await apiV1Json<unknown>(`land-opening/site/${encodeURIComponent(siteId)}`);
  return extractArray(response)
    .map((row) => normalizeProductionRecord(row, siteId))
    .filter((production): production is ProductionRecord => production != null);
}

export async function listProductionBySite(siteId: string): Promise<ProductionRecord[]> {
  const response = await apiV1Json<unknown>(`production/site/${encodeURIComponent(siteId)}`);
  return extractArray(response)
    .map((row) => normalizeProductionRecord(row, siteId))
    .filter((production): production is ProductionRecord => production != null);
}

export async function createProduction(payload: CreateProductionPayload): Promise<void> {
  await apiV1Json<unknown>('production/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduction(
  productionId: string,
  payload: UpdateProductionPayload
): Promise<void> {
  await apiV1Json<unknown>(`production/${encodeURIComponent(productionId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduction(productionId: string): Promise<void> {
  await apiV1Json<unknown>(`production/${encodeURIComponent(productionId)}`, {
    method: 'DELETE',
  });
}

export async function createLandOpening(payload: CreateLandOpeningPayload): Promise<void> {
  await apiV1Json<unknown>('land-opening/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateLandOpening(
  landOpeningId: string,
  payload: UpdateLandOpeningPayload
): Promise<void> {
  await apiV1Json<unknown>(`land-opening/${encodeURIComponent(landOpeningId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteLandOpening(landOpeningId: string): Promise<void> {
  await apiV1Json<unknown>(`land-opening/${encodeURIComponent(landOpeningId)}`, {
    method: 'DELETE',
  });
}

export async function listRehabDasBySite(siteId: string): Promise<ProductionRecord[]> {
  const response = await apiV1Json<unknown>(`rehab-das/site/${encodeURIComponent(siteId)}`);
  return extractArray(response)
    .map((row) => normalizeProductionRecord(row, siteId))
    .filter((production): production is ProductionRecord => production != null);
}

export async function createRehabDas(payload: CreateRehabDasPayload): Promise<void> {
  await apiV1Json<unknown>('rehab-das/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRehabDas(
  rehabDasId: string,
  payload: UpdateRehabDasPayload
): Promise<void> {
  await apiV1Json<unknown>(`rehab-das/${encodeURIComponent(rehabDasId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteRehabDas(rehabDasId: string): Promise<void> {
  await apiV1Json<unknown>(`rehab-das/${encodeURIComponent(rehabDasId)}`, {
    method: 'DELETE',
  });
}

export async function createReclamation(payload: CreateReclamationPayload): Promise<void> {
  await apiV1Json<unknown>('reclamation/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateReclamation(
  reclamationId: string,
  payload: UpdateReclamationPayload
): Promise<void> {
  await apiV1Json<unknown>(`reclamation/${encodeURIComponent(reclamationId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteReclamation(reclamationId: string): Promise<void> {
  await apiV1Json<unknown>(`reclamation/${encodeURIComponent(reclamationId)}`, {
    method: 'DELETE',
  });
}

export async function updateUserProfile(userId: string, payload: UpdateProfilePayload): Promise<void> {
  await apiV1Json<unknown>(`user/${encodeURIComponent(userId)}/profile`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function changePassword(userId: string, payload: ChangePasswordPayload): Promise<void> {
  await apiV1Json<unknown>(`auth/change-password/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function uploadUserProfileImage(userId: string, image: File): Promise<void> {
  const formData = new FormData();
  formData.append('image', image);

  await apiV1Fetch(`user/profile/${encodeURIComponent(userId)}/upload-image`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function listDocuments(
  page = 1,
  limit = 1000
): Promise<{ items: DocumentRecord[]; total?: number }> {
  return listUploadedFilesPaginated('document/', page, limit, normalizeDocument);
}

export async function listDocumentsBySite(siteId: string): Promise<DocumentRecord[]> {
  const response = await apiV1Json<unknown>(`document/site/${encodeURIComponent(siteId)}`);
  return extractArray(response)
    .map(normalizeDocument)
    .filter((document): document is DocumentRecord => document != null);
}

export async function fetchDocument(documentId: string): Promise<DocumentRecord | undefined> {
  return fetchUploadedFileByPath(`document/${encodeURIComponent(documentId)}`, normalizeDocument);
}

export async function createDocument(payload: CreateDocumentPayload): Promise<void> {
  await createUploadedFile('document/', payload);
}

export async function updateDocument(documentId: string, payload: UpdateDocumentPayload): Promise<void> {
  await updateUploadedFile(`document/${encodeURIComponent(documentId)}`, payload);
}

export async function deleteDocument(documentId: string): Promise<void> {
  await apiV1Json<unknown>(`document/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
  });
}

export async function fetchDocumentFile(documentId: string, title?: string): Promise<File> {
  return fetchUploadedFileAsFile(
    `document/download/${encodeURIComponent(documentId)}`,
    downloadFallbackFilename(title, documentId, 'document')
  );
}

export async function downloadDocument(documentId: string, title?: string): Promise<void> {
  await downloadUploadedFile(
    `document/download/${encodeURIComponent(documentId)}`,
    downloadFallbackFilename(title, documentId, 'document')
  );
}

export async function listReports(
  page = 1,
  limit = 1000
): Promise<{ items: ReportRecord[]; total?: number }> {
  return listUploadedFilesPaginated('report/', page, limit, normalizeReport);
}

export async function listReportsBySite(siteId: string): Promise<ReportRecord[]> {
  const response = await apiV1Json<unknown>(`report/site/${encodeURIComponent(siteId)}`);
  return extractArray(response)
    .map(normalizeReport)
    .filter((report): report is ReportRecord => report != null);
}

export async function fetchReport(reportId: string): Promise<ReportRecord | undefined> {
  return fetchUploadedFileByPath(`report/${encodeURIComponent(reportId)}`, normalizeReport);
}

export async function createReport(payload: CreateReportPayload): Promise<void> {
  await createUploadedFile('report/', payload);
}

export async function updateReport(reportId: string, payload: UpdateReportPayload): Promise<void> {
  await updateUploadedFile(`report/${encodeURIComponent(reportId)}`, payload);
}

export async function deleteReport(reportId: string): Promise<void> {
  await apiV1Json<unknown>(`report/${encodeURIComponent(reportId)}`, {
    method: 'DELETE',
  });
}

export async function fetchReportFile(reportId: string, title?: string): Promise<File> {
  return fetchUploadedFileAsFile(
    `report/download/${encodeURIComponent(reportId)}`,
    downloadFallbackFilename(title, reportId, 'report')
  );
}

export async function downloadReport(reportId: string, title?: string): Promise<void> {
  await downloadUploadedFile(
    `report/download/${encodeURIComponent(reportId)}`,
    downloadFallbackFilename(title, reportId, 'report')
  );
}

export async function listRegulations(
  page = 1,
  limit = 1000
): Promise<{ items: RegulationRecord[]; total?: number }> {
  return listUploadedFilesPaginated('regulation/', page, limit, normalizeRegulation);
}

export async function listRegulationsBySite(siteId: string): Promise<RegulationRecord[]> {
  try {
    const response = await apiV1Json<unknown>(`regulation/site/${encodeURIComponent(siteId)}`);
    return extractArray(response)
      .map(normalizeRegulation)
      .filter((regulation): regulation is RegulationRecord => regulation != null);
  } catch (error) {
    if (!(error instanceof ApiHttpError) || error.status !== 404) {
      throw error;
    }
  }

  const all = await listRegulations(1, 1000);
  return all.items.filter((regulation) => regulation.siteId === siteId);
}

export async function fetchRegulation(regulationId: string): Promise<RegulationRecord | undefined> {
  return fetchUploadedFileByPath(`regulation/${encodeURIComponent(regulationId)}`, normalizeRegulation);
}

export async function createRegulation(payload: CreateRegulationPayload): Promise<void> {
  await createUploadedFile('regulation/', payload);
}

export async function updateRegulation(
  regulationId: string,
  payload: UpdateRegulationPayload
): Promise<void> {
  await updateUploadedFile(`regulation/${encodeURIComponent(regulationId)}`, payload);
}

export async function deleteRegulation(regulationId: string): Promise<void> {
  await apiV1Json<unknown>(`regulation/${encodeURIComponent(regulationId)}`, {
    method: 'DELETE',
  });
}

export async function fetchRegulationFile(regulationId: string, title?: string): Promise<File> {
  return fetchUploadedFileAsFile(
    `regulation/download/${encodeURIComponent(regulationId)}`,
    downloadFallbackFilename(title, regulationId, 'regulation')
  );
}

export async function downloadRegulation(regulationId: string, title?: string): Promise<void> {
  await downloadUploadedFile(
    `regulation/download/${encodeURIComponent(regulationId)}`,
    downloadFallbackFilename(title, regulationId, 'regulation')
  );
}

export type DashboardSummaryData = {
  totalTarget: number;
  totalProduction: number;
  totalLandOpening: number;
  totalReclamation: number;
};

export type DashboardTrendPoint = {
  target: number;
  actual: number;
  date: string;
};

export type DashboardSupervisorDetail = {
  firstName: string;
  lastName: string;
  nik: string;
  position: string;
  province: string;
  address: string;
};

function normalizeDashboardTrendPoint(raw: unknown): DashboardTrendPoint | undefined {
  const record = readRecord(raw);
  if (!record) {
    return undefined;
  }

  const iso = firstDateString(record.date);
  const date = iso ?? firstString(record.date);
  if (date === '') {
    return undefined;
  }

  return {
    target: firstNumber(record.target) ?? 0,
    actual: firstNumber(record.actual) ?? 0,
    date,
  };
}

function normalizeDashboardSummary(raw: unknown): DashboardSummaryData | undefined {
  const record = readRecord(unwrapApiData(raw));
  if (!record) {
    return undefined;
  }

  return {
    totalTarget: firstNumber(record.total_target, record.totalTarget) ?? 0,
    totalProduction: firstNumber(record.total_production, record.totalProduction) ?? 0,
    totalLandOpening: firstNumber(record.total_land_opening, record.totalLandOpening) ?? 0,
    totalReclamation: firstNumber(record.total_reclamation, record.totalReclamation) ?? 0,
  };
}

function normalizeDashboardSupervisor(raw: unknown): DashboardSupervisorDetail | undefined {
  const record = readRecord(unwrapApiData(raw));
  if (!record) {
    return undefined;
  }

  return {
    firstName: firstString(record.firstname, record.first_name, record.firstName),
    lastName: firstString(record.lastname, record.last_name, record.lastName),
    nik: firstString(record.nik),
    position: firstString(record.position) || 'Supervisor Site',
    province: firstString(record.province) || '—',
    address: firstString(record.address) || '—',
  };
}

function extractDashboardTrendArray(raw: unknown): DashboardTrendPoint[] {
  const data = unwrapApiData<unknown>(raw);
  const rows = Array.isArray(data) ? data : extractArray(raw);
  return rows
    .map((row) => normalizeDashboardTrendPoint(row))
    .filter((point): point is DashboardTrendPoint => point != null);
}

export async function fetchDashboardSummary(siteId: string): Promise<DashboardSummaryData | undefined> {
  const response = await apiV1Json<unknown>(
    `dashboard/summary/site/${encodeURIComponent(siteId)}`
  );
  return normalizeDashboardSummary(response);
}

export async function fetchDashboardProductionTrend(siteId: string): Promise<DashboardTrendPoint[]> {
  const response = await apiV1Json<unknown>(
    `dashboard/production-trend/site/${encodeURIComponent(siteId)}`
  );
  return extractDashboardTrendArray(response);
}

export async function fetchDashboardLandOpeningTrend(siteId: string): Promise<DashboardTrendPoint[]> {
  const response = await apiV1Json<unknown>(
    `dashboard/land-opening-trend/site/${encodeURIComponent(siteId)}`
  );
  return extractDashboardTrendArray(response);
}

export async function fetchDashboardReclamationTrend(siteId: string): Promise<DashboardTrendPoint[]> {
  const response = await apiV1Json<unknown>(
    `dashboard/reclamation-trend/site/${encodeURIComponent(siteId)}`
  );
  return extractDashboardTrendArray(response);
}

export async function fetchDashboardRehabDasTrend(siteId: string): Promise<DashboardTrendPoint[]> {
  const response = await apiV1Json<unknown>(
    `dashboard/rehab-das-trend/site/${encodeURIComponent(siteId)}`
  );
  return extractDashboardTrendArray(response);
}

export async function fetchDashboardSupervisorDetail(
  siteId: string
): Promise<DashboardSupervisorDetail | undefined> {
  const response = await apiV1Json<unknown>(
    `dashboard/supervisor/site/${encodeURIComponent(siteId)}`
  );
  return normalizeDashboardSupervisor(response);
}
