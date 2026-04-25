import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { COLORS } from '../../constants/colors';
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
}

const triggerSizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export default function SearchableSelectInput({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi',
  searchPlaceholder = 'Cari...',
  emptyText = 'Data tidak ditemukan',
  size = 'md',
  className = '',
  disabled,
}: SearchableSelectInputProps) {
  const generatedId = useId();
  const triggerId = `searchable-select-${generatedId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(keyword));
  }, [options, query]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [open]);

  return (
    <div className={`flex flex-col ${className}`.trim()} ref={rootRef}>
      {label ? (
        <label htmlFor={triggerId} className="mb-1.5 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
        </label>
      ) : null}

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        className={`relative w-full rounded-lg border bg-white text-left outline-none transition-colors ${triggerSizeStyles[size]}`}
        style={{
          borderColor: error ? '#EF4444' : COLORS.border,
          color: selected ? COLORS.textPrimary : COLORS.textSecondary,
        }}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
      >
        <span className="block truncate pr-6">{selected?.label ?? placeholder}</span>
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
          className="mt-2 overflow-hidden rounded-lg border bg-white shadow-lg"
          style={{ borderColor: COLORS.border }}
          role="listbox"
        >
          <div className="border-b p-2" style={{ borderColor: COLORS.border }}>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
              style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className="w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
                    style={{
                      color: COLORS.textPrimary,
                      backgroundColor: isSelected ? 'color-mix(in srgb, #2563EB 10%, #FFFFFF)' : undefined,
                    }}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-3 text-sm" style={{ color: COLORS.textSecondary }}>
                {emptyText}
              </p>
            )}
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
