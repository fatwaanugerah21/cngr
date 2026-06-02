import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { AccountSubNav, ProfileCompletionBar } from '../account';
import PageHeader, { type BreadcrumbItem } from './PageHeader';
import { COLORS } from '../../constants/colors';
import type { AccountProfileData } from '../../lib/cngr-api';
import { useAuth } from '../../lib/auth-context';

function computeProfileCompletion(profile: AccountProfileData): number {
  const fields = [
    profile.avatarUrl,
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.employeeId,
    profile.gender,
    profile.jobTitle,
    profile.city,
    profile.province,
    profile.postalCode,
    profile.birthDate,
    profile.phone,
  ];
  const filled = fields.filter((field) => field.trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 3.5V14.5M3.5 9H14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function buildBreadcrumb(pathname: string): BreadcrumbItem[] {
  if (pathname === '/account/security') {
    return [
      { label: 'Pengaturan akun', to: '/account/user' },
      { label: 'Keamanan akun' },
    ];
  }
  if (pathname === '/account/user/edit') {
    return [
      { label: 'Pengaturan akun', to: '/account/user' },
      { label: 'Akun pengguna', to: '/account/user' },
      { label: 'Ubah akun' },
    ];
  }
  return [
    { label: 'Pengaturan akun', to: '/account/user' },
    { label: 'Akun pengguna' },
  ];
}

export type AccountAreaOutletContext = {
  setIsSubmitting: (submitting: boolean) => void;
};

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm" style={{ color: COLORS.textSecondary }}>
        Memuat data akun...
      </p>
    </div>
  );
}

export default function AccountAreaLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user: profile, isInitializing } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUserHome = pathname === '/account/user';
  const isUserEdit = pathname === '/account/user/edit';
  const isSecurity = pathname === '/account/security';

  useEffect(() => {
    setIsSubmitting(false);
  }, [pathname]);

  const profileCompletion = profile ? computeProfileCompletion(profile) : 0;

  if (isInitializing) {
    return <LoadingState />;
  }

  if (!profile) {
    return <LoadingState />;
  }

  const trailing =
    isUserHome ? (
      <Button type="button" size="sm" leftIcon={<PlusIcon />} onClick={() => navigate('/account/user/edit')}>
        Edit Data
      </Button>
    ) : isUserEdit || isSecurity ? (
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={() => navigate(isSecurity ? '/account/user' : '/account/user')}
        >
          Kembali
        </Button>
        <Button
          type="submit"
          variant="submit"
          size="sm"
          disabled={isSubmitting}
          form={isUserEdit ? 'account-edit-form' : 'account-security-form'}
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
        </Button>
      </div>
    ) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader breadcrumb={buildBreadcrumb(pathname)} />
      <div className="flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <ProfileCompletionBar percent={profileCompletion} />
            </div>
            {trailing ? <div className="flex justify-end lg:justify-start">{trailing}</div> : null}
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <AccountSubNav />
            <div className="min-w-0 flex-1 space-y-6">
              <Outlet context={{ setIsSubmitting } satisfies AccountAreaOutletContext} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
