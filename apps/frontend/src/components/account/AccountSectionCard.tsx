import type { ReactNode } from 'react';
import { COLORS } from '../../constants/colors';

export interface AccountSectionCardProps {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}

export default function AccountSectionCard({ step, title, description, children }: AccountSectionCardProps) {
  return (
    <section
      className="rounded-2xl border bg-white p-6 shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <div className="mb-6 flex gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: COLORS.primary }}
          aria-hidden
        >
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold" style={{ color: COLORS.textPrimary }}>
            {title}
          </h2>
          <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}
