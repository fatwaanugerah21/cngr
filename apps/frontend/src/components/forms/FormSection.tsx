import type { ReactNode } from 'react';
import { COLORS } from '../../constants/colors';

export interface FormSectionProps {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}

export default function FormSection({ step, title, description, children }: FormSectionProps) {
  return (
    <section
      className="rounded-xl border bg-white p-6 shadow-sm"
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
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
