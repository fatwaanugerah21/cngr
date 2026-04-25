import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CNGRIcon from '../icons/cngr.icon';
import { Button, Input } from '../components/ui';
import { COLORS } from '../constants/colors';
import mainImage from '../assets/main-image.jpg';
import cngrText from '../assets/cngr-text.png';
import {
  AUTH_ACCESS_TOKEN_STORAGE_KEY,
  getLoginErrorMessage,
  loginWithEmailPassword,
} from '../lib/auth';

function persistAccessToken(token: string): void {
  sessionStorage.setItem(AUTH_ACCESS_TOKEN_STORAGE_KEY, token);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    setIsSubmitting(true);
    try {
      const { token } = await loginWithEmailPassword({ email: email.trim(), password });
      persistAccessToken(token);
      navigate('/dashboard');
    } catch (err) {
      setFormError(getLoginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen w-full flex-col md:h-screen md:flex-row md:items-stretch md:overflow-hidden"
      style={{ backgroundColor: COLORS.white }}
    >
      {/* Image panel - top on mobile, left 50% on desktop */}
      <div
        className="relative flex min-h-[200px] shrink-0 flex-col overflow-hidden md:min-h-0 md:min-w-0 md:max-w-[50%] md:flex-1 md:mt-6 md:mb-6 md:ml-6 md:rounded-3xl md:shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <img
          src={mainImage}
          alt="Gedung"
          className="absolute inset-0 h-full w-full object-cover md:rounded-3xl"
          style={{
            filter: 'saturate(0.9) contrast(1.05) brightness(0.6)',
          }}
        />
        <div
          className="absolute inset-0 md:rounded-3xl"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        <div
          className="relative z-10 flex flex-1 flex-col items-center justify-center  md:-mt-[70%]"
          style={{ padding: 24 }}
        >
          <img
            src={cngrText}
            alt="CNGR"
            className="h-[48px] w-auto object-contain md:h-[60px]"
            style={{
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
            }}
          />
        </div>
      </div>

      {/* Right panel - Login form */}
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-y-auto px-6 py-8 md:overflow-hidden md:px-14 md:py-12 md:pl-14 md:pr-16"
        style={{ backgroundColor: COLORS.white }}
      >
        <div className="mx-auto w-full max-w-[400px]">
          <CNGRIcon
            fill={COLORS.primary}
            style={{ width: 24, height: 28, marginBottom: 16 }}
          />
          <h1
            className="mb-1.5 text-xl font-bold leading-tight"
            style={{ color: COLORS.textPrimary }}
          >
            Masuk ke akun Anda
          </h1>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: COLORS.textSecondary }}
          >
            Silakan masukkan email dan kata sandi untuk mengakses akun Anda
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col">
            {formError && (
              <p
                className="mb-4 rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}
                role="alert"
              >
                {formError}
              </p>
            )}
            <div className="mb-4">
              <Input
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-6">
              <Input
                id="password"
                label="Kata sandi"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi Anda"
                required
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
