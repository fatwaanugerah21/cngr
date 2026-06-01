const SITE_ONLY_ROUTE_PREFIXES = [
  '/site-dashboard',
  '/production',
  '/land-opening',
  '/rehab-das',
  '/reclamation',
  '/report',
  '/document',
  '/rules',
] as const;

export const SITE_MANAGEMENT_PATH = '/site-management';

export function isSiteOnlyNavRoute(pathname: string): boolean {
  return SITE_ONLY_ROUTE_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
