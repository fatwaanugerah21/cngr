import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FormSection, FormTextField } from '../components/forms';
import PageHeader from '../components/layout/PageHeader';
import { Button, DatePickerInput } from '../components/ui';
import { COLORS } from '../constants/colors';
import { useSite } from '../lib/site-context';
import { createLandOpening, type LandOpeningEditState, updateLandOpening } from '../lib/cngr-api';

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

export default function LandOpeningFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const editState = location.state as LandOpeningEditState | null;

  const [siteError, setSiteError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [realization, setRealization] = useState('');
  const [target, setTarget] = useState('');

  const { selectedSite } = useSite();

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (!editState) {
      setSubmitError('Data bukaan lahan tidak ditemukan. Buka halaman daftar dan coba lagi.');
      return;
    }

    setDate(toDateInputValue(editState.date));
    setRealization(String(editState.realization));
    setTarget(String(editState.target));
    setSubmitError(undefined);
  }, [isEditMode, editState]);

  const onSubmit = async () => {
    if (!selectedSite) {
      setSiteError('Site wajib dipilih.');
      return;
    }

    if (isEditMode && !id) {
      setSubmitError('Data bukaan lahan tidak valid.');
      return;
    }

    if (isEditMode && !editState) {
      setSubmitError('Data bukaan lahan tidak ditemukan. Buka halaman daftar dan coba lagi.');
      return;
    }

    setSiteError(undefined);
    setSubmitError(undefined);

    if (!date || !realization || !target) {
      setSubmitError('Lengkapi seluruh data bukaan lahan terlebih dahulu.');
      return;
    }

    const actualValue = Number(realization);
    const targetValue = Number(target);
    const siteId = Number(selectedSite.id);

    if (!Number.isFinite(actualValue) || !Number.isFinite(targetValue) || !Number.isFinite(siteId)) {
      setSubmitError('Data bukaan lahan tidak valid.');
      return;
    }

    const payload = {
      actual: actualValue,
      date: new Date(date).toISOString(),
      site_id: siteId,
      target: targetValue,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateLandOpening(id, payload);
      } else {
        await createLandOpening(payload);
      }
      navigate('/land-opening');
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? 'Gagal memperbarui data bukaan lahan.'
            : 'Gagal menyimpan data bukaan lahan.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = isEditMode ? 'Edit Bukaan Lahan' : 'Tambah Bukaan Lahan';

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumb={[
          { label: 'Bukaan Lahan', to: '/land-opening' },
          { label: formTitle },
        ]}
      />

      <div className="space-y-6 p-10" style={{ backgroundColor: COLORS.backgroundGray }}>
        {selectedSite ? (
          <>
            <FormSection
              step={1}
              title="Site Data"
              description="Site yang sedang dipilih dari menu sebelumnya."
            >
              <div className="rounded-xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
                <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                  Selected Site
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                  {selectedSite.name}
                </p>
              </div>
            </FormSection>

            <FormSection
              step={2}
              title="Detail Data"
              description="Masukkan data tanggal product, target, dan realisasi untuk keperluan chart."
            >
              <div className="grid grid-cols-1 gap-4">
                <DatePickerInput label="Tanggal Product" value={date} onChange={setDate} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormTextField
                    label="Target"
                    isRequired
                    type="number"
                    placeholder="Masukkan target yang perlu dicapai"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="max-w-sm"
                  />
                  <FormTextField
                    label="Realisasi"
                    isRequired
                    type="number"
                    placeholder="Masukkan nilai realisasi"
                    value={realization}
                    onChange={(e) => setRealization(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="md" onClick={() => navigate('/land-opening')}>
                  Kembali
                </Button>
                <Button type="button" size="md" onClick={onSubmit} disabled={isSubmitting || (isEditMode && !editState)}>
                  {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
                </Button>
              </div>
              {submitError ? <p className="text-sm" style={{ color: COLORS.primary }}>{submitError}</p> : null}
            </FormSection>
          </>
        ) : (
          <div
            className="rounded-xl border bg-white p-8 text-center shadow-sm"
            style={{ borderColor: COLORS.border }}
          >
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              {siteError ?? 'Silakan pilih site terlebih dahulu.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
