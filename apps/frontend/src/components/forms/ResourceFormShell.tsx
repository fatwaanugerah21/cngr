import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import SitePageHeader from '../layout/SitePageHeader';
import { Button } from '../ui';
import { COLORS } from '../../constants/colors';
import {
  createResourceFormSchema,
  type ResourceFormValues,
} from '../../lib/form-schemas';
import { scrollToFirstFieldError } from '../../lib/form-utils';
import FileUploadField from './FileUploadField';
import FormSection from './FormSection';
import FormTextField from './FormTextField';
import FormTextareaField from './FormTextareaField';

export interface ResourceFormCopy {
  breadcrumbManagement: string;
  breadcrumbCurrent: string;
  sectionDataTitle: string;
  sectionDataDescription: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  sectionFileTitle: string;
  sectionFileDescription: string;
}

export interface ResourceFormShellProps {
  copy: ResourceFormCopy;
  listPath: string;
  fileMaxSizeMb?: number;
  initialTitle?: string;
  initialDescription?: string;
  initialFile?: File | null;
  requireFile?: boolean;
  submitError?: string;
  isSubmitting?: boolean;
  onSubmit?: (payload: { title: string; description: string; file: File | null }) => void | Promise<void>;
}

export default function ResourceFormShell({
  copy,
  listPath,
  fileMaxSizeMb = 10,
  initialTitle = '',
  initialDescription = '',
  initialFile = null,
  requireFile = false,
  submitError,
  isSubmitting = false,
  onSubmit,
}: ResourceFormShellProps) {
  const navigate = useNavigate();
  const schema = createResourceFormSchema(requireFile);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      file: initialFile,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset({
      title: initialTitle,
      description: initialDescription,
      file: initialFile,
    });
  }, [initialTitle, initialDescription, initialFile, reset]);

  const onValid = (values: ResourceFormValues) => {
    const payload = {
      title: values.title.trim(),
      description: (values.description ?? '').trim(),
      file: values.file,
    };

    if (onSubmit) {
      void onSubmit(payload);
    } else {
      navigate(listPath);
    }
  };

  const onInvalid = (fieldErrors: typeof errors) => {
    scrollToFirstFieldError(fieldErrors);
  };

  return (
    <div className="flex flex-col">
      <SitePageHeader
        breadcrumb={[
          { label: copy.breadcrumbManagement, to: listPath },
          { label: copy.breadcrumbCurrent },
        ]}
      />

      <div className="flex flex-col p-10">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit(onValid, onInvalid)} noValidate>
            <FormSection
              step={1}
              title={copy.sectionDataTitle}
              description={copy.sectionDataDescription}
            >
              <FormTextField
                label={copy.titleLabel}
                isRequired
                placeholder={copy.titlePlaceholder}
                error={errors.title?.message}
                {...register('title')}
              />
              <FormTextareaField
                label={copy.descriptionLabel}
                placeholder={copy.descriptionPlaceholder}
                {...register('description')}
              />
            </FormSection>

            <FormSection
              step={2}
              title={copy.sectionFileTitle}
              description={copy.sectionFileDescription}
            >
              <Controller
                name="file"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <FileUploadField
                      maxSizeMb={fileMaxSizeMb}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors.file?.message ? (
                      <p className="text-sm" style={{ color: COLORS.primary }}>
                        {errors.file.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </FormSection>

            {submitError ? (
              <p className="text-sm" role="alert" style={{ color: COLORS.primary }}>
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate(listPath)}
                disabled={isSubmitting}
              >
                Kembali
              </Button>
              <Button type="submit" variant="submit" size="md" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
