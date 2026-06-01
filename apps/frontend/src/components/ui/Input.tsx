import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';
import EyeIcon from '../../icons/eye.icon';
import EyeOffIcon from '../../icons/eye-off.icon';
import { bindFieldInputFocusHandlers, fieldInputBaseStyle } from '../../lib/field-input-styles';
import IconButton from './IconButton';

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
  ({ label, error, size = 'md', className = '', id, style, type, disabled, onFocus, onBlur, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && isPasswordVisible ? 'text' : type;
    const blurBorderColor = error ? '#EF4444' : COLORS.border;
    const focusHandlers = bindFieldInputFocusHandlers<HTMLInputElement>({
      blurBorderColor,
      ring: 'legacy',
      onFocus,
      onBlur,
    });
    const inputClassName = `w-full rounded-lg border outline-none transition-[border-color,box-shadow,background-color] ${sizeStyles[size]} ${isPasswordField ? 'pr-11' : ''} ${className}`.trim();

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
        {isPasswordField ? (
          <div className="relative">
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              className={inputClassName}
              style={{ ...fieldInputBaseStyle(blurBorderColor), ...style }}
              disabled={disabled}
              {...focusHandlers}
              {...props}
            />
            <IconButton
              type="button"
              disabled={disabled}
              className="absolute top-1/2 right-2 -translate-y-1/2 hover:bg-transparent"
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              icon={isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
            />
          </div>
        ) : (
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={inputClassName}
            style={{ ...fieldInputBaseStyle(blurBorderColor), ...style }}
            {...focusHandlers}
            {...props}
          />
        )}
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
