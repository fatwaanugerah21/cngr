import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountSectionCard } from '../../components/account';
import { FormTextField } from '../../components/forms';
import { COLORS } from '../../constants/colors';

export default function AccountSecurityPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setFormError('Kata sandi saat ini wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Kata sandi baru dan konfirmasi tidak cocok.');
      return;
    }
    setFormError(undefined);
    navigate('/account/user');
  };

  return (
    <form id="account-security-form" className="space-y-6" onSubmit={handleSubmit}>
      <AccountSectionCard
        step={1}
        title="Ubah kata sandi"
        description="Masukkan kata sandi saat ini, lalu tentukan kata sandi baru dan konfirmasi."
      >
        {formError ? (
          <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
            {formError}
          </p>
        ) : null}
        <div className="grid max-w-xl gap-4">
          <FormTextField
            label="Kata sandi saat ini"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(ev) => {
              setCurrentPassword(ev.target.value);
              if (formError) setFormError(undefined);
            }}
          />
          <FormTextField
            label="Kata sandi baru"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(ev) => {
              setNewPassword(ev.target.value);
              if (formError) setFormError(undefined);
            }}
          />
          <FormTextField
            label="Konfirmasi kata sandi baru"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(ev) => {
              setConfirmPassword(ev.target.value);
              if (formError) setFormError(undefined);
            }}
          />
        </div>
      </AccountSectionCard>
    </form>
  );
}
