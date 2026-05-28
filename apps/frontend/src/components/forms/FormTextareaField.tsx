import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { COLORS } from '../../constants/colors';
import { bindFieldInputFocusHandlers, fieldInputBaseStyle } from '../../lib/field-input-styles';

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
    const blurBorderColor = error ? COLORS.primary : COLORS.border;
    const focusHandlers = bindFieldInputFocusHandlers<HTMLTextAreaElement>({
      blurBorderColor,
      accentBorderOnFocus: !error,
      onFocus,
      onBlur,
    });

    return (
      <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
        <label htmlFor={textareaId} className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className="min-h-[120px] w-full resize-y rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow,background-color]"
          style={fieldInputBaseStyle(blurBorderColor)}
          {...focusHandlers}
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
