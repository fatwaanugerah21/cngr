import { COLORS } from '../../constants/colors';
import { Skeleton } from '../ui';

function SiteCardSkeleton() {
  return (
    <div
      className="flex min-h-[172px] flex-col rounded-2xl border bg-white p-5 shadow-sm"
      style={{ borderColor: COLORS.border }}
      aria-hidden
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4 max-w-[180px]" />
        <Skeleton className="h-3 w-2/3 max-w-[140px]" />
      </div>
      <Skeleton className="mt-4 h-10 w-full rounded-full" />
    </div>
  );
}

export type SiteCardGridSkeletonProps = {
  cardCount?: number;
  loadingLabel?: string;
};

export default function SiteCardGridSkeleton({
  cardCount = 9,
  loadingLabel = 'Loading sites…',
}: SiteCardGridSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={loadingLabel}>
      <span className="sr-only">{loadingLabel}</span>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cardCount }, (_, index) => (
          <SiteCardSkeleton key={index} />
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row" aria-hidden>
        <Skeleton className="h-3 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
