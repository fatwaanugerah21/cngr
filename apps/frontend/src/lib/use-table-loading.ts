import { useCallback, useState } from 'react';

type UseTableLoadingOptions = {
  initialLoading?: boolean;
};

export function useTableLoading(loadKey: string, options: UseTableLoadingOptions = {}) {
  const { initialLoading = true } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadedKey, setLoadedKey] = useState<string | undefined>();

  const showSkeleton = loadKey !== '' && (isLoading || loadedKey !== loadKey);

  const startLoad = useCallback(() => {
    setIsLoading(true);
  }, []);

  const finishLoad = useCallback((key: string) => {
    setIsLoading(false);
    setLoadedKey(key);
  }, []);

  const resetLoad = useCallback(() => {
    setIsLoading(false);
    setLoadedKey(undefined);
  }, []);

  return {
    isLoading,
    showSkeleton,
    startLoad,
    finishLoad,
    resetLoad,
  };
}
