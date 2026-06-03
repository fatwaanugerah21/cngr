const numberDisplayFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

const tableDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function parseTableDateValue(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yearRaw, monthRaw, dayRaw] = trimmed.split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    if (!year || !month || !day) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTableDateTimestamp(value: string): number {
  const parsed = parseTableDateValue(value);
  console.log("parsed: ", parsed);
  
  return parsed?.getTime() ?? 0;
}

/** Sort comparator for table rows: newest date first. */
export function compareTableDatesDesc(left: string, right: string): number {
  return getTableDateTimestamp(right) - getTableDateTimestamp(left);
}

export function sortRowsByTableDateDesc<T extends { date: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => compareTableDatesDesc(a.date, b.date));
}

/** Formats as DD MMMM YYYY (e.g. 01 Juni 2026). */
export function formatTableDate(value: string | null | undefined): string {
  if (!value || value === '-') {
    return value || '-';
  }

  const parsed = parseTableDateValue(value);
  if (!parsed) {
    return value;
  }

  return tableDateFormatter.format(parsed);
}

export function formatNumberDisplay(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return value == null ? '' : String(value);
  }

  return numberDisplayFormatter.format(value);
}

export function formatAmountWithSuffix(
  value: number | null | undefined,
  suffix: string | null | undefined
): string {
  const formatted = formatNumberDisplay(value);
  const trimmedSuffix = suffix?.trim();
  return trimmedSuffix ? `${formatted} ${trimmedSuffix}` : formatted;
}

export function formatPercentDisplay(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return value == null ? '' : String(value);
  }

  return `${formatNumberDisplay(value)}%`;
}
