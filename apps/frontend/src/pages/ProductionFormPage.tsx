import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSection, FormTextField } from '../components/forms';
import PageHeader from '../components/layout/PageHeader';
import { Button, DatePickerInput } from '../components/ui';
import { COLORS } from '../constants/colors';
import { useSite } from '../lib/site-context';
import { createProduction } from '../lib/cngr-api';

function deriveProductionStatus(efficiency: number): string {
  if (efficiency >= 80) {
    return 'Good';
  }
  if (efficiency >= 50) {
    return 'Warn';
  }
  return 'Danger';
}

export default function ProductionFormPage() {
  const navigate = useNavigate();
  const [siteError, setSiteError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [realization, setRealization] = useState('');
  const [target, setTarget] = useState('');

  const { selectedSite } = useSite();

  const onSubmit = async () => {
    if (!selectedSite) {
      setSiteError('Site wajib dipilih.');
      return;
    }
    setSiteError(undefined);
    setSubmitError(undefined);

    if (!date || !realization || !target) {
      setSubmitError('Lengkapi seluruh data produksi terlebih dahulu.');
      return;
    }

    const actualValue = Number(realization);
    const targetValue = Number(target);
    const siteId = Number(selectedSite.id);
    const efficiency = targetValue > 0 ? (actualValue / targetValue) * 100 : 0;

    if (!Number.isFinite(actualValue) || !Number.isFinite(targetValue) || !Number.isFinite(siteId)) {
      setSubmitError('Data produksi tidak valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduction({
        actual: actualValue,
        date,
        efficiency,
        siteID: siteId,
        status: deriveProductionStatus(efficiency),
        target: targetValue,
      });
      navigate('/production');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan data produksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumb={[
          { label: 'Production', to: '/production' },
          { label: 'Tambah Production' },
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
                <p className="text-xs" style={{ color: COLORS.textSecondary }}>Selected Site</p>
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
                <Button type="button" variant="outline" size="md" onClick={() => navigate('/production')}>
                  Kembali
                </Button>
                <Button type="button" size="md" onClick={onSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
                </Button>
              </div>
              {submitError ? (
                <p className="text-sm" style={{ color: COLORS.primary }}>
                  {submitError}
                </p>
              ) : null}
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
