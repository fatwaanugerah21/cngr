import { COLORS } from '../../constants/colors';
import { Skeleton } from '../ui';

function AccountSectionCardSkeleton({ fieldCount }: { fieldCount: number }) {
  return (
    <section
      className="rounded-2xl border bg-white p-6 shadow-sm"
      style={{ borderColor: COLORS.border }}
      aria-hidden
    >
      <div className="mb-6 flex gap-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: fieldCount }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full max-w-[200px]" />
          </div>
        ))}
      </div>
    </section>
  );
}

export type AccountProfileSkeletonProps = {
  loadingLabel?: string;
};

export default function AccountProfileSkeleton({
  loadingLabel = 'Loading account profile…',
}: AccountProfileSkeletonProps) {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label={loadingLabel}>
      <span className="sr-only">{loadingLabel}</span>

      <section
        className="rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: COLORS.border }}
        aria-hidden
      >
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        </div>
        <div className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center" style={{ borderColor: COLORS.border }}>
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full max-w-[200px]" />
            </div>
          ))}
        </div>
      </section>

      <AccountSectionCardSkeleton fieldCount={5} />
    </div>
  );
}
