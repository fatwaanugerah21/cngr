import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploadField, FormSection, FormTextField } from '../components/forms';
import PageHeader from '../components/layout/PageHeader';
import { Button, DatePickerInput, SearchableSelectInput } from '../components/ui';
import { COLORS } from '../constants/colors';

type InputMode = 'manual' | 'upload';

type PreviewRow = {
  id: string;
  date: string;
  site: string;
  realization: string;
  target: string;
  efficiency: string;
  status: 'Warn' | 'Good' | 'Danger';
};

const SITE_OPTIONS = [
  { value: '', label: 'Pilih Site' },
  { value: 'weda-bay', label: 'Weda Bay' },
  { value: 'morowali', label: 'Morowali' },
  { value: 'morowali-utara', label: 'Morowali Utara' },
] as const;

const DEFAULT_USER = { name: 'Ghifary Modeong', role: 'admin' } as const;

const BASE_PREVIEW_ROWS: PreviewRow[] = [
  { id: 'base-1', date: '14 April 2026', site: 'Morowali', realization: '6500', target: '13000', efficiency: '50%', status: 'Warn' },
  { id: 'base-2', date: '14 April 2026', site: 'Weda Bay', realization: '5000', target: '5000', efficiency: '100%', status: 'Good' },
  { id: 'base-3', date: '14 April 2026', site: 'Morowali Utara', realization: '2000', target: '6000', efficiency: '40%', status: 'Danger' },
];

function computeStatus(realization: number, target: number): PreviewRow['status'] {
  if (target <= 0) return 'Warn';
  const ratio = realization / target;
  if (ratio >= 1) return 'Good';
  if (ratio >= 0.5) return 'Warn';
  return 'Danger';
}

function computeEfficiency(realization: number, target: number): string {
  if (target <= 0) return '0%';
  const percentage = Math.round((realization / target) * 100);
  return `${percentage}%`;
}

function statusChipStyle(status: PreviewRow['status']) {
  if (status === 'Good') {
    return { color: '#16A34A', backgroundColor: 'color-mix(in srgb, #22C55E 14%, #FFFFFF)' };
  }
  if (status === 'Warn') {
    return { color: '#D97706', backgroundColor: 'color-mix(in srgb, #F59E0B 18%, #FFFFFF)' };
  }
  return { color: '#DC2626', backgroundColor: 'color-mix(in srgb, #EF4444 14%, #FFFFFF)' };
}

export default function ProductionFormPage() {
  const navigate = useNavigate();
  const [site, setSite] = useState('');
  const [siteError, setSiteError] = useState<string | undefined>();
  const [mode, setMode] = useState<InputMode>('manual');
  const [date, setDate] = useState('');
  const [realization, setRealization] = useState('');
  const [target, setTarget] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const selectedSiteLabel =
    SITE_OPTIONS.find((option) => option.value === site)?.label ?? '';

  const previewRows = useMemo(() => {
    if (!showPreview) return [];
    if (mode === 'upload') return BASE_PREVIEW_ROWS;

    const realizationValue = Number(realization);
    const targetValue = Number(target);
    if (!selectedSiteLabel || !date || Number.isNaN(realizationValue) || Number.isNaN(targetValue)) {
      return BASE_PREVIEW_ROWS;
    }

    const inputRow: PreviewRow = {
      id: 'manual-new',
      date,
      site: selectedSiteLabel,
      realization: realization,
      target: target,
      efficiency: computeEfficiency(realizationValue, targetValue),
      status: computeStatus(realizationValue, targetValue),
    };
    return [inputRow, ...BASE_PREVIEW_ROWS];
  }, [showPreview, mode, selectedSiteLabel, date, realization, target]);

  const submitPreview = () => {
    if (!site) {
      setSiteError('Site wajib dipilih.');
      return;
    }
    setSiteError(undefined);

    if (mode === 'manual') {
      if (!date || !realization || !target) return;
      setShowPreview(true);
      return;
    }
    if (!uploadFile) return;
    setShowPreview(true);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumb={[
          { label: 'Production', to: '/production' },
          { label: 'Tambah Production' },
        ]}
        user={DEFAULT_USER}
      />

      <div className="space-y-6 p-10" style={{ backgroundColor: COLORS.backgroundGray }}>
        <FormSection
          step={1}
          title="Site Data"
          description="Mohon Pilih terlebih dahulu site yang ingin anda tambah data production nya"
        >
          <SearchableSelectInput
            label="Site"
            value={site}
            options={SITE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            placeholder="Pilih Site"
            searchPlaceholder="Cari site..."
            onChange={(nextValue) => {
              setSite(nextValue);
              if (siteError) setSiteError(undefined);
            }}
            error={siteError}
          />
        </FormSection>

        {site ? (
          <FormSection
            step={2}
            title="Detail Data"
            description="Mohon masukkan data tanggal product, target, serta realisasi untuk keperluan data chart, data yang akan di input bisa dipilih ingin input manual atau upload file."
          >
            <div
              className="grid grid-cols-2 gap-1 rounded-xl p-1"
              style={{
                border: `1px solid ${COLORS.border}`,
                backgroundColor: 'color-mix(in srgb, #F3F4F6 75%, #FFFFFF)',
              }}
            >
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold transition"
                style={{
                  color: COLORS.textPrimary,
                  border: mode === 'manual' ? `1px solid ${COLORS.border}` : '1px solid transparent',
                  backgroundColor: mode === 'manual' ? COLORS.white : 'transparent',
                  boxShadow: mode === 'manual' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setMode('manual')}
              >
                Input Manual
              </button>
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold transition"
                style={{
                  color: COLORS.textPrimary,
                  border: mode === 'upload' ? `1px solid ${COLORS.border}` : '1px solid transparent',
                  backgroundColor: mode === 'upload' ? COLORS.white : 'transparent',
                  boxShadow: mode === 'upload' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setMode('upload')}
              >
                Upload File Excel
              </button>
            </div>

            {mode === 'manual' ? (
              <>
                <DatePickerInput
                  label="Tanggal Product"
                  value={date}
                  onChange={setDate}
                />
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

              </>
            ) : (
              <>
                <div
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{
                    color: '#D97706',
                    backgroundColor: 'color-mix(in srgb, #F59E0B 14%, #FFFFFF)',
                  }}
                >
                  Untuk memastikan upload data lancar, ikuti template excel yang tersedia.
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm">
                    Download Template
                  </Button>
                </div>
                <FileUploadField
                  maxSizeMb={10}
                  accept=".xlsx,.xls"
                  value={uploadFile}
                  onChange={setUploadFile}
                />
              </>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="md" onClick={() => navigate('/production')}>
                Kembali
              </Button>
              <Button type="button" size="md" onClick={submitPreview}>
                Tambah Data
              </Button>
            </div>
          </FormSection>
        ) : null}

        {showPreview ? (
          <section className="rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
            <div className="mb-6 flex gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: COLORS.primary }}
                aria-hidden
              >
                3
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold" style={{ color: COLORS.textPrimary }}>
                  Preview Data
                </h2>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
                  Berikut preview data yang sudah anda input.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border" style={{ borderColor: COLORS.border }}>
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr style={{ backgroundColor: 'color-mix(in srgb, #3B82F6 10%, #FFFFFF)' }}>
                    {['Date', 'Site', 'Realisasi', 'Target', 'Efficiency', 'Status'].map((head) => (
                      <th key={head} className="px-5 py-4 text-left text-xs font-bold uppercase" style={{ color: '#2563EB' }}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={row.id} style={{ borderTop: index === 0 ? undefined : `1px solid ${COLORS.border}` }}>
                      <td className="px-5 py-4 text-sm" style={{ color: COLORS.textPrimary }}>{row.date}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: COLORS.textPrimary }}>{row.site}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: COLORS.textPrimary }}>{row.realization}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: COLORS.textPrimary }}>{row.target}</td>
                      <td className="px-5 py-4 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{row.efficiency}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold" style={statusChipStyle(row.status)}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => setShowPreview(false)}>
                Kembali
              </Button>
              <Button type="button" size="md" onClick={() => navigate('/production')}>
                Tambah Data
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
