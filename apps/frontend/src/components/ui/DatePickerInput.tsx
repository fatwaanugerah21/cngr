import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { COLORS } from '../../constants/colors';

export interface DatePickerInputProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const COMPACT_PANEL_WIDTH = 300;

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDisplayDate(value: string): string {
  const parsed = parseIsoDate(value);
  if (!parsed) return '';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DatePickerInput({
  label,
  error,
  value,
  onChange,
  placeholder = 'Select date',
  minYear = 1970,
  maxYear = 2100,
  size = 'md',
  className = '',
  disabled,
}: DatePickerInputProps) {
  const generatedId = useId();
  const triggerId = `datepicker-${generatedId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    setViewMonth(selectedDate.getMonth());
    setViewYear(selectedDate.getFullYear());
  }, [selectedDate]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }

    const updatePanelPosition = () => {
      const triggerEl = triggerRef.current;
      const panelEl = panelRef.current;
      if (!triggerEl || !panelEl) return;

      const triggerRect = triggerEl.getBoundingClientRect();
      const panelRect = panelEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 8;
      const gutter = 8;

      const spaceBelow = viewportHeight - triggerRect.bottom - gutter - margin;
      const spaceAbove = triggerRect.top - gutter - margin;
      const shouldPlaceAbove = spaceBelow < 260 && spaceAbove > spaceBelow;

      let top = shouldPlaceAbove
        ? triggerRect.top - panelRect.height - gutter
        : triggerRect.bottom + gutter;

      const maxHeight = shouldPlaceAbove
        ? Math.max(200, triggerRect.top - gutter - margin)
        : Math.max(200, viewportHeight - triggerRect.bottom - gutter - margin);

      if (top < margin) top = margin;
      if (top + panelRect.height > viewportHeight - margin) {
        top = Math.max(margin, viewportHeight - panelRect.height - margin);
      }

      const preferredLeft = triggerRect.left;
      const maxLeft = viewportWidth - panelRect.width - margin;
      const left = Math.min(Math.max(preferredLeft, margin), Math.max(margin, maxLeft));

      setPanelStyle({
        top,
        left,
        width: COMPACT_PANEL_WIDTH,
        maxHeight,
      });
    };

    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open, viewMonth, viewYear]);

  const yearOptions = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, idx) => minYear + idx),
    [minYear, maxYear]
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const leadingDays = (firstDay + 6) % 7;
  const trailingDays = (7 - ((leadingDays + daysInMonth) % 7)) % 7;
  const cells: CalendarCell[] = [
    ...Array.from({ length: leadingDays }, (_, idx) => ({
      date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - leadingDays + idx + 1),
      inCurrentMonth: false,
    })),
    ...Array.from({ length: daysInMonth }, (_, idx) => ({
      date: new Date(viewYear, viewMonth, idx + 1),
      inCurrentMonth: true,
    })),
    ...Array.from({ length: trailingDays }, (_, idx) => ({
      date: new Date(viewYear, viewMonth + 1, idx + 1),
      inCurrentMonth: false,
    })),
  ];

  const changeMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  };

  return (
    <div className={`flex flex-col ${className}`.trim()} ref={rootRef}>
      {label ? (
        <label htmlFor={triggerId} className="mb-1.5 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
        </label>
      ) : null}

      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={`relative w-full rounded-lg border bg-white text-left outline-none transition-colors ${sizeStyles[size]}`}
        style={{
          borderColor: error ? '#EF4444' : COLORS.border,
          color: value ? COLORS.textPrimary : COLORS.textSecondary,
        }}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = COLORS.primary;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary}30`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#EF4444' : COLORS.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>{toDisplayDate(value) || placeholder}</span>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: COLORS.textSecondary }}
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M3 7H15" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 2.5V5.5M12 2.5V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="fixed z-50 overflow-y-auto rounded-xl border bg-white p-3 shadow-lg"
          style={{
            borderColor: COLORS.border,
            top: panelStyle?.top ?? 0,
            left: panelStyle?.left ?? 0,
            width: panelStyle?.width ?? COMPACT_PANEL_WIDTH,
            maxHeight: panelStyle?.maxHeight ?? 320,
            visibility: panelStyle ? 'visible' : 'hidden',
          }}
        >
          <div className="mb-2.5 flex items-center gap-1.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md border text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="rounded-md border px-2 py-0.5 text-xs font-semibold outline-none"
              style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="rounded-md border px-2 py-0.5 text-xs font-semibold outline-none"
              style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
              onClick={() => changeMonth(1)}
              aria-label="Next month"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold" style={{ color: COLORS.textSecondary }}>
            {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, idx) => (
              <span key={`${day}-${idx}`}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell) => {
              const iso = toIsoDate(cell.date);
              const isSelected = iso === value;
              const isToday = iso === toIsoDate(today);
              return (
                <button
                  key={iso}
                  type="button"
                  className="mx-auto flex h-7 w-7 items-center justify-center rounded-md text-sm leading-none transition-colors"
                  style={{
                    fontSize: '14px',
                    color: isSelected
                      ? COLORS.white
                      : cell.inCurrentMonth
                        ? COLORS.textPrimary
                        : 'color-mix(in srgb, #94A3B8 60%, #FFFFFF)',
                    backgroundColor: isSelected ? COLORS.primary : 'transparent',
                    border: !isSelected && isToday ? '1px solid #93C5FD' : '1px solid transparent',
                  }}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t pt-2.5" style={{ borderColor: COLORS.border }}>
            <button
              type="button"
              className="text-xs font-semibold"
              style={{ color: COLORS.textSecondary }}
              onClick={() => onChange('')}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-xs font-semibold"
              style={{ color: '#2563EB' }}
              onClick={() => {
                onChange(toIsoDate(today));
                setViewMonth(today.getMonth());
                setViewYear(today.getFullYear());
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
