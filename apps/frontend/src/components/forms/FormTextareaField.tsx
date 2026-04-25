import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';

export interface FormTextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string;
  error?: string;
  className?: string;
}

const FormTextareaField = forwardRef<HTMLTextAreaElement, FormTextareaFieldProps>(
  ({ label, error, className = '', rows = 5, id, onFocus, onBlur, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? `field-${generatedId}`;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
        <label htmlFor={textareaId} className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className="min-h-[120px] w-full resize-y rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow]"
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

FormTextareaField.displayName = 'FormTextareaField';

export default FormTextareaField;
