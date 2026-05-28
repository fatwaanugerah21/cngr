import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InfoField, InfoFieldGrid } from '../components/account';
import { FormSection, FormSelectField, FormTextField } from '../components/forms';
import PageHeader from '../components/layout/PageHeader';
import { Button } from '../components/ui';
import { COLORS } from '../constants/colors';
import {
  createUser,
  type UserManagementRecord,
  updateUserProfile,
} from '../lib/cngr-api';
import { useUserDirectory } from '../lib/user-directory-context';
import { EUserRole } from '../lib/navigation-session';

const GENDER_OPTIONS = [
  { value: '', label: 'Pilih Jenis Kelamin' },
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'Pilih Role' },
  { value: EUserRole.ADMIN, label: 'Admin' },
  { value: EUserRole.SUPERVISOR, label: 'Supervisor' },
  { value: EUserRole.DIRECTOR, label: 'Director' },
];

type FormMode = 'create' | 'edit';

function toDateInputValue(value: string): string {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export default function UserManagementFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const mode: FormMode = id ? 'edit' : 'create';
  const { getUser } = useUserDirectory();

  const [detail, setDetail] = useState<UserManagementRecord | undefined>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [nik, setNik] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  useEffect(() => {
    if (mode !== 'edit' || !id) {
      setDetail(undefined);
      setFirstName('');
      setLastName('');
      setGender('');
      setNik('');
      setPosition('');
      setEmail('');
      setUsername('');
      setPassword('');
      setRole('');
      setCity('');
      setProvince('');
      setPostalCode('');
      setBirthDate('');
      setFormError(undefined);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const userId = id;

    async function loadUserDetail() {
      setIsLoading(true);
      setFormError(undefined);

      try {
        const user = await getUser(userId);
        if (cancelled) {
          return;
        }

        if (user) {
          setDetail(user);
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setGender(user.gender);
          setNik(user.nik);
          setPosition(user.position);
          setEmail(user.email);
          setUsername(user.username);
          setRole(user.role);
          setCity(user.city ?? '');
          setProvince(user.province ?? '');
          setPostalCode(user.postalCode ?? '');
          setBirthDate(toDateInputValue(user.birthDate ?? ''));
        } else {
          setDetail(undefined);
          setFormError('Data user tidak ditemukan.');
        }
      } catch (err) {
        if (!cancelled) {
          setDetail(undefined);
          setFormError(err instanceof Error ? err.message : 'Gagal memuat detail user.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUserDetail();

    return () => {
      cancelled = true;
    };
  }, [getUser, id, mode]);

  const breadcrumb = useMemo(
    () => [
      { label: 'Manajemen User', to: '/user-management' },
      { label: mode === 'edit' ? 'Edit User' : 'Tambah User' },
    ],
    [mode]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(undefined);

    if (!firstName.trim() || !lastName.trim() || !gender.trim() || !nik.trim() || !position.trim() || !email.trim()) {
      setFormError('Lengkapi data user terlebih dahulu.');
      return;
    }

    if (mode === 'create') {
      if (!username.trim() || !password.trim() || !role.trim()) {
        setFormError('Username, password, dan role wajib diisi.');
        return;
      }

      setIsSubmitting(true);
      try {
        await createUser({
          email: email.trim(),
          firstname: firstName.trim(),
          gender: gender.trim(),
          lastname: lastName.trim(),
          nik: nik.trim(),
          password,
          position: position.trim(),
          role: role.trim(),
          username: username.trim(),
        });
        navigate('/user-management');
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Gagal menyimpan user.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!detail?.id) {
      setFormError('Data user tidak tersedia.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserProfile(detail.id, {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        gender: gender.trim(),
        nik: nik.trim(),
        position: position.trim(),
        email: email.trim(),
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        birth_date: birthDate ? new Date(birthDate).toISOString() : undefined,
        ...(password.trim() ? { password } : {}),
      });
      navigate('/user-management');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
          Memuat data user...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader breadcrumb={breadcrumb} />

      <div className="flex flex-col gap-6 p-10" style={{ backgroundColor: COLORS.backgroundGray }}>
        <div>
          <h1 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
            User
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed" style={{ color: COLORS.textSecondary }}>
            {mode === 'edit'
              ? 'Perbarui data user yang sudah terdaftar di sistem.'
              : 'Halaman untuk menambah akun user agar mereka dapat mengakses website.'}
          </p>
        </div>

        {mode === 'edit' && !detail ? (
          <div className="mx-auto w-full max-w-3xl rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              {formError ?? 'Data user tidak tersedia.'}
            </p>
            <div className="mt-4">
              <Button type="button" variant="outline" size="md" onClick={() => navigate('/user-management')}>
                Kembali
              </Button>
            </div>
          </div>
        ) : (
          <form className="mx-auto flex w-full max-w-3xl flex-col gap-6" onSubmit={handleSubmit}>
            <FormSection
              step={1}
              title="Data User"
              description={
                mode === 'edit'
                  ? 'Perbarui identitas dasar user yang tersimpan di sistem.'
                  : 'Silahkan lengkapi data user di bawah ini untuk bisa menambahkan akun user.'
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormTextField
                  label="Nama Depan"
                  isRequired
                  placeholder="Masukkan nama depan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <FormTextField
                  label="Nama Belakang"
                  isRequired
                  placeholder="Masukkan nama belakang"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <FormSelectField
                  label="Jenis Kelamin"
                  options={GENDER_OPTIONS}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
                <FormTextField
                  label="NIK Karyawan"
                  isRequired
                  placeholder="Masukkan NIK karyawan"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                />
                <FormTextField
                  label="Jabatan"
                  isRequired
                  placeholder="Masukkan jabatan user"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="sm:col-span-2"
                />
              </div>
            </FormSection>

            {mode === 'edit' ? (
              <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: COLORS.border }}>
                <InfoFieldGrid>
                  <InfoField label="Username" value={username || '-'} />
                  <InfoField label="Role" value={role || '-'} />
                </InfoFieldGrid>
                <p className="mt-4 text-xs" style={{ color: COLORS.textSecondary }}>
                  Username dan role hanya bisa diubah saat user dibuat. Edit ini mengikuti endpoint profil.
                </p>
              </div>
            ) : null}

            <FormSection
              step={2}
              title="Data Akun"
              description={
                mode === 'edit'
                  ? 'Perbarui detail akun dan informasi profil yang disediakan oleh backend.'
                  : 'Silahkan lengkapi data akun di bawah ini untuk bisa menambahkan akun user.'
              }
            >
              {mode === 'create' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormTextField
                    label="Username"
                    isRequired
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <FormSelectField
                    label="Role"
                    options={ROLE_OPTIONS}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <FormTextField
                    label="Email"
                    isRequired
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FormTextField
                    label="Password"
                    isRequired
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormTextField
                    label="Email"
                    isRequired
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FormTextField
                    label="Password Baru"
                    type="password"
                    placeholder="Kosongkan jika tidak diubah"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <FormTextField
                    label="Kabupaten / Kota"
                    placeholder="Masukkan kabupaten atau kota"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <FormTextField
                    label="Provinsi"
                    placeholder="Masukkan provinsi"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                  <FormTextField
                    label="Kode Pos"
                    placeholder="Masukkan kode pos"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                  <FormTextField
                    label="Tanggal Lahir"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              )}
            </FormSection>

            {formError ? (
              <p className="text-sm" style={{ color: COLORS.primary }}>
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="md" onClick={() => navigate('/user-management')}>
                Kembali
              </Button>
              <Button type="submit" size="md" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
