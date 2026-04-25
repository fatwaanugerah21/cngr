import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'> {
  label?: string;
  error?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'md', className = '', id, style, onFocus, onBlur, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;

    return (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border outline-none transition-colors ${sizeStyles[size]} ${className}`}
          style={{
            borderColor: error ? '#EF4444' : COLORS.border,
            color: COLORS.textPrimary,
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = COLORS.primary;
            e.target.style.boxShadow = `0 0 0 2px ${COLORS.primary}30`;
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : COLORS.border;
            e.target.style.boxShadow = 'none';
            onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
