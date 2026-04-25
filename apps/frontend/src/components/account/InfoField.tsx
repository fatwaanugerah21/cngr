import type { ReactNode } from 'react';
import { COLORS } from '../../constants/colors';

export interface InfoFieldProps {
  label: string;
  value: string;
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
        {value}
      </span>
    </div>
  );
}

export interface InfoFieldGridProps {
  children: ReactNode;
}

export function InfoFieldGrid({ children }: InfoFieldGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">{children}</div>
  );
}
