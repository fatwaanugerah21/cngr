import { useEffect, useState } from 'react';
import { AccountProfileSkeleton, AccountSectionCard, InfoField, InfoFieldGrid } from '../../components/account';
import { COLORS } from '../../constants/colors';
import { fetchCurrentAccountProfile, type AccountProfileData } from '../../lib/cngr-api';
import { useAuth } from '../../lib/auth-context';
import { useTableLoading } from '../../lib/use-table-loading';

export default function UserAccountPage() {
  const { user: currentUser, isInitializing, setCurrentUser } = useAuth();
  const [profile, setProfile] = useState<AccountProfileData | undefined>();
  const [error, setError] = useState<string | undefined>();
  const profileLoadKey = currentUser?.id?.trim() ?? '';
  const { showSkeleton, startLoad, finishLoad, resetLoad } = useTableLoading(profileLoadKey, {
    initialLoading: true,
  });

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    const userId = profileLoadKey;
    if (userId === '') {
      setProfile(undefined);
      setError('Data akun tidak tersedia.');
      resetLoad();
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      startLoad();
      setError(undefined);

      try {
        const data = await fetchCurrentAccountProfile();
        if (cancelled) {
          return;
        }

        if (!data) {
          setProfile(undefined);
          setError('Data akun tidak tersedia.');
          return;
        }

        setProfile(data);
        setCurrentUser(data);
      } catch (err) {
        if (!cancelled) {
          setProfile(undefined);
          setError(err instanceof Error ? err.message : 'Gagal memuat data akun.');
        }
      } finally {
        if (!cancelled) {
          finishLoad(userId);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [finishLoad, isInitializing, profileLoadKey, resetLoad, setCurrentUser, startLoad]);

  if (isInitializing || showSkeleton) {
    return <AccountProfileSkeleton loadingLabel="Memuat data akun…" />;
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
          {error ?? 'Data akun tidak tersedia.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 opacity-100 transition-opacity duration-300 ease-out motion-reduce:transition-none">
      <AccountSectionCard
        step={1}
        title="Informasi pribadi"
        description="Identitas dan peran Anda sebagaimana tersimpan di sistem."
      >
        <div className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center" style={{ borderColor: COLORS.border }}>
          <img
            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.firstName || 'U')}`}
            alt=""
            className="h-24 w-24 shrink-0 rounded-full object-cover"
            style={{ border: `2px solid ${COLORS.border}` }}
          />
          <div>
            <p className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              {profile.firstName} {profile.lastName}
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: COLORS.textSecondary }}>
              {profile.jobTitle}
            </p>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              {profile.locationLabel}
            </p>
          </div>
        </div>
        <InfoFieldGrid>
          <InfoField label="Nama depan" value={profile.firstName || '-'} />
          <InfoField label="Nama belakang" value={profile.lastName || '-'} />
          <InfoField label="Email" value={profile.email || '-'} />
          <InfoField label="NIK pegawai" value={profile.employeeId || '-'} />
          <InfoField label="Jenis kelamin" value={profile.gender || '-'} />
          <InfoField label="Jabatan" value={profile.jobTitle || '-'} />
        </InfoFieldGrid>
      </AccountSectionCard>

      <AccountSectionCard
        step={2}
        title="Kontak & alamat"
        description="Alamat dan cara menghubungi Anda."
      >
        <InfoFieldGrid>
          <InfoField label="Kabupaten / kota" value={profile.city || '-'} />
          <InfoField label="Provinsi" value={profile.province || '-'} />
          <InfoField label="Kode pos" value={profile.postalCode || '-'} />
          <InfoField
            label="Tanggal lahir"
            value={
              profile.birthDate
                ? new Date(profile.birthDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'
            }
          />
          <InfoField label="No. telepon" value={profile.phone || '-'} />
        </InfoFieldGrid>
      </AccountSectionCard>
    </div>
  );
}
