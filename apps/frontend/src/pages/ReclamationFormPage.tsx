import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SiteMetricFormShell } from '../components/forms';
import { useSite } from '../lib/site-context';
import {
  createReclamation,
  type ReclamationEditState,
  updateReclamation,
} from '../lib/cngr-api';
import type { SiteMetricFormValues } from '../lib/form-schemas';

export default function ReclamationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const editState = location.state as ReclamationEditState | null;

  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedSite } = useSite();

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (!editState) {
      setSubmitError('Data reklamasi tidak ditemukan. Buka halaman daftar dan coba lagi.');
    }
  }, [isEditMode, editState]);

  const handleSubmit = async (values: SiteMetricFormValues) => {
    if (!selectedSite) {
      return;
    }

    if (isEditMode && !id) {
      setSubmitError('Data reklamasi tidak valid.');
      return;
    }

    if (isEditMode && !editState) {
      setSubmitError('Data reklamasi tidak ditemukan. Buka halaman daftar dan coba lagi.');
      return;
    }

    const siteId = Number(selectedSite.id);
    const payload = {
      actual: Number(values.realization),
      date: new Date(values.date).toISOString(),
      site_id: siteId,
      target: Number(values.target),
    };

    if (!Number.isFinite(payload.actual) || !Number.isFinite(payload.target) || !Number.isFinite(siteId)) {
      setSubmitError('Data reklamasi tidak valid.');
      return;
    }

    setSubmitError(undefined);
    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        await updateReclamation(id, payload);
      } else {
        await createReclamation(payload);
      }
      navigate('/reclamation');
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? 'Gagal memperbarui data reklamasi.'
            : 'Gagal menyimpan data reklamasi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedSite) {
    return (
      <div className="flex flex-col p-10">
        <p className="text-sm text-gray-600">Silakan pilih site terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <SiteMetricFormShell
      breadcrumbLabel="Reclamation"
      listPath="/reclamation"
      formTitle={isEditMode ? 'Edit Reclamation' : 'Tambah Reclamation'}
      notFoundMessage="Data reklamasi tidak ditemukan. Buka halaman daftar dan coba lagi."
      isEditMode={isEditMode}
      recordId={id}
      editState={editState}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onSubmit={handleSubmit}
    />
  );
}
