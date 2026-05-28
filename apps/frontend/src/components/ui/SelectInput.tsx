import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';
import { bindFieldInputFocusHandlers, fieldInputBaseStyle } from '../../lib/field-input-styles';

export interface SelectInputOption {
  value: string;
  label: string;
}

export interface SelectInputProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'size'> {
  label?: string;
  error?: string;
  options: SelectInputOption[];
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, options, size = 'md', className = '', id, style, onFocus, onBlur, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? `select-input-${generatedId}`;
    const blurBorderColor = error ? '#EF4444' : COLORS.border;
    const focusHandlers = bindFieldInputFocusHandlers<HTMLSelectElement>({
      blurBorderColor,
      ring: 'legacy',
      onFocus,
      onBlur,
    });

    return (
      <div className="flex flex-col">
        {label ? (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-lg border pr-9 outline-none transition-[border-color,box-shadow,background-color] ${sizeStyles[size]} ${className}`}
            style={{ ...fieldInputBaseStyle(blurBorderColor), ...style }}
            {...focusHandlers}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: COLORS.textSecondary }}
            aria-hidden
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        {error ? (
          <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
