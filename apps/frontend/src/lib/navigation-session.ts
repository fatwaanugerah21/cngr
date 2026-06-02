export enum EUserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  DIRECTOR = 'DIRECTOR',
}

export function formatUserRoleLabel(role: EUserRole): string {
  switch (role) {
    case EUserRole.ADMIN:
      return 'Admin';
    case EUserRole.SUPERVISOR:
      return 'Supervisor';
    case EUserRole.DIRECTOR:
      return 'Director';
    default:
      return role;
  }
}

/** ADMIN and DIRECTOR share the same application access. */
export function hasAdminAccess(role: EUserRole | undefined): boolean {
  return role === EUserRole.ADMIN || role === EUserRole.DIRECTOR;
}

export function parseApiUserRole(raw: unknown): EUserRole | undefined {
  const normalized = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  if (normalized === EUserRole.ADMIN) {
    return EUserRole.ADMIN;
  }
  if (normalized === EUserRole.SUPERVISOR) {
    return EUserRole.SUPERVISOR;
  }
  if (normalized === EUserRole.DIRECTOR) {
    return EUserRole.DIRECTOR;
  }
  return undefined;
}

export type SelectedSite = {
  id: string;
  name: string;
};

export function isUnresolvedSiteDisplayName(site: SelectedSite): boolean {
  const name = site.name.trim();
  return name === '' || name === site.id;
}

export function resolveSelectedSiteDisplayName(
  site: SelectedSite | undefined,
  detailName?: string,
  fallback = 'Site'
): string {
  const fromDetail = detailName?.trim();
  if (fromDetail && site && fromDetail !== site.id) {
    return fromDetail;
  }
  if (fromDetail && !site) {
    return fromDetail;
  }
  if (!site) {
    return fallback;
  }
  const fromSelection = site.name.trim();
  if (fromSelection && fromSelection !== site.id) {
    return fromSelection;
  }
  return fallback;
}

const USER_ROLE_STORAGE_KEY = 'cngr_user_role';
const SELECTED_SITE_STORAGE_KEY = 'cngr_selected_site';

function dispatchNavigationSessionChange(): void {
  window.dispatchEvent(new Event('cngr-navigation-session-change'));
}

export function getStoredUserRole(): EUserRole {
  const stored = sessionStorage.getItem(USER_ROLE_STORAGE_KEY);
  return parseApiUserRole(stored) ?? EUserRole.ADMIN;
}

export function setStoredUserRole(role: EUserRole): void {
  const parsed = parseApiUserRole(role);
  if (!parsed) {
    return;
  }
  sessionStorage.setItem(USER_ROLE_STORAGE_KEY, parsed);
  dispatchNavigationSessionChange();
}

export function getStoredSelectedSite(): SelectedSite | undefined {
  const raw = sessionStorage.getItem(SELECTED_SITE_STORAGE_KEY);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as Partial<SelectedSite>;
    if (typeof parsed.id !== 'string' || typeof parsed.name !== 'string') {
      return undefined;
    }
    return { id: parsed.id, name: parsed.name };
  } catch {
    return undefined;
  }
}

export function setStoredSelectedSite(site: SelectedSite): void {
  sessionStorage.setItem(SELECTED_SITE_STORAGE_KEY, JSON.stringify(site));
  dispatchNavigationSessionChange();
}

export function clearStoredSelectedSite(): void {
  sessionStorage.removeItem(SELECTED_SITE_STORAGE_KEY);
  dispatchNavigationSessionChange();
}

export function clearNavigationSession(): void {
  sessionStorage.removeItem(USER_ROLE_STORAGE_KEY);
  sessionStorage.removeItem(SELECTED_SITE_STORAGE_KEY);
  dispatchNavigationSessionChange();
}
