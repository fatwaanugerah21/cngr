import { createContext, useContext } from 'react';
import { resolveSelectedSiteDisplayName, type SelectedSite } from './navigation-session';

export type SiteContextValue = {
  selectedSite: SelectedSite | undefined;
  setSelectedSite: (site: SelectedSite) => void;
  clearSelectedSite: () => void;
};

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite must be used inside SiteProvider');
  }
  return ctx;
}

export function useSelectedSiteName(fallback = 'Site'): string {
  const { selectedSite } = useSite();
  return resolveSelectedSiteDisplayName(selectedSite, undefined, fallback);
}

export { SiteContext };

