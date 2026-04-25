import { COLORS } from '../../constants/colors';

export interface ProfileCompletionBarProps {
  percent: number;
  className?: string;
}

export default function ProfileCompletionBar({ percent, className = '' }: ProfileCompletionBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={`rounded-2xl border bg-white px-5 py-4 shadow-sm ${className}`.trim()}
      style={{ borderColor: COLORS.border }}
    >
      <p className="mb-2 text-sm font-medium" style={{ color: COLORS.textSecondary }}>
        {clamped}% profil Anda telah lengkap
      </p>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: COLORS.border }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${clamped}%`, backgroundColor: COLORS.success }}
        />
      </div>
    </div>
  );
}
