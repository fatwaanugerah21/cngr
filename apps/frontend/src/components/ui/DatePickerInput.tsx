import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { COLORS } from '../../constants/colors';
import { applyFieldInputBlur, applyFieldInputFocus } from '../../lib/field-input-styles';
import IconButton from './IconButton';

export interface DatePickerInputProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  /** ISO date (yyyy-mm-dd); dates after this are not selectable. */
  maxDate?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const PANEL_WIDTH = 268;
const PANEL_MIN_HEIGHT = 220;
const VIEWPORT_MARGIN = 8;
const TRIGGER_GUTTER = 8;

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const weekdayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

type PickerView = 'days' | 'months' | 'years';

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

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 3L11 8L6 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="3" y="4" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 7H15" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 2.5V5.5M12 2.5V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function DatePickerInput({
  label,
  error,
  value,
  onChange,
  placeholder = 'Select date',
  minYear = 1970,
  maxYear = 2100,
  maxDate,
  size = 'md',
  className = '',
  disabled,
}: DatePickerInputProps) {
  const generatedId = useId();
  const triggerId = `datepicker-${generatedId}`;
  const panelId = `${triggerId}-panel`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const maxSelectableDate = useMemo(() => (maxDate ? parseIsoDate(maxDate) : null), [maxDate]);
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIsoDate(today), [today]);

  const isDateAfterMax = useCallback(
    (iso: string) => Boolean(maxDate && iso > maxDate),
    [maxDate]
  );

  const [open, setOpen] = useState(false);
  const [pickerView, setPickerView] = useState<PickerView>('days');
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor((selectedDate?.getFullYear() ?? today.getFullYear()) / 12) * 12
  );
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    placement: 'above' | 'below';
  } | null>(null);

  const canGoToNextMonth =
    !maxSelectableDate ||
    viewYear < maxSelectableDate.getFullYear() ||
    (viewYear === maxSelectableDate.getFullYear() && viewMonth < maxSelectableDate.getMonth());

  const blurBorderColor = error ? COLORS.primary : COLORS.border;
  const triggerBackground = open ? COLORS.white : COLORS.inputBackground;

  const closePanel = useCallback(() => {
    setOpen(false);
    setPickerView('days');
  }, []);

  const openPanel = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setPickerView('days');
    if (selectedDate) {
      setViewMonth(selectedDate.getMonth());
      setViewYear(selectedDate.getFullYear());
      setYearPageStart(Math.floor(selectedDate.getFullYear() / 12) * 12);
    } else {
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
      setYearPageStart(Math.floor(today.getFullYear() / 12) * 12);
    }
  }, [disabled, selectedDate, today]);

  useEffect(() => {
    if (!selectedDate) return;
    setViewMonth(selectedDate.getMonth());
    setViewYear(selectedDate.getFullYear());
  }, [selectedDate]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closePanel();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [closePanel]);

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

      const spaceBelow = viewportHeight - triggerRect.bottom - TRIGGER_GUTTER - VIEWPORT_MARGIN;
      const spaceAbove = triggerRect.top - TRIGGER_GUTTER - VIEWPORT_MARGIN;
      const shouldPlaceAbove = spaceBelow < PANEL_MIN_HEIGHT && spaceAbove > spaceBelow;
      const placement = shouldPlaceAbove ? 'above' : 'below';

      let top = shouldPlaceAbove
        ? triggerRect.top - panelRect.height - TRIGGER_GUTTER
        : triggerRect.bottom + TRIGGER_GUTTER;

      const maxHeight = shouldPlaceAbove
        ? Math.max(PANEL_MIN_HEIGHT, triggerRect.top - TRIGGER_GUTTER - VIEWPORT_MARGIN)
        : Math.max(
            PANEL_MIN_HEIGHT,
            viewportHeight - triggerRect.bottom - TRIGGER_GUTTER - VIEWPORT_MARGIN
          );

      if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
      if (top + panelRect.height > viewportHeight - VIEWPORT_MARGIN) {
        top = Math.max(VIEWPORT_MARGIN, viewportHeight - panelRect.height - VIEWPORT_MARGIN);
      }

      const panelWidth = PANEL_WIDTH;
      const preferredLeft = triggerRect.left;
      const maxLeft = viewportWidth - panelWidth - VIEWPORT_MARGIN;
      const left = Math.min(Math.max(preferredLeft, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, maxLeft));

      setPanelStyle({
        top,
        left,
        width: panelWidth,
        maxHeight,
        placement,
      });
    };

    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open, pickerView, viewMonth, viewYear, yearPageStart]);

  const changeMonth = (delta: number) => {
    if (delta > 0 && !canGoToNextMonth) {
      return;
    }

    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  };

  const changeYearPage = (delta: number) => {
    setYearPageStart((prev) => {
      const next = prev + delta * 12;
      return Math.min(Math.max(next, minYear), maxYear - 11);
    });
  };

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

  const yearPageYears = useMemo(() => {
    const years: number[] = [];
    for (let year = yearPageStart; year < yearPageStart + 12 && year <= maxYear; year += 1) {
      if (year >= minYear) years.push(year);
    }
    return years;
  }, [maxYear, minYear, yearPageStart]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openPanel();
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          closePanel();
        }
        break;
      default:
        break;
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      triggerRef.current?.focus();
    }
  };

  const selectDate = (iso: string) => {
    onChange(iso);
    closePanel();
    triggerRef.current?.focus();
  };

  const panelContent = open ? (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="false"
      aria-label={label ?? 'Choose date'}
      className="fixed z-[100] overflow-hidden rounded-lg border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
      style={{
        borderColor: COLORS.border,
        top: panelStyle?.top ?? 0,
        left: panelStyle?.left ?? 0,
        width: panelStyle?.width ?? PANEL_WIDTH,
        maxHeight: panelStyle?.maxHeight ?? 300,
        visibility: panelStyle ? 'visible' : 'hidden',
        animation: panelStyle
          ? `${panelStyle.placement === 'above' ? 'datepicker-panel-in-above' : 'datepicker-panel-in-below'} 0.18s cubic-bezier(0.22, 1, 0.36, 1) both`
          : undefined,
      }}
      onKeyDown={handlePanelKeyDown}
    >
      <div className="p-2.5">
        <div className="mb-2 flex items-center justify-between gap-1">
          <IconButton
            aria-label={
              pickerView === 'years'
                ? 'Previous years'
                : pickerView === 'months'
                  ? 'Previous year'
                  : 'Previous month'
            }
            className="shrink-0 p-0.5 text-gray-600 hover:bg-gray-100"
            icon={<ChevronLeftIcon />}
            onClick={() => {
              if (pickerView === 'years') changeYearPage(-1);
              else if (pickerView === 'months') setViewYear((y) => Math.max(minYear, y - 1));
              else changeMonth(-1);
            }}
          />

          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
            {pickerView === 'years' ? (
              <span className="truncate text-xs font-semibold" style={{ color: COLORS.textPrimary }}>
                {yearPageYears[0]} – {yearPageYears[yearPageYears.length - 1]}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-xs font-semibold transition-colors hover:bg-gray-100"
                  style={{ color: COLORS.textPrimary }}
                  onClick={() => setPickerView(pickerView === 'months' ? 'days' : 'months')}
                >
                  {monthShortNames[viewMonth]}
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-xs font-semibold transition-colors hover:bg-gray-100"
                  style={{ color: COLORS.textPrimary }}
                  onClick={() => {
                    setYearPageStart(Math.floor(viewYear / 12) * 12);
                    setPickerView('years');
                  }}
                >
                  {viewYear}
                </button>
              </>
            )}
          </div>

          <IconButton
            aria-label={
              pickerView === 'years' ? 'Next years' : pickerView === 'months' ? 'Next year' : 'Next month'
            }
            className="shrink-0 p-0.5 text-gray-600 hover:bg-gray-100"
            icon={<ChevronRightIcon />}
            onClick={() => {
              if (pickerView === 'years') changeYearPage(1);
              else if (pickerView === 'months') {
                if (!maxSelectableDate || viewYear < maxSelectableDate.getFullYear()) {
                  setViewYear((y) => Math.min(maxYear, y + 1));
                }
              } else {
                changeMonth(1);
              }
            }}
            disabled={
              pickerView === 'days'
                ? !canGoToNextMonth
                : pickerView === 'months'
                  ? Boolean(maxSelectableDate && viewYear >= maxSelectableDate.getFullYear())
                  : false
            }
          />
        </div>

        {pickerView === 'days' ? (
          <>
            <div
              className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: COLORS.textMuted }}
            >
              {weekdayLabels.map((day) => (
                <span key={day} className="py-0.5">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((cell) => {
                const iso = toIsoDate(cell.date);
                const isSelected = iso === value;
                const isToday = iso === todayIso;
                const year = cell.date.getFullYear();
                const isDisabled = year < minYear || year > maxYear || isDateAfterMax(iso);

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isDisabled}
                    className="mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                    style={{
                      color: isSelected
                        ? COLORS.white
                        : cell.inCurrentMonth
                          ? COLORS.textPrimary
                          : COLORS.textMuted,
                      backgroundColor: isSelected
                        ? COLORS.primary
                        : isToday
                          ? 'color-mix(in srgb, #EE252B 8%, #FFFFFF)'
                          : 'transparent',
                      boxShadow: isSelected
                        ? `0 2px 8px color-mix(in srgb, ${COLORS.primary} 30%, transparent)`
                        : isToday && !isSelected
                          ? `inset 0 0 0 1px color-mix(in srgb, ${COLORS.primary} 45%, transparent)`
                          : undefined,
                      fontWeight: isToday || isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (isSelected || isDisabled) return;
                      e.currentTarget.style.backgroundColor = COLORS.backgroundGray;
                    }}
                    onMouseLeave={(e) => {
                      if (isSelected || isDisabled) return;
                      e.currentTarget.style.backgroundColor =
                        isToday ? 'color-mix(in srgb, #EE252B 8%, #FFFFFF)' : 'transparent';
                    }}
                    onClick={() => selectDate(iso)}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {pickerView === 'months' ? (
          <div className="grid grid-cols-4 gap-1">
            {monthShortNames.map((name, idx) => {
              const isActive = idx === viewMonth;
              const isMonthDisabled = Boolean(
                maxSelectableDate &&
                  viewYear === maxSelectableDate.getFullYear() &&
                  idx > maxSelectableDate.getMonth()
              );
              return (
                <button
                  key={name}
                  type="button"
                  disabled={isMonthDisabled}
                  className="rounded-md px-1 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    color: isActive ? COLORS.white : COLORS.textPrimary,
                    backgroundColor: isActive ? COLORS.primary : COLORS.backgroundGray,
                  }}
                  onMouseEnter={(e) => {
                    if (isActive) return;
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #E5E7EB 70%, #FFFFFF)';
                  }}
                  onMouseLeave={(e) => {
                    if (isActive) return;
                    e.currentTarget.style.backgroundColor = COLORS.backgroundGray;
                  }}
                  onClick={() => {
                    if (isMonthDisabled) return;
                    setViewMonth(idx);
                    setPickerView('days');
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        ) : null}

        {pickerView === 'years' ? (
          <div className="grid grid-cols-4 gap-1">
            {yearPageYears.map((year) => {
              const isActive = year === viewYear;
              const isYearDisabled = Boolean(maxSelectableDate && year > maxSelectableDate.getFullYear());
              return (
                <button
                  key={year}
                  type="button"
                  disabled={isYearDisabled}
                  className="rounded-md px-1 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    color: isActive ? COLORS.white : COLORS.textPrimary,
                    backgroundColor: isActive ? COLORS.primary : COLORS.backgroundGray,
                  }}
                  onMouseEnter={(e) => {
                    if (isActive) return;
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #E5E7EB 70%, #FFFFFF)';
                  }}
                  onMouseLeave={(e) => {
                    if (isActive) return;
                    e.currentTarget.style.backgroundColor = COLORS.backgroundGray;
                  }}
                  onClick={() => {
                    if (isYearDisabled) return;
                    setViewYear(year);
                    setPickerView('days');
                  }}
                >
                  {year}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div
        className="flex items-center justify-between border-t px-2.5 py-1.5"
        style={{ borderColor: COLORS.border, backgroundColor: COLORS.backgroundGray }}
      >
        <button
          type="button"
          className="rounded px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-white"
          style={{ color: COLORS.textSecondary }}
          onClick={() => {
            onChange('');
            closePanel();
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-white"
          style={{ color: COLORS.primary }}
          onClick={() => {
            onChange(todayIso);
            setViewMonth(today.getMonth());
            setViewYear(today.getFullYear());
            closePanel();
          }}
        >
          Today
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
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
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          className={`relative w-full rounded-lg border text-left outline-none transition-[border-color,box-shadow,background-color] ${sizeStyles[size]}`}
          style={{
            borderColor: blurBorderColor,
            backgroundColor: triggerBackground,
            color: value ? COLORS.textPrimary : COLORS.textSecondary,
          }}
          onClick={() => {
            if (open) closePanel();
            else openPanel();
          }}
          onKeyDown={handleTriggerKeyDown}
          onFocus={(e) => {
            applyFieldInputFocus(e.currentTarget);
          }}
          onBlur={(e) => {
            const next = e.relatedTarget;
            if (!rootRef.current?.contains(next) && !panelRef.current?.contains(next)) {
              applyFieldInputBlur(e.currentTarget, blurBorderColor);
            }
          }}
        >
          <span className="block truncate pr-8">{toDisplayDate(value) || placeholder}</span>
          <span
            className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2"
            style={{ color: open ? COLORS.primary : COLORS.textSecondary }}
            aria-hidden
          >
            <CalendarIcon />
          </span>
        </button>

        {error ? (
          <p className="mt-1 text-xs" style={{ color: COLORS.primary }}>
            {error}
          </p>
        ) : null}
      </div>

      {panelContent ? createPortal(panelContent, document.body) : null}
    </>
  );
}
