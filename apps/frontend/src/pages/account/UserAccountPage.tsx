import { AccountSectionCard, InfoField, InfoFieldGrid } from '../../components/account';
import { ACCOUNT_PROFILE } from '../../data/account-profile';
import { COLORS } from '../../constants/colors';

function formatBirthDisplay(isoDate: string): string {
  try {
    const d = new Date(`${isoDate}T12:00:00`);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoDate;
  }
}

export default function UserAccountPage() {
  const p = ACCOUNT_PROFILE;

  return (
    <div className="space-y-6">
      <AccountSectionCard
        step={1}
        title="Informasi pribadi"
        description="Identitas dan peran Anda sebagaimana tersimpan di sistem."
      >
        <div className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center" style={{ borderColor: COLORS.border }}>
          <img
            src={p.avatarUrl}
            alt=""
            className="h-24 w-24 shrink-0 rounded-full object-cover"
            style={{ border: `2px solid ${COLORS.border}` }}
          />
          <div>
            <p className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              {p.firstName} {p.lastName}
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: COLORS.textSecondary }}>
              {p.jobTitle}
            </p>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              {p.locationLabel}
            </p>
          </div>
        </div>
        <InfoFieldGrid>
          <InfoField label="Nama depan" value={p.firstName} />
          <InfoField label="Nama belakang" value={p.lastName} />
          <InfoField label="Email" value={p.email} />
          <InfoField label="NIK pegawai" value={p.employeeId} />
          <InfoField label="Jenis kelamin" value={p.gender} />
          <InfoField label="Jabatan" value={p.jobTitle} />
        </InfoFieldGrid>
      </AccountSectionCard>

      <AccountSectionCard
        step={2}
        title="Kontak & alamat"
        description="Alamat dan cara menghubungi Anda."
      >
        <InfoFieldGrid>
          <InfoField label="Kabupaten / kota" value={p.city} />
          <InfoField label="Provinsi" value={p.province} />
          <InfoField label="Kode pos" value={p.postalCode} />
          <InfoField label="Tanggal lahir" value={formatBirthDisplay(p.birthDate)} />
          <InfoField label="No. telepon" value={p.phone} />
        </InfoFieldGrid>
      </AccountSectionCard>
    </div>
  );
}
