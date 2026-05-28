import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import CreateSiteModal, { type CreateSitePayload } from '../components/site-management/CreateSiteModal';
import { Button, SearchInput } from '../components/ui';
import { COLORS } from '../constants/colors';
import { type SiteRecord } from '../data/sites-dummy';
import { EUserRole } from '../lib/navigation-session';
import { useSite } from '../lib/site-context';
import {
  createSite,
  listSites,
  listSitesBySupervisor,
  listSupervisorUsers,
} from '../lib/cngr-api';
import { useUserDirectory } from '../lib/user-directory-context';
import { useAuth } from '../lib/auth-context';

const RESULTS_PER_PAGE = 9;

function paginationRange(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'dots', total];
  }
  if (current >= total - 3) {
    return [1, 'dots', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, 'dots', current - 1, current, current + 1, 'dots', total];
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 3.5V14.5M3.5 9H14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 4.5L11.5 9L7 13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function SiteNodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M5.25 6.25H14.75M10 6.25V14.25M6 14.25H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="5.25" cy="6.25" r="1.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.75" cy="6.25" r="1.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="14.25" r="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FilterLinesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 5.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 9H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 12.5H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type SiteStatusMeta = {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
};

const SITE_STATUS_META: Record<SiteRecord['status'], SiteStatusMeta> = {
  active: {
    label: 'Active',
    badgeBg: '#DCFCE7',
    badgeText: '#16A34A',
    badgeBorder: '#BBF7D0',
  },
  inactive: {
    label: 'Inactive',
    badgeBg: '#FEF2F2',
    badgeText: '#DC2626',
    badgeBorder: '#FECACA',
  },
};

function SiteCard({
  site,
  canViewDashboard,
  onViewDashboard,
}: {
  site: SiteRecord;
  canViewDashboard: boolean;
  onViewDashboard: (site: SiteRecord) => void;
}) {
  const meta = SITE_STATUS_META[site.status];
  return (
    <div
      className="relative flex min-h-[172px] flex-col rounded-2xl border bg-white p-5 shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <span
        className="absolute right-5 top-5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
        style={{
          backgroundColor: meta.badgeBg,
          color: meta.badgeText,
          borderColor: meta.badgeBorder,
        }}
      >
        {meta.label}
      </span>

      <div className="flex flex-1 flex-col">
        <div className="mb-3" style={{ color: COLORS.sidebarBg }}>
          <SiteNodeIcon />
        </div>

        <h3 className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
          {site.name}
        </h3>
        <p className="mt-2 text-[11px]" style={{ color: COLORS.textSecondary }}>
          Supervisor :
          <span className="ml-1" style={{ color: COLORS.textPrimary }}>
            {site.picName}
          </span>
        </p>
      </div>

      <div className="mt-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          className="min-h-10 rounded-full !bg-[#0a1628] text-white hover:bg-[#0b1a30]"
          rightIcon={<ChevronRightIcon />}
          onClick={() => onViewDashboard(site)}
          disabled={!canViewDashboard}
        >
          Lihat Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function SiteManagementPage() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const { setSelectedSite } = useSite();
  const { setUsers, users } = useUserDirectory();
  const { user: currentUser } = useAuth();
  const currentRole = currentUser?.role ?? EUserRole.ADMIN;
  const currentUserId = currentUser?.id;

  useEffect(() => {
    let cancelled = false;

    async function loadSites() {
      setIsLoading(true);
      setError(undefined);

      try {
        const [siteResult, supervisorResult] = await Promise.allSettled([
          currentRole === EUserRole.SUPERVISOR && currentUserId ? listSitesBySupervisor(currentUserId) : listSites(),
          listSupervisorUsers(),
        ]);

        if (cancelled) {
          return;
        }

        if (siteResult.status === 'fulfilled') {
          setSites(siteResult.value);
        } else {
          throw siteResult.reason;
        }

        if (supervisorResult.status === 'fulfilled') {
          setUsers(supervisorResult.value);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data site.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSites();

    return () => {
      cancelled = true;
    };
  }, [currentRole, currentUserId, setUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sites]);

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.picName.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
    );
  }, [sites, search]);

  const totalResults = filteredSites.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE));
  const pageClamped = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => paginationRange(pageClamped, totalPages), [pageClamped, totalPages]);

  useEffect(() => {
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pageRows: SiteRecord[] = useMemo(() => {
    const start = (pageClamped - 1) * RESULTS_PER_PAGE;
    return filteredSites.slice(start, start + RESULTS_PER_PAGE);
  }, [filteredSites, pageClamped]);

  const paginationFooter = (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs" style={{ color: COLORS.textSecondary }}>
        Menampilkan {totalResults === 0 ? 0 : (pageClamped - 1) * RESULTS_PER_PAGE + 1} sampai{' '}
        {Math.min(pageClamped * RESULTS_PER_PAGE, totalResults)} dari {totalResults} hasil
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={pageClamped === 1}
          style={{ color: COLORS.textSecondary }}
        >
          ←
        </Button>
        {pageItems.map((item, idx) =>
          item === 'dots' ? (
            <span key={`dots-${idx}`} className="px-2 py-1.5 text-xs" style={{ color: COLORS.textSecondary }}>
              ...
            </span>
          ) : (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(item)}
              style={{
                backgroundColor: pageClamped === item ? COLORS.primary : undefined,
                color: pageClamped === item ? COLORS.white : COLORS.textPrimary,
              }}
            >
              {item}
            </Button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={pageClamped === totalPages}
          style={{ color: COLORS.textSecondary }}
        >
          →
        </Button>
      </div>
    </div>
  );

  const handleCreateSubmit = async (payload: CreateSitePayload) => {
    setIsCreating(true);
    try {
      const supervisorId = Number(payload.picValue);
      if (!Number.isFinite(supervisorId)) {
        throw new Error('Supervisor site tidak valid.');
      }

      await createSite({
        address:
          payload.location.trim() || [payload.city.trim(), payload.province.trim()].filter(Boolean).join(', '),
        city: payload.city.trim(),
        province: payload.province.trim(),
        sitename: payload.siteName,
        supervisor_id: supervisorId,
      });

      const refreshedSites = currentRole === EUserRole.SUPERVISOR && currentUserId
        ? await listSitesBySupervisor(currentUserId)
        : await listSites();

      setSites(refreshedSites);
      setSearch('');
      setCreateOpen(false);
      setError(undefined);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data site.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectSite = (site: SiteRecord) => {
    if (currentRole !== EUserRole.ADMIN) return;

    setSelectedSite({ id: site.id, name: site.name });
    navigate('/site-dashboard');
  };

  const canViewDashboard = currentRole === EUserRole.ADMIN;
  return (
    <div className="flex flex-col">
      <PageHeader title="Manajemen Site" />

      <div className="flex flex-col p-10" style={{ backgroundColor: COLORS.backgroundGray }}>
        <div className="mb-8  flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              Manajemen Site
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed" style={{ color: COLORS.textSecondary }}>
              Pengelolaan master data untuk tiap site CNGR yang berlokasi di Indonesia
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            className="min-h-11 shrink-0 self-stretch sm:self-center sm:px-8"
            leftIcon={<PlusIcon />}
            onClick={() => setCreateOpen(true)}
            disabled={isLoading || isCreating}
          >
            Tambah Site
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <SearchInput
              visualVariant="toolbar"
              placeholder="Search site by site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 w-full shrink-0 sm:w-auto sm:min-w-[7.5rem]"
              leftIcon={<FilterLinesIcon />}
              onClick={() => {}}
              disabled={isLoading}
            >
              Filters
            </Button>
          </div>
        </div>

        {error ? (
          <div
            className="flex min-h-40 items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm"
            style={{ borderColor: COLORS.border }}
          >
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              {error}
            </p>
          </div>
        ) : isLoading ? (
          <div
            className="flex min-h-40 items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm"
            style={{ borderColor: COLORS.border }}
          >
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Memuat data site...
            </p>
          </div>
        ) : pageRows.length === 0 ? (
          <div
            className="flex min-h-40 items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm"
            style={{ borderColor: COLORS.border }}
          >
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Tidak ada site yang cocok dengan pencarianmu.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pageRows.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  canViewDashboard={canViewDashboard}
                  onViewDashboard={handleSelectSite}
                />
              ))}
            </div>
            <div className="mt-8">{paginationFooter}</div>
          </>
        )}
      </div>

      <CreateSiteModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
        supervisors={users.filter((user) => user.role === EUserRole.SUPERVISOR && !pageRows.some((site) => site.supervisorId === user.id))}
      />
    </div>
  );
}
