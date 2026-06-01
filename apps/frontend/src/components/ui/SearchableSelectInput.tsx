import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { COLORS } from '../../constants/colors';
import { applyFieldInputBlur, applyFieldInputFocus, fieldInputBaseStyle } from '../../lib/field-input-styles';
import type { SelectInputOption } from './SelectInput';

export interface SearchableSelectInputProps {
  label?: string;
  error?: string;
  options: SelectInputOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  id?: string;
  onBlur?: () => void;
}

const triggerSizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const LISTBOX_MIN_HEIGHT = 200;
const LISTBOX_PREFERRED_HEIGHT = 320;
const VIEWPORT_MARGIN = 8;
const TRIGGER_GUTTER = 8;

export default function SearchableSelectInput({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found',
  size = 'md',
  className = '',
  disabled,
  id,
  onBlur,
}: SearchableSelectInputProps) {
  const generatedId = useId();
  const triggerId = id ?? `searchable-select-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const selected = useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  const blurBorderColor = error ? COLORS.primary : COLORS.border;
  const triggerBackground = open ? COLORS.white : COLORS.inputBackground;

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(keyword));
  }, [options, query]);

  const closeListbox = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHighlightedIndex(0);
  }, []);

  const selectOption = useCallback(
    (option: SelectInputOption) => {
      onChange(option.value);
      closeListbox();
      triggerRef.current?.focus();
    },
    [closeListbox, onChange]
  );

  const openListbox = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    const selectedIndex = filteredOptions.findIndex((opt) => opt.value === value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [disabled, filteredOptions, value]);

  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return filteredOptions.length - 1;
        if (next >= filteredOptions.length) return 0;
        return next;
      });
    },
    [filteredOptions.length]
  );

  const handleListboxKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveHighlight(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveHighlight(-1);
          break;
        case 'Home':
          event.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setHighlightedIndex(Math.max(filteredOptions.length - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            selectOption(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          closeListbox();
          triggerRef.current?.focus();
          break;
        case 'Tab':
          closeListbox();
          break;
        default:
          break;
      }
    },
    [closeListbox, filteredOptions, highlightedIndex, moveHighlight, selectOption]
  );

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          if (!open) {
            openListbox();
          } else {
            moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!open) {
            openListbox();
          } else if (filteredOptions[highlightedIndex]) {
            selectOption(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          if (open) {
            event.preventDefault();
            closeListbox();
          }
          break;
        default:
          break;
      }
    },
    [closeListbox, filteredOptions, highlightedIndex, moveHighlight, open, openListbox, selectOption]
  );

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeListbox();
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [closeListbox, onBlur]);

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
      const shouldPlaceAbove = spaceBelow < LISTBOX_PREFERRED_HEIGHT && spaceAbove > spaceBelow;

      let top = shouldPlaceAbove
        ? triggerRect.top - panelRect.height - TRIGGER_GUTTER
        : triggerRect.bottom + TRIGGER_GUTTER;

      const maxHeight = shouldPlaceAbove
        ? Math.max(LISTBOX_MIN_HEIGHT, triggerRect.top - TRIGGER_GUTTER - VIEWPORT_MARGIN)
        : Math.max(
            LISTBOX_MIN_HEIGHT,
            viewportHeight - triggerRect.bottom - TRIGGER_GUTTER - VIEWPORT_MARGIN
          );

      if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
      if (top + panelRect.height > viewportHeight - VIEWPORT_MARGIN) {
        top = Math.max(VIEWPORT_MARGIN, viewportHeight - panelRect.height - VIEWPORT_MARGIN);
      }

      const preferredLeft = triggerRect.left;
      const maxLeft = viewportWidth - panelRect.width - VIEWPORT_MARGIN;
      const left = Math.min(Math.max(preferredLeft, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, maxLeft));

      setPanelStyle({
        top,
        left,
        width: triggerRect.width,
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
  }, [open, filteredOptions.length, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= filteredOptions.length) {
      setHighlightedIndex(Math.max(filteredOptions.length - 1, 0));
    }
  }, [filteredOptions.length, highlightedIndex]);

  useEffect(() => {
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, open]);

  const displayLabel = selected?.label ?? placeholder;

  return (
    <div className={`flex flex-col ${className}`.trim()} ref={rootRef}>
      {label ? (
        <label htmlFor={triggerId} className="mb-1.5 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={
          open && filteredOptions[highlightedIndex]
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
        className={`relative w-full rounded-lg border text-left outline-none transition-[border-color,box-shadow,background-color] ${triggerSizeStyles[size]}`}
        style={{
          borderColor: blurBorderColor,
          backgroundColor: triggerBackground,
          color: selected ? COLORS.textPrimary : COLORS.textSecondary,
        }}
        onClick={() => {
          if (disabled) return;
          if (open) {
            closeListbox();
          } else {
            openListbox();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        onFocus={(e) => {
          applyFieldInputFocus(e.currentTarget);
        }}
        onBlur={(e) => {
          const next = e.relatedTarget;
          if (!rootRef.current?.contains(next)) {
            applyFieldInputBlur(e.currentTarget, blurBorderColor);
            onBlur?.();
          }
        }}
      >
        <span className="block truncate pr-6">{displayLabel}</span>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: COLORS.textSecondary }}
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={listboxId}
          className="fixed z-50 flex flex-col overflow-hidden rounded-lg border bg-white shadow-lg"
          style={{
            borderColor: COLORS.border,
            top: panelStyle?.top ?? 0,
            left: panelStyle?.left ?? 0,
            width: panelStyle?.width,
            maxHeight: panelStyle?.maxHeight ?? LISTBOX_PREFERRED_HEIGHT,
            visibility: panelStyle ? 'visible' : 'hidden',
          }}
          role="listbox"
          aria-label={label ?? 'Options'}
          onKeyDown={handleListboxKeyDown}
        >
          <div className="shrink-0 border-b p-2" style={{ borderColor: COLORS.border }}>
            <input
              ref={searchRef}
              type="search"
              role="searchbox"
              aria-controls={listboxId}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleListboxKeyDown}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow,background-color]"
              style={fieldInputBaseStyle(COLORS.border)}
              onFocus={(e) => applyFieldInputFocus(e.target)}
              onBlur={(e) => applyFieldInputBlur(e.target, COLORS.border)}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                    key={option.value}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
                    style={{
                      color: COLORS.textPrimary,
                      backgroundColor: isHighlighted
                        ? 'color-mix(in srgb, #2563EB 12%, #FFFFFF)'
                        : isSelected
                          ? 'color-mix(in srgb, #2563EB 8%, #FFFFFF)'
                          : undefined,
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectOption(option)}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-3 text-sm" role="status" style={{ color: COLORS.textSecondary }}>
                {emptyText}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1 text-xs" style={{ color: COLORS.primary }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
