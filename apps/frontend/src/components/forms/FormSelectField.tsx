import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string;
  options: FormSelectOption[];
  error?: string;
  className?: string;
}

const FormSelectField = forwardRef<HTMLSelectElement, FormSelectFieldProps>(
  ({ label, options, error, className = '', id, onFocus, onBlur, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId}`;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
        <label htmlFor={selectId} className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow]"
          style={{
            borderColor: error ? COLORS.primary : COLORS.border,
            color: COLORS.textPrimary,
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
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs" style={{ color: COLORS.primary }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

FormSelectField.displayName = 'FormSelectField';

export default FormSelectField;
