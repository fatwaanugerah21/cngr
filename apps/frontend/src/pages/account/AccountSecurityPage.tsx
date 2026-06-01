import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountSectionCard } from '../../components/account';
import { FormTextField } from '../../components/forms';
import { changePassword } from '../../lib/cngr-api';
import { useAuth } from '../../lib/auth-context';

export default function AccountSecurityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setFormError('Data akun tidak tersedia.');
      return;
    }
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
    setIsSubmitting(true);
    try {
      await changePassword(user.id, {
        old_password: currentPassword,
        new_password: newPassword,
      });
      navigate('/account/user');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mengubah kata sandi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="account-security-form" className="space-y-6" onSubmit={handleSubmit}>
      <AccountSectionCard
        step={1}
        title="Ubah kata sandi"
        description="Masukkan kata sandi saat ini, lalu tentukan kata sandi baru dan konfirmasi."
      >
        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
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
      {isSubmitting ? <p className="text-sm text-gray-500">Menyimpan perubahan...</p> : null}
    </form>
  );
}
