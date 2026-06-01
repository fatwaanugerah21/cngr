import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountAvatarEditor, AccountSectionCard } from '../../components/account';
import { FormSelectField, FormTextField } from '../../components/forms';
import { type AccountProfileData, updateUserProfile, uploadUserProfileImage } from '../../lib/cngr-api';
import { useAuth } from '../../lib/auth-context';

const GENDER_OPTIONS = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

function toDateInputValue(value: string): string {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export default function UserAccountEditPage() {
  const navigate = useNavigate();
  const { user: currentUser, isInitializing, refreshCurrentUser } = useAuth();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<AccountProfileData | undefined>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [gender, setGender] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  useEffect(() => {
    setIsLoading(isInitializing);
    setProfile(currentUser);
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setEmail(currentUser.email);
      setEmployeeId(currentUser.employeeId);
      setGender(currentUser.gender);
      setJobTitle(currentUser.jobTitle);
      setCity(currentUser.city);
      setProvince(currentUser.province);
      setPostalCode(currentUser.postalCode);
      setBirthDate(toDateInputValue(currentUser.birthDate));
      setPhone(currentUser.phone);
    }
  }, [currentUser, isInitializing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      setFormError('Data akun tidak tersedia.');
      return;
    }

    setFormError(undefined);
    setIsSubmitting(true);
    try {
      if (avatarFile) {
        await uploadUserProfileImage(profile.id, avatarFile);
      }

      const resp = await updateUserProfile(profile.id, {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email: email.trim(),
        nik: employeeId.trim(),
        gender,
        position: jobTitle.trim(),
        city: city.trim(),
        province: province.trim(),
        postal_code: postalCode.trim(),
        phone_number: phone.trim(),
        birth_date: birthDate ? new Date(birthDate).toISOString() : undefined,
      });

      console.log("Resp: ", resp);
      
      await refreshCurrentUser();
      navigate('/account/user');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-sm text-gray-500">Memuat data akun...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-sm text-gray-500">{formError ?? 'Data akun tidak tersedia.'}</p>
      </div>
    );
  }

  return (
    <form id="account-edit-form" className="space-y-6" onSubmit={handleSubmit}>
      <AccountSectionCard
        step={1}
        title="Informasi pribadi"
        description="Perbarui foto profil dan data diri Anda."
      >
        <AccountAvatarEditor
          defaultImageUrl={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'U')}`}
          file={avatarFile}
          onFileChange={setAvatarFile}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField label="Nama depan" value={firstName} onChange={(ev) => setFirstName(ev.target.value)} />
          <FormTextField label="Nama belakang" value={lastName} onChange={(ev) => setLastName(ev.target.value)} />
          <FormTextField
            label="Email"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <FormTextField label="NIK pegawai" value={employeeId} onChange={(ev) => setEmployeeId(ev.target.value)} />
          <FormSelectField
            label="Jenis kelamin"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={(ev) => setGender(ev.target.value)}
          />
          <FormTextField label="Jabatan" value={jobTitle} onChange={(ev) => setJobTitle(ev.target.value)} />
        </div>
      </AccountSectionCard>

      <AccountSectionCard
        step={2}
        title="Kontak & alamat"
        description="Pastikan kontak Anda selalu mutakhir."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField label="Kabupaten / kota" value={city} onChange={(ev) => setCity(ev.target.value)} />
          <FormTextField label="Provinsi" value={province} onChange={(ev) => setProvince(ev.target.value)} />
          <FormTextField label="Kode pos" value={postalCode} onChange={(ev) => setPostalCode(ev.target.value)} />
          <FormTextField
            label="Tanggal lahir"
            type="date"
            value={birthDate}
            onChange={(ev) => setBirthDate(ev.target.value)}
          />
          <FormTextField label="No. telepon" value={phone} onChange={(ev) => setPhone(ev.target.value)} />
        </div>
      </AccountSectionCard>
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      {isSubmitting ? <p className="text-sm text-gray-500">Menyimpan perubahan...</p> : null}
    </form>
  );
}
