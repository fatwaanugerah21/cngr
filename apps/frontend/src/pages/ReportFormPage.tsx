import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ResourceFormShell, type ResourceFormCopy } from '../components/forms';
import {
  createReport,
  fetchReport,
  fetchReportFile,
  type ReportEditState,
  updateReport,
} from '../lib/cngr-api';
import { useSite } from '../lib/site-context';

const REPORT_FORM_BASE: ResourceFormCopy = {
  breadcrumbManagement: 'Manajemen Laporan',
  breadcrumbCurrent: 'Upload Laporan',
  sectionDataTitle: 'Data Laporan',
  sectionDataDescription: 'Lengkapi informasi utama laporan sebelum mengunggah berkas.',
  titleLabel: 'Judul Laporan',
  titlePlaceholder: 'Contoh: Laporan Aktivitas Tambang Site Riha',
  descriptionLabel: 'Deskripsi Laporan',
  descriptionPlaceholder:
    'Jelaskan ringkasan isi laporan, periode, atau konteks yang relevan untuk tim Anda.',
  sectionFileTitle: 'Upload File Laporan',
  sectionFileDescription: 'Unggah dokumen laporan dalam format PDF atau sesuai kebijakan perusahaan.',
};

export default function ReportFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { selectedSite } = useSite();
  const isEdit = id != null;
  const editState = location.state as ReportEditState | null;

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
    const reportId = id;

    async function loadReport() {
      setIsLoading(true);
      setLoadError(undefined);
      try {
        const report = await fetchReport(reportId);
        if (cancelled) {
          return;
        }
        if (!report) {
          setLoadError('Laporan tidak ditemukan.');
          return;
        }
        setInitialTitle(report.title);
        setInitialDescription(report.description ?? '');
        try {
          const file = await fetchReportFile(reportId, report.title);
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
          setLoadError(err instanceof Error ? err.message : 'Gagal memuat data laporan.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const copy: ResourceFormCopy = {
    ...REPORT_FORM_BASE,
    breadcrumbCurrent: isEdit ? 'Edit Laporan' : 'Upload Laporan',
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
        await updateReport(id, {
          title: payload.title,
          description: payload.description,
          file: payload.file,
        });
      } else if (selectedSite?.id && payload.file) {
        await createReport({
          title: payload.title,
          description: payload.description,
          file: payload.file,
          siteId: selectedSite.id,
        });
      }
      navigate('/report');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center p-10 text-sm text-gray-500">
        Memuat data laporan...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-4 p-10 text-sm text-gray-500">
        <p>{loadError}</p>
        <button type="button" className="text-blue-600 underline" onClick={() => navigate('/report')}>
          Kembali ke daftar laporan
        </button>
      </div>
    );
  }

  return (
    <ResourceFormShell
      key={isEdit ? `edit-${id}` : 'create'}
      copy={copy}
      listPath="/report"
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
