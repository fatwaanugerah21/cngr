import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';

export interface FormTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  isRequired?: boolean;
  error?: string;
  className?: string;
}

const FormTextField = forwardRef<HTMLInputElement, FormTextFieldProps>(
  ({ label, isRequired = false, error, className = '', id, onFocus, onBlur, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `field-${generatedId}`;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
        <label htmlFor={inputId} className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
          {isRequired ? (
            <span aria-hidden="true" style={{ color: COLORS.primary }}>
              {' *'}
            </span>
          ) : null}
        </label>
        <input
          ref={ref}
          id={inputId}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow]"
          style={{
            borderColor: error ? COLORS.primary : COLORS.border,
            color: COLORS.textPrimary,
            backgroundColor: COLORS.white,
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = COLORS.primary;
              e.target.style.boxShadow = `0 0 0 2px color-mix(in srgb, ${COLORS.primary} 18%, transparent)`;
            }
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? COLORS.primary : COLORS.border;
            e.target.style.boxShadow = 'none';
            onBlur?.(e);
          }}
          {...props}
        />
        {error ? (
          <p className="text-xs" style={{ color: COLORS.primary }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

FormTextField.displayName = 'FormTextField';

export default FormTextField;
