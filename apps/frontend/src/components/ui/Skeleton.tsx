import { COLORS } from '../../constants/colors';

export type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          ${COLORS.skeletonTrack} 0%,
          ${COLORS.skeleton} 45%,
          ${COLORS.skeletonTrack} 90%
        )`,
        backgroundSize: '200% 100%',
        animation: 'var(--animate-skeleton)',
      }}
      aria-hidden
    />
  );
}
