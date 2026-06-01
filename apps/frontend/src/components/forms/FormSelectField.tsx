import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type SelectHTMLAttributes,
} from 'react';
import { COLORS } from '../../constants/colors';
import SearchableSelectInput from '../ui/SearchableSelectInput';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'onChange' | 'size'> {
  label: string;
  isRequired?: boolean;
  options: FormSelectOption[];
  error?: string;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: FocusEvent<HTMLSelectElement>) => void;
}

const FormSelectField = forwardRef<HTMLSelectElement, FormSelectFieldProps>(
  (
    {
      label,
      isRequired = false,
      options,
      error,
      className = '',
      id,
      name,
      value,
      defaultValue,
      disabled,
      onChange,
      onBlur,
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id ?? `select-${generatedId}`;
    const comboboxId = `${fieldId}-combobox`;
    const nativeSelectRef = useRef<HTMLSelectElement>(null);
    const isControlled = value !== undefined;

    const [internalValue, setInternalValue] = useState(() => String(defaultValue ?? ''));

    const setRefs = useCallback(
      (node: HTMLSelectElement | null) => {
        nativeSelectRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const selectValue = isControlled ? String(value) : internalValue;

    useLayoutEffect(() => {
      if (isControlled || !nativeSelectRef.current) return;
      const nativeValue = nativeSelectRef.current.value;
      if (nativeValue !== internalValue) {
        setInternalValue(nativeValue);
      }
    });

    const emitChange = useCallback(
      (nextValue: string) => {
        const select = nativeSelectRef.current;
        if (!select) return;

        if (!isControlled) {
          setInternalValue(nextValue);
        }

        select.value = nextValue;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        onChange?.({
          target: select,
          currentTarget: select,
        } as ChangeEvent<HTMLSelectElement>);
      },
      [isControlled, onChange]
    );

    const emitBlur = useCallback(() => {
      const select = nativeSelectRef.current;
      if (!select) return;
      onBlur?.({
        target: select,
        currentTarget: select,
      } as FocusEvent<HTMLSelectElement>);
    }, [onBlur]);

    return (
      <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
        <label htmlFor={comboboxId} className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
          {label}
          {isRequired ? (
            <span aria-hidden="true" style={{ color: COLORS.primary }}>
              {' *'}
            </span>
          ) : null}
        </label>

        <select
          ref={setRefs}
          id={fieldId}
          name={name}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={onChange}
          onBlur={onBlur}
          {...(isControlled ? { value: selectValue } : { defaultValue: defaultValue ?? '' })}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <SearchableSelectInput
          id={comboboxId}
          options={options}
          value={selectValue}
          onChange={emitChange}
          onBlur={emitBlur}
          error={error}
          disabled={disabled}
        />
      </div>
    );
  }
);

FormSelectField.displayName = 'FormSelectField';

export default FormSelectField;
