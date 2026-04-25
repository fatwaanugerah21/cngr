import type { ReactNode } from 'react';
import { COLORS } from '../../constants/colors';
import Button from './Button';
import SearchInput, { type SearchInputProps } from './SearchInput';

export interface SearchFilterBarProps extends Omit<SearchInputProps, 'className' | 'visualVariant'> {
  /** Label for the outline filter button. @default 'Saring' */
  filterLabel?: string;
  onFilterClick?: () => void;
  filterIcon?: ReactNode;
  className?: string;
}

function DefaultFilterLinesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 5.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 9H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 12.5H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function SearchFilterBar({
  filterLabel = 'Saring',
  onFilterClick,
  filterIcon,
  className = '',
  ...searchInputProps
}: SearchFilterBarProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${className}`.trim()}
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <SearchInput visualVariant="toolbar" {...searchInputProps} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 w-full shrink-0 sm:w-auto sm:min-w-[7.5rem]"
          leftIcon={filterIcon ?? <DefaultFilterLinesIcon />}
          onClick={onFilterClick}
        >
          {filterLabel}
        </Button>
      </div>
    </div>
  );
}
