import { useCallback, useState } from 'react';

export function useSiteTableLoading(selectedSiteId: string | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSiteId, setLoadedSiteId] = useState<string | undefined>();

  const showSkeleton = Boolean(selectedSiteId) && (isLoading || loadedSiteId !== selectedSiteId);

  const startLoad = useCallback(() => {
    setIsLoading(true);
  }, []);

  const finishLoad = useCallback((siteId: string) => {
    setIsLoading(false);
    setLoadedSiteId(siteId);
  }, []);

  const resetForNoSite = useCallback(() => {
    setIsLoading(false);
    setLoadedSiteId(undefined);
  }, []);

  return {
    isLoading,
    showSkeleton,
    startLoad,
    finishLoad,
    resetForNoSite,
  };
}
