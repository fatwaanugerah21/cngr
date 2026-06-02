import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ResourceFormShell, type ResourceFormCopy } from '../components/forms';
import {
  createRegulation,
  fetchRegulation,
  fetchRegulationFile,
  type RegulationEditState,
  updateRegulation,
} from '../lib/cngr-api';
import { useSite } from '../lib/site-context';

const RULE_FORM_BASE: ResourceFormCopy = {
  breadcrumbManagement: 'Manajemen Peraturan',
  breadcrumbCurrent: 'Upload Peraturan',
  sectionDataTitle: 'Data Peraturan',
  sectionDataDescription: 'Lengkapi informasi utama peraturan sebelum mengunggah berkas.',
  titleLabel: 'Judul Peraturan',
  titlePlaceholder: 'Contoh: Peraturan Site Riha',
  descriptionLabel: 'Deskripsi Peraturan',
  descriptionPlaceholder:
    'Peraturan ini bertujuan untuk mencatat proses atau ketentuan yang berlaku di site …',
  sectionFileTitle: 'Upload File Peraturan',
  sectionFileDescription: 'Unggah dokumen peraturan dalam format yang ditetapkan (mis. PDF).',
};

export default function RuleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { selectedSite } = useSite();
  const isEdit = id != null;
  const editState = location.state as RegulationEditState | null;

  const [initialTitle, setInitialTitle] = useState(editState?.title ?? '');
  const [initialDescription, setInitialDescription] = useState(editState?.description ?? '');
  const [initialFile, setInitialFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editState?.title) {
      setInitialTitle(editState.title);
    }
    if (editState?.description) {
      setInitialDescription(editState.description);
    }
  }, [editState]);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    let cancelled = false;
    const regulationId = id;

    async function loadRegulation() {
      setIsLoading(true);
      setLoadError(undefined);
      try {
        const regulation = await fetchRegulation(regulationId);
        if (cancelled) {
          return;
        }
        if (!regulation) {
          setLoadError('Peraturan tidak ditemukan.');
          return;
        }
        setInitialTitle(regulation.title);
        setInitialDescription(regulation.description ?? '');
        try {
          const file = await fetchRegulationFile(regulationId, regulation.title);
          if (!cancelled) {
            setInitialFile(file);
          }
        } catch {
          if (!cancelled) {
            setInitialFile(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Gagal memuat data peraturan.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRegulation();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const copy: ResourceFormCopy = {
    ...RULE_FORM_BASE,
    breadcrumbCurrent: isEdit ? 'Edit Peraturan' : 'Upload Peraturan',
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
        await updateRegulation(id, {
          title: payload.title,
          description: payload.description,
          file: payload.file,
        });
      } else if (selectedSite?.id && payload.file) {
        await createRegulation({
          title: payload.title,
          description: payload.description,
          file: payload.file,
          siteId: selectedSite.id,
        });
      }
      navigate('/rules');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan peraturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center p-10 text-sm text-gray-500">
        Memuat data peraturan...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-4 p-10 text-sm text-gray-500">
        <p>{loadError}</p>
        <button type="button" className="text-blue-600 underline" onClick={() => navigate('/rules')}>
          Kembali ke daftar peraturan
        </button>
      </div>
    );
  }

  return (
    <ResourceFormShell
      key={isEdit ? `edit-${id}` : 'create'}
      copy={copy}
      listPath="/rules"
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      initialFile={initialFile}
      requireFile={!isEdit}
      submitError={submitError}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
