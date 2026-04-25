import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountAvatarEditor, AccountSectionCard } from '../../components/account';
import { FormSelectField, FormTextField } from '../../components/forms';
import { ACCOUNT_PROFILE } from '../../data/account-profile';

const GENDER_OPTIONS = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

export default function UserAccountEditPage() {
  const navigate = useNavigate();
  const initial = ACCOUNT_PROFILE;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState<string>(initial.firstName);
  const [lastName, setLastName] = useState<string>(initial.lastName);
  const [email, setEmail] = useState<string>(initial.email);
  const [employeeId, setEmployeeId] = useState<string>(initial.employeeId);
  const [gender, setGender] = useState<string>(initial.gender);
  const [jobTitle, setJobTitle] = useState<string>(initial.jobTitle);
  const [city, setCity] = useState<string>(initial.city);
  const [province, setProvince] = useState<string>(initial.province);
  const [postalCode, setPostalCode] = useState<string>(initial.postalCode);
  const [birthDate, setBirthDate] = useState<string>(initial.birthDate);
  const [phone, setPhone] = useState<string>(initial.phone);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/account/user');
  };

  return (
    <form id="account-edit-form" className="space-y-6" onSubmit={handleSubmit}>
      <AccountSectionCard
        step={1}
        title="Informasi pribadi"
        description="Perbarui foto profil dan data diri Anda."
      >
        <AccountAvatarEditor
          defaultImageUrl={initial.avatarUrl}
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
    </form>
  );
}
