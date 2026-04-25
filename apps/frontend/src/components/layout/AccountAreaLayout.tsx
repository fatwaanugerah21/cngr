import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ACCOUNT_PROFILE } from '../../data/account-profile';
import { Button } from '../ui';
import { AccountSubNav, ProfileCompletionBar } from '../account';
import PageHeader, { type BreadcrumbItem } from './PageHeader';
import { COLORS } from '../../constants/colors';

const HEADER_USER = { name: 'Ghifary Modeong', role: 'Administrator', avatar: ACCOUNT_PROFILE.avatarUrl } as const;

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

export default function AccountAreaLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isUserHome = pathname === '/account/user';
  const isUserEdit = pathname === '/account/user/edit';
  const isSecurity = pathname === '/account/security';

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
          onClick={() => navigate(isSecurity ? '/account/user' : '/account/user')}
        >
          Kembali
        </Button>
        <Button
          type="submit"
          size="sm"
          form={isUserEdit ? 'account-edit-form' : 'account-security-form'}
        >
          Simpan Data
        </Button>
      </div>
    ) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader breadcrumb={buildBreadcrumb(pathname)} user={HEADER_USER} />
      <div className="flex-1 p-6 sm:p-8" style={{ backgroundColor: COLORS.backgroundGray }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <ProfileCompletionBar percent={ACCOUNT_PROFILE.profileCompletePercent} />
            </div>
            {trailing ? <div className="flex justify-end lg:justify-start">{trailing}</div> : null}
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <AccountSubNav />
            <div className="min-w-0 flex-1 space-y-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
