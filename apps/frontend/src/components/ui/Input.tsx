import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';
import { bindFieldInputFocusHandlers, fieldInputBaseStyle } from '../../lib/field-input-styles';

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
    const blurBorderColor = error ? '#EF4444' : COLORS.border;
    const focusHandlers = bindFieldInputFocusHandlers<HTMLInputElement>({
      blurBorderColor,
      ring: 'legacy',
      onFocus,
      onBlur,
    });

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
          className={`w-full rounded-lg border outline-none transition-[border-color,box-shadow,background-color] ${sizeStyles[size]} ${className}`}
          style={{ ...fieldInputBaseStyle(blurBorderColor), ...style }}
          {...focusHandlers}
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
