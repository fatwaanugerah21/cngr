import type { FormSelectOption } from '../components/forms/FormSelectField';

export const SITE_PIC_OPTIONS: FormSelectOption[] = [
  { value: 'fatwa-nasir', label: 'Fatwa Nasir' },
  { value: 'rafly-mas', label: 'Rafly Mas' },
  { value: 'ikhsan', label: 'Ikhsan' },
  { value: 'ghifary-modeong', label: 'Ghifary Modeong' },
  { value: 'sera-putri', label: 'Sera Putri' },
];

export function sitePicLabelByValue(value: string): string {
  return SITE_PIC_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
