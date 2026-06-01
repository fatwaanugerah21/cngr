import type { FieldErrors, FieldValues } from 'react-hook-form';
import { formatNumberDisplay } from './formatters';

export function getTodayIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Strips Indonesian thousand separators; decimal comma becomes dot. */
export function normalizeNumberFieldInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const endsWithDecimalSeparator = /[.,]$/.test(trimmed);
  const withoutTrailingSeparator = endsWithDecimalSeparator ? trimmed.slice(0, -1) : trimmed;
  const normalized = withoutTrailingSeparator.replace(/\./g, '').replace(',', '.');

  if (!normalized) {
    return '';
  }

  if (endsWithDecimalSeparator) {
    return `${normalized}.`;
  }

  return normalized;
}

export function parseNumberFieldValue(value: string): number {
  return Number(normalizeNumberFieldInput(value));
}

export function formatNumberFieldDisplay(value: string): string {
  const normalized = normalizeNumberFieldInput(value);
  if (!normalized) {
    return '';
  }

  if (normalized.endsWith('.') && normalized.length > 1) {
    const integerPart = normalized.slice(0, -1);
    const parsedInteger = Number(integerPart);
    if (Number.isFinite(parsedInteger)) {
      return `${formatNumberDisplay(parsedInteger)},`;
    }
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return value;
  }

  return formatNumberDisplay(parsed);
}

export function scrollToFirstFieldError<T extends FieldValues>(errors: FieldErrors<T>) {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) {
    return;
  }

  const element =
    document.querySelector<HTMLElement>(`[name="${firstKey}"]`) ??
    document.getElementById(firstKey);

  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element?.focus({ preventScroll: true });
}
