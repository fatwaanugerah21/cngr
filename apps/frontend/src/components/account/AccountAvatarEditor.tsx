import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { COLORS } from '../../constants/colors';
import { Button } from '../ui';

export interface AccountAvatarEditorProps {
  defaultImageUrl: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  maxSizeMb?: number;
  accept?: string;
  helperText?: string;
  disabled?: boolean;
}

export default function AccountAvatarEditor({
  defaultImageUrl,
  file,
  onFileChange,
  maxSizeMb = 10,
  accept = 'image/png,image/jpeg,image/svg+xml',
  helperText = 'Mendukung PNG, JPEG, dan SVG hingga 10 MB.',
  disabled,
}: AccountAvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const [sizeError, setSizeError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const displaySrc = objectUrl ?? defaultImageUrl;

  const pickFile = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (!next) return;
    if (next.size > maxSizeMb * 1024 * 1024) {
      setSizeError(`Ukuran berkas paling besar ${maxSizeMb} MB.`);
      return;
    }
    setSizeError(null);
    onFileChange(next);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={onInputChange}
      />
      <img
        src={displaySrc}
        alt=""
        className="h-28 w-28 shrink-0 rounded-full object-cover"
        style={{ border: `2px solid ${COLORS.border}` }}
      />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={pickFile} disabled={disabled}>
            Unggah
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSizeError(null);
              onFileChange(null);
            }}
            disabled={disabled || !file}
          >
            Hapus
          </Button>
        </div>
        <p className="text-xs" style={{ color: COLORS.textSecondary }}>
          {helperText}
        </p>
        {sizeError ? (
          <p className="text-xs" style={{ color: COLORS.primary }}>
            {sizeError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
