import {
  forwardRef,
  useId,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from 'react';
import { COLORS } from '../../constants/colors';
import EyeIcon from '../../icons/eye.icon';
import EyeOffIcon from '../../icons/eye-off.icon';
import { bindFieldInputFocusHandlers, fieldInputBaseStyle } from '../../lib/field-input-styles';
import { formatNumberFieldDisplay, normalizeNumberFieldInput } from '../../lib/form-utils';
import IconButton from '../ui/IconButton';

export interface FormTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  isRequired?: boolean;
  error?: string;
  className?: string;
  /** Formats value with Indonesian locale while storing a normalized numeric string. */
  formatNumber?: boolean;
}

const FormTextField = forwardRef<HTMLInputElement, FormTextFieldProps>(
  (
    {
      label,
      isRequired = false,
      error,
      className = '',
      id,
      type,
      formatNumber = false,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? `field-${generatedId}`;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';
    const isFormattedNumberField = formatNumber;
    const inputType = isPasswordField && isPasswordVisible ? 'text' : isFormattedNumberField ? 'text' : type;
    const displayValue = isFormattedNumberField ? formatNumberFieldDisplay(String(value ?? '')) : value;

    const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizeNumberFieldInput(event.target.value);
      onChange?.({
        ...event,
        target: { ...event.target, value: normalized },
        currentTarget: { ...event.currentTarget, value: normalized },
      });
    };

    const handleNumberBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (value != null && value !== '') {
        const normalized = normalizeNumberFieldInput(String(value)).replace(/\.$/, '');
        onChange?.({
          ...event,
          target: { ...event.target, value: normalized },
          currentTarget: { ...event.currentTarget, value: normalized },
        });
      }
      onBlur?.(event);
    };

    const blurBorderColor = error ? COLORS.primary : COLORS.border;
    const focusHandlers = bindFieldInputFocusHandlers<HTMLInputElement>({
      blurBorderColor,
      accentBorderOnFocus: !error,
      onFocus,
      onBlur: isFormattedNumberField ? handleNumberBlur : onBlur,
    });
    const inputClassName =
      'w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow,background-color]';
    const inputPaddingClassName = isPasswordField ? 'pr-11' : '';

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
        {isPasswordField ? (
          <div className="relative">
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              className={`${inputClassName} ${inputPaddingClassName}`.trim()}
              style={fieldInputBaseStyle(blurBorderColor)}
              {...focusHandlers}
              {...props}
            />
            <IconButton
              type="button"
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
            type={inputType}
            inputMode={isFormattedNumberField ? 'decimal' : props.inputMode}
            className={inputClassName}
            style={fieldInputBaseStyle(blurBorderColor)}
            value={isFormattedNumberField ? displayValue : value}
            onChange={isFormattedNumberField ? handleNumberChange : onChange}
            {...focusHandlers}
            {...props}
          />
        )}
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
