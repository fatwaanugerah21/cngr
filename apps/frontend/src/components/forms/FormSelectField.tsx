import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';
import { bindFieldInputFocusHandlers, fieldInputBaseStyle } from '../../lib/field-input-styles';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string;
  isRequired?: boolean;
  options: FormSelectOption[];
  error?: string;
  className?: string;
}

const FormSelectField = forwardRef<HTMLSelectElement, FormSelectFieldProps>(
  ({ label, isRequired = false, options, error, className = '', id, onFocus, onBlur, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId}`;
    const blurBorderColor = error ? COLORS.primary : COLORS.border;
    const focusHandlers = bindFieldInputFocusHandlers<HTMLSelectElement>({
      blurBorderColor,
      accentBorderOnFocus: !error,
      onFocus,
      onBlur,
    });

    return (
      <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
        <label htmlFor={selectId} className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
          {isRequired ? (
            <span aria-hidden="true" style={{ color: COLORS.primary }}>
              {' *'}
            </span>
          ) : null}
        </label>
        <select
          ref={ref}
          id={selectId}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow,background-color]"
          style={fieldInputBaseStyle(blurBorderColor)}
          {...focusHandlers}
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
