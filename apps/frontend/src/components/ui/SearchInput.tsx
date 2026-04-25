import { forwardRef, type InputHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';

export type SearchInputVisualVariant = 'default' | 'toolbar';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Icon to display on the left */
  icon?: React.ReactNode;
  className?: string;
  /** `toolbar`: pill field, soft fill, for filter bars (design #2). */
  visualVariant?: SearchInputVisualVariant;
}

function DefaultSearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 16L12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ icon, className = '', style, visualVariant = 'default', onFocus, onBlur, ...props }, ref) => {
    const isToolbar = visualVariant === 'toolbar';

    return (
      <div className="relative flex-1">
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isToolbar ? 'left-4' : 'left-3'}`}
          style={{ color: COLORS.textSecondary }}
        >
          {icon ?? <DefaultSearchIcon />}
        </span>
        <input
          ref={ref}
          type="text"
          className={[
            'w-full border text-sm outline-none transition-[border-color,box-shadow]',
            isToolbar
              ? 'min-h-11 rounded-full py-2.5 pl-11 pr-5 placeholder:text-text-secondary'
              : 'rounded-lg py-2 pl-10 pr-4 text-xs',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            borderColor: COLORS.border,
            color: COLORS.textPrimary,
            backgroundColor: isToolbar ? COLORS.backgroundGray : COLORS.white,
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = COLORS.primary;
            e.target.style.boxShadow = `0 0 0 2px color-mix(in srgb, ${COLORS.primary} 22%, transparent)`;
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = COLORS.border;
            e.target.style.boxShadow = 'none';
            onBlur?.(e);
          }}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
