import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ResourceFormShell, type ResourceFormCopy } from '../components/forms';
import {
  createDocument,
  fetchDocument,
  type DocumentEditState,
  updateDocument,
} from '../lib/cngr-api';
import { useSite } from '../lib/site-context';

const DOCUMENT_FORM_BASE: ResourceFormCopy = {
  breadcrumbManagement: 'Manajemen Dokumen',
  breadcrumbCurrent: 'Upload Dokumen',
  sectionDataTitle: 'Data Dokumen',
  sectionDataDescription: 'Lengkapi informasi utama dokumen sebelum mengunggah berkas.',
  titleLabel: 'Judul Dokumen',
  titlePlaceholder: 'Contoh: Dokumen AMDAL Site Riha',
  descriptionLabel: 'Deskripsi Dokumen',
  descriptionPlaceholder:
    'Jelaskan ringkasan isi dokumen, tujuan, atau konteks yang membantu pencarian nanti.',
  sectionFileTitle: 'Upload File Dokumen',
  sectionFileDescription: 'Unggah berkas dokumen sesuai format yang disyaratkan (mis. PDF, maks. 10MB).',
};

export default function DocumentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { selectedSite } = useSite();
  const isEdit = id != null;
  const editState = location.state as DocumentEditState | null;

  const [initialTitle, setInitialTitle] = useState(editState?.title ?? '');
  const [initialDescription, setInitialDescription] = useState(editState?.description ?? '');
  const [isLoading, setIsLoading] = useState(isEdit && !editState);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id || editState) {
      return;
    }

    let cancelled = false;
    const documentId = id;

    async function loadDocument() {
      setIsLoading(true);
      setLoadError(undefined);
      try {
        const document = await fetchDocument(documentId);
        if (cancelled) {
          return;
        }
        if (!document) {
          setLoadError('Dokumen tidak ditemukan.');
          return;
        }
        setInitialTitle(document.title);
        setInitialDescription(document.description ?? '');
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Gagal memuat data dokumen.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDocument();

    return () => {
      cancelled = true;
    };
  }, [editState, id, isEdit]);

  const copy: ResourceFormCopy = {
    ...DOCUMENT_FORM_BASE,
    breadcrumbCurrent: isEdit ? 'Edit Dokumen' : 'Upload Dokumen',
  };

  const handleSubmit = async (payload: { title: string; description: string; file: File | null }) => {
    if (!isEdit && !selectedSite?.id) {
      setSubmitError('Silakan pilih site terlebih dahulu dari menu Manajemen Site.');
      return;
    }

    if (!isEdit && !payload.file) {
      setSubmitError('Berkas wajib diunggah.');
      return;
    }

    setSubmitError(undefined);
    setIsSubmitting(true);

    try {
      if (isEdit && id) {
        await updateDocument(id, {
          title: payload.title,
          file: payload.file,
        });
      } else if (selectedSite?.id && payload.file) {
        await createDocument({
          title: payload.title,
          file: payload.file,
          siteId: selectedSite.id,
        });
      }
      navigate('/document');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan dokumen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center p-10 text-sm text-gray-500">
        Memuat data dokumen...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-4 p-10 text-sm text-gray-500">
        <p>{loadError}</p>
        <button type="button" className="text-blue-600 underline" onClick={() => navigate('/document')}>
          Kembali ke daftar dokumen
        </button>
      </div>
    );
  }

  return (
    <ResourceFormShell
      key={isEdit ? `edit-${id}-${initialTitle}` : 'create'}
      copy={copy}
      listPath="/document"
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      requireFile={!isEdit}
      submitError={submitError}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
