import { useCallback, useId, useRef, useState } from 'react';
import { COLORS } from '../../constants/colors';
import UploadDocumentIcon from '../../icons/upload-document.icon';
import { Button } from '../ui';

export interface FileUploadFieldProps {
  id?: string;
  /** Maximum file size in megabytes. */
  maxSizeMb: number;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function FileUploadField({
  id: idProp,
  maxSizeMb,
  accept,
  value,
  onChange,
  disabled,
}: FileUploadFieldProps) {
  const generatedId = useId();
  const inputId = idProp ?? `file-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxBytes = maxSizeMb * 1024 * 1024;

  const validateAndSet = useCallback(
    (file: File | null) => {
      setError(null);
      if (!file) {
        onChange(null);
        return;
      }
      if (file.size > maxBytes) {
        setError(`Ukuran berkas paling besar ${maxSizeMb} MB.`);
        return;
      }
      onChange(file);
    },
    [maxBytes, maxSizeMb, onChange]
  );

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          validateAndSet(file);
          e.target.value = '';
        }}
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          borderColor: isDragging
            ? COLORS.primary
            : `color-mix(in srgb, ${COLORS.primary} 35%, ${COLORS.border})`,
          backgroundColor: isDragging
            ? `color-mix(in srgb, ${COLORS.primary} 6%, ${COLORS.white})`
            : `color-mix(in srgb, ${COLORS.primary} 4%, ${COLORS.white})`,
        }}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          const file = e.dataTransfer.files?.[0] ?? null;
          validateAndSet(file);
        }}
        aria-disabled={disabled}
      >
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${COLORS.primary} 12%, ${COLORS.white})` }}
        >
          <UploadDocumentIcon />
        </div>
        <p className="text-center text-sm font-bold" style={{ color: COLORS.textPrimary }}>
          Seret dan lepas berkas di sini
        </p>
        <p className="mt-1 text-center text-sm" style={{ color: COLORS.textSecondary }}>
          atau klik untuk memilih dari komputer Anda (maks. {maxSizeMb} MB)
        </p>
        {value ? (
          <p className="mt-3 text-center text-xs font-medium" style={{ color: COLORS.textPrimary }}>
            Terpilih: {value.name}
          </p>
        ) : null}
        <div className="mt-5" onClick={(e) => e.stopPropagation()}>
          <Button type="button" size="sm" onClick={openPicker} disabled={disabled}>
            Pilih berkas
          </Button>
        </div>
      </div>
      {error ? (
        <p className="text-xs" style={{ color: COLORS.primary }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
