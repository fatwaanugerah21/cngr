import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import SitePageHeader from '../layout/SitePageHeader';
import { Button, DatePickerInput } from '../ui';
import { COLORS } from '../../constants/colors';
import { siteMetricFormSchema, type SiteMetricFormValues } from '../../lib/form-schemas';
import { getTodayIsoDate, scrollToFirstFieldError } from '../../lib/form-utils';
import FormSection from './FormSection';
import FormTextField from './FormTextField';

export interface SiteMetricEditState {
  date: string;
  realization: number;
  target: number;
}

export interface SiteMetricFormShellProps {
  breadcrumbLabel: string;
  listPath: string;
  formTitle: string;
  dateFieldLabel?: string;
  notFoundMessage: string;
  isEditMode: boolean;
  recordId?: string;
  editState: SiteMetricEditState | null;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: SiteMetricFormValues) => Promise<void>;
}

function toDateInputValue(value: string): string {
  if (!value || value === '-') {
    return '';
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export default function SiteMetricFormShell({
  breadcrumbLabel,
  listPath,
  formTitle,
  dateFieldLabel = 'Tanggal Produksi',
  notFoundMessage,
  isEditMode,
  recordId,
  editState,
  isSubmitting,
  submitError,
  onSubmit,
}: SiteMetricFormShellProps) {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteMetricFormValues>({
    resolver: zodResolver(siteMetricFormSchema),
    defaultValues: {
      date: '',
      target: '',
      realization: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!isEditMode || !editState) {
      return;
    }

    reset({
      date: toDateInputValue(editState.date),
      realization: String(editState.realization),
      target: String(editState.target),
    });
  }, [editState, isEditMode, reset]);

  const onValid = async (values: SiteMetricFormValues) => {
    if (isEditMode && (!recordId || !editState)) {
      return;
    }

    await onSubmit(values);
  };

  const onInvalid = (fieldErrors: typeof errors) => {
    scrollToFirstFieldError(fieldErrors);
  };

  const editBlocked = isEditMode && !editState;
  const maxDate = getTodayIsoDate();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SitePageHeader
        breadcrumb={[
          { label: breadcrumbLabel, to: listPath },
          { label: formTitle },
        ]}
      />

      <div className="flex flex-1 flex-col space-y-6 p-10">
        {editBlocked ? (
          <div
            className="rounded-xl border bg-white p-8 text-center shadow-sm"
            style={{ borderColor: COLORS.border }}
          >
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              {notFoundMessage}
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit(onValid, onInvalid)} noValidate>
            <FormSection
              step={1}
              title="Detail Data"
              description="Masukkan data tanggal, target, dan realisasi untuk keperluan chart."
            >
              <div className="space-y-4">
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      label={dateFieldLabel}
                      value={field.value}
                      onChange={field.onChange}
                      maxDate={maxDate}
                      error={errors.date?.message}
                    />
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="target"
                    control={control}
                    render={({ field }) => (
                      <FormTextField
                        label="Target"
                        isRequired
                        formatNumber
                        placeholder="Masukkan target yang perlu dicapai"
                        error={errors.target?.message}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="realization"
                    control={control}
                    render={({ field }) => (
                      <FormTextField
                        label="Realisasi"
                        isRequired
                        formatNumber
                        placeholder="Masukkan nilai realisasi"
                        error={errors.realization?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </FormSection>

            {submitError ? (
              <p className="text-sm" role="alert" style={{ color: COLORS.primary }}>
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="md" onClick={() => navigate(listPath)}>
                Kembali
              </Button>
              <Button type="submit" variant="submit" size="md" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
