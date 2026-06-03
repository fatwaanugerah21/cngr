import { useEffect, useMemo, useState } from 'react';
import { FormSelectField, FormTextareaField, FormTextField } from '../forms';
import type { FormSelectOption } from '../forms/FormSelectField';
import { Button } from '../ui';
import Modal from '../ui/Modal';
import { COLORS } from '../../constants/colors';
import type { SiteRecord } from '../../data/sites-dummy';
import type { UserManagementRecord } from 'src/lib/cngr-api';

export type CreateSitePayload = {
  siteName: string;
  picValue: string;
  city: string;
  province: string;
  location: string;
};

export type SiteFormMode = 'create' | 'edit';

interface CreateSiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateSitePayload) => void | Promise<void>;
  supervisors: UserManagementRecord[];
  mode?: SiteFormMode;
  site?: SiteRecord;
}

function ClipboardGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
        stroke={COLORS.textPrimary}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke={COLORS.textPrimary} strokeWidth="1.75" />
    </svg>
  );
}

const emptyForm = {
  siteName: '',
  picValue: '',
  city: '',
  province: '',
  location: '',
};

function siteToForm(site: SiteRecord): typeof emptyForm {
  return {
    siteName: site.name,
    picValue: site.supervisorId.trim(),
    city: site.city,
    province: site.province === '-' ? '' : site.province,
    location: site.location === '—' ? '' : site.location,
  };
}

export default function CreateSiteModal({
  open,
  onOpenChange,
  onSubmit,
  supervisors,
  mode = 'create',
  site,
}: CreateSiteModalProps) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(emptyForm);
  const [siteNameError, setSiteNameError] = useState<string | undefined>();
  const [picError, setPicError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const picSelectOptions = useMemo<FormSelectOption[]>(
    () => [
      { value: '', label: 'Pilih PIC' },
      ...supervisors.map((user) => ({
        value: user.id,
        label: user.fullName,
      })),
    ],
    [supervisors]
  );

  useEffect(() => {
    if (open) {
      setForm(isEdit && site ? siteToForm(site) : emptyForm);
      setSiteNameError(undefined);
      setPicError(undefined);
      setIsSubmitting(false);
    }
  }, [open, isEdit, site]);

  const handleSubmit = async () => {
    const name = form.siteName.trim();
    if (!name) {
      setSiteNameError('Bidang ini wajib diisi.');
      return;
    }
    if (!form.picValue) {
      setPicError('Pilih PIC site.');
      return;
    }
    setSiteNameError(undefined);
    setPicError(undefined);
    setIsSubmitting(true);
    try {
      await onSubmit({
        siteName: name,
        picValue: form.picValue,
        city: form.city.trim(),
        province: form.province.trim(),
        location: form.location.trim(),
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="flex gap-3 border-b pb-4" style={{ borderColor: COLORS.border }}>
        <span className="shrink-0 pt-0.5">
          <ClipboardGlyph />
        </span>
        <div>
          <h2 id="create-site-modal-title" className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
            Data Site
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: COLORS.textSecondary }}>
            {isEdit ? 'Modal untuk ubah data site' : 'Modal untuk tambah data site'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <FormTextField
          label="Nama Site"
          placeholder="Weda Bay Site"
          value={form.siteName}
          onChange={(e) => {
            setForm((f) => ({ ...f, siteName: e.target.value }));
            if (siteNameError) setSiteNameError(undefined);
          }}
          error={siteNameError}
          autoFocus
        />
        <FormSelectField
          label="Pilih PIC Site"
          value={form.picValue}
          onChange={(e) => {
            setForm((f) => ({ ...f, picValue: e.target.value }));
            if (picError) setPicError(undefined);
          }}
          options={picSelectOptions}
          error={picError}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormTextField
            label="Kota"
            placeholder="Halmahera Tengah"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
          <FormTextField
            label="Provinsi"
            placeholder="Maluku Utara"
            value={form.province}
            onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
          />
        </div>
        <FormTextareaField
          label="Lokasi"
          placeholder="Masukkan Lokasi / Alamat anda disini"
          rows={4}
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        {!isEdit ? (
          <div
            className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-relaxed text-blue-900"
            role="note"
          >
            Status site yang dibuat akan memiliki status active, anda dapat mengubah status di halaman depan master data
          </div>
        ) : null}
        <Button type="button" variant="submit" size="md" fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Data'}
        </Button>
      </div>
    </Modal>
  );
}
