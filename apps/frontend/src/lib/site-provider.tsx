import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { clearStoredSelectedSite, getStoredSelectedSite, setStoredSelectedSite, EUserRole, type SelectedSite } from './navigation-session';
import { fetchSiteDetail } from './cngr-api';
import { useAuth } from './auth-context';
import { SiteContext } from './site-context';

export default function SiteProvider({ children }: { children: ReactNode }) {
  const [selectedSite, setSelectedSiteState] = useState<SelectedSite | undefined>(() => getStoredSelectedSite());
  const { user } = useAuth();

  useEffect(() => {
    const sync = () => setSelectedSiteState(getStoredSelectedSite());

    // Keep context state in sync with session changes triggered elsewhere.
    window.addEventListener('cngr-navigation-session-change', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('cngr-navigation-session-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (selectedSite != null) return;

    if (user?.role !== EUserRole.SUPERVISOR) return;
    if (!user?.siteId) return;

    // Set immediately to avoid UI/route guards redirecting while we fetch details.
    const supervisorSiteId = user.siteId;
    const supervisorSitePlaceholder: SelectedSite = {
      id: supervisorSiteId,
      name: supervisorSiteId,
    };

    setSelectedSiteState(supervisorSitePlaceholder);
    setStoredSelectedSite(supervisorSitePlaceholder);

    let cancelled = false;

    (async () => {
      try {
        const siteDetail = await fetchSiteDetail(supervisorSiteId);
        if (cancelled || !siteDetail) return;

        const supervisorSiteDetail: SelectedSite = {
          id: siteDetail.id,
          name: siteDetail.name,
        };

        setSelectedSiteState(supervisorSiteDetail);
        setStoredSelectedSite(supervisorSiteDetail);
      } catch {
        // If site detail fetch fails, keep the placeholder site selection.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSite, user]);

  const setSelectedSite = useCallback((site: SelectedSite) => {
    setSelectedSiteState(site);
    setStoredSelectedSite(site);
  }, []);

  const clearSelectedSite = useCallback(() => {
    setSelectedSiteState(undefined);
    clearStoredSelectedSite();
  }, []);

  const value = useMemo(
    () => ({
      selectedSite,
      setSelectedSite,
      clearSelectedSite,
    }),
    [selectedSite, setSelectedSite, clearSelectedSite]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

