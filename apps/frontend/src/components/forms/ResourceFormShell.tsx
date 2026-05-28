import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../layout/PageHeader';
import { Button } from '../ui';
import { COLORS } from '../../constants/colors';
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
  /** Path to navigate back to (e.g. list page). */
  listPath: string;
  fileMaxSizeMb?: number;
  initialTitle?: string;
  initialDescription?: string;
  /** When true, a file must be selected before submit (typical for create). */
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
  requireFile = false,
  submitError,
  isSubmitting = false,
  onSubmit,
}: ResourceFormShellProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [file, setFile] = useState<File | null>(null);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [fileError, setFileError] = useState<string | undefined>();

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError('Bidang ini wajib diisi.');
      return;
    }
    if (requireFile && !file) {
      setFileError('Berkas wajib diunggah.');
      return;
    }
    setTitleError(undefined);
    setFileError(undefined);
    const payload = { title: trimmed, description: description.trim(), file };
    if (onSubmit) {
      void onSubmit(payload);
    } else {
      navigate(listPath);
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumb={[
          { label: copy.breadcrumbManagement, to: listPath },
          { label: copy.breadcrumbCurrent },
        ]}
      />

      <div className="flex flex-col p-10" style={{ backgroundColor: COLORS.backgroundGray }}>
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <FormSection
            step={1}
            title={copy.sectionDataTitle}
            description={copy.sectionDataDescription}
          >
            <FormTextField
              label={copy.titleLabel}
              placeholder={copy.titlePlaceholder}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(undefined);
              }}
              error={titleError}
            />
            <FormTextareaField
              label={copy.descriptionLabel}
              placeholder={copy.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormSection>

          <FormSection
            step={2}
            title={copy.sectionFileTitle}
            description={copy.sectionFileDescription}
          >
            <FileUploadField
              maxSizeMb={fileMaxSizeMb}
              value={file}
              onChange={(nextFile) => {
                setFile(nextFile);
                if (fileError) setFileError(undefined);
              }}
            />
            {fileError ? (
              <p className="text-sm" style={{ color: COLORS.primary }}>
                {fileError}
              </p>
            ) : null}
          </FormSection>

          {submitError ? (
            <p className="text-sm" style={{ color: COLORS.primary }}>
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="md" onClick={() => navigate(listPath)} disabled={isSubmitting}>
              Kembali
            </Button>
            <Button type="button" variant="primary" size="md" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
