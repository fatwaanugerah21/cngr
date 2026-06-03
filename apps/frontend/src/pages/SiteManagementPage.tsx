import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import CreateSiteModal, { type CreateSitePayload } from '../components/site-management/CreateSiteModal';
import { Button, ConfirmationModalComponent, SearchInput } from '../components/ui';
import SiteCardGridSkeleton from '../components/site-management/SiteCardGridSkeleton';
import { useTableLoading } from '../lib/use-table-loading';
import DeleteRowIcon from '../icons/delete-row.icon';
import PencilIcon from '../icons/pencil.icon';
import { COLORS } from '../constants/colors';
import { type SiteRecord } from '../data/sites-dummy';
import { EUserRole, hasAdminAccess } from '../lib/navigation-session';
import { useSite } from '../lib/site-context';
import {
  createSite,
  deleteSite,
  listSites,
  listSitesBySupervisor,
  listSupervisorUsers,
  updateSite,
  type UserManagementRecord,
} from '../lib/cngr-api';
import { useAuth } from '../lib/auth-context';

const RESULTS_PER_PAGE = 9;

function toSiteApiPayload(payload: CreateSitePayload) {
  const supervisorId = Number(payload.picValue);
  if (!Number.isFinite(supervisorId)) {
    throw new Error('Supervisor site tidak valid.');
  }

  return {
    address:
      payload.location.trim() || [payload.city.trim(), payload.province.trim()].filter(Boolean).join(', '),
    city: payload.city.trim(),
    province: payload.province.trim(),
    sitename: payload.siteName,
    supervisor_id: supervisorId,
  };
}

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

function SiteCardAction({
  label,
  ariaLabel,
  icon,
  tone,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  icon: ReactNode;
  tone: 'edit' | 'delete';
  onClick: () => void;
}) {
  const isEdit = tone === 'edit';
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
      className={`group flex h-9 flex-1 items-center justify-center gap-1.5 px-3 text-[11px] font-semibold transition-all duration-200 sm:min-w-[4.75rem] ${
        isEdit
          ? 'text-[#2563EB] hover:bg-[#EFF6FF] active:bg-[#DBEAFE]'
          : 'text-[#DC2626] hover:bg-[#FEF2F2] active:bg-[#FEE2E2]'
      }`}
    >
      <span
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
          isEdit
            ? 'bg-[#DBEAFE] group-hover:bg-[#BFDBFE]'
            : 'bg-[#FEE2E2] group-hover:bg-[#FECACA]'
        }`}
      >
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SiteCard({
  site,
  canViewDashboard,
  canManageSite,
  onViewDashboard,
  onEdit,
  onDelete,
}: {
  site: SiteRecord;
  canViewDashboard: boolean;
  canManageSite: boolean;
  onViewDashboard: (site: SiteRecord) => void;
  onEdit: (site: SiteRecord) => void;
  onDelete: (site: SiteRecord) => void;
}) {
  return (
    <div
      className="flex min-h-[172px] flex-col rounded-2xl border bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{ borderColor: COLORS.border }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="pt-0.5" style={{ color: COLORS.sidebarBg }}>
          <SiteNodeIcon />
        </div>

        <div className="flex flex-col items-end gap-2">
          {canManageSite ? (
            <div
              className="inline-flex overflow-hidden rounded-full border shadow-sm"
              style={{
                borderColor: COLORS.border,
                backgroundColor: COLORS.white,
                boxShadow: '0 1px 2px color-mix(in srgb, #0a1628 6%, transparent)',
              }}
            >
              <SiteCardAction
                label="Ubah"
                ariaLabel="Ubah site"
                tone="edit"
                onClick={() => onEdit(site)}
                icon={<PencilIcon className="h-3.5 w-3.5" fill="#2563EB" />}
              />
              <span className="my-1.5 w-px self-stretch bg-[#E5E7EB]" aria-hidden />
              <SiteCardAction
                label="Hapus"
                ariaLabel="Hapus site"
                tone="delete"
                onClick={() => onDelete(site)}
                icon={<DeleteRowIcon className="h-3.5 w-3.5" fill="#DC2626" />}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-sm font-bold leading-snug" style={{ color: COLORS.textPrimary }}>
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
  const [editSite, setEditSite] = useState<SiteRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SiteRecord | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [supervisors, setSupervisors] = useState<UserManagementRecord[]>([]);
  const { selectedSite, setSelectedSite, clearSelectedSite } = useSite();
  const { user: currentUser } = useAuth();
  const currentRole = currentUser?.role ?? EUserRole.ADMIN;
  const currentUserId = currentUser?.id;
  const siteLoadKey = `${currentRole}-${currentUserId ?? ''}`;
  const { showSkeleton, startLoad, finishLoad } = useTableLoading(siteLoadKey);

  useEffect(() => {
    if (currentRole === EUserRole.SUPERVISOR) {
      navigate('/site-dashboard', { replace: true });
    }
  }, [currentRole, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadSites() {
      startLoad();
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
          setSupervisors(supervisorResult.value);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data site.');
        }
      } finally {
        if (!cancelled) {
          finishLoad(siteLoadKey);
        }
      }
    }

    loadSites();

    return () => {
      cancelled = true;
    };
  }, [currentRole, currentUserId, finishLoad, siteLoadKey, startLoad]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sites]);

  const assignedSupervisorIds = useMemo(
    () => new Set(sites.map((site) => site.supervisorId.trim()).filter((id) => id !== '')),
    [sites]
  );

  const availableSupervisors = useMemo(
    () => supervisors.filter((supervisor) => !assignedSupervisorIds.has(supervisor.id)),
    [assignedSupervisorIds, supervisors]
  );

  const editSupervisors = useMemo(() => {
    if (!editSite) {
      return availableSupervisors;
    }

    const currentSupervisorId = editSite.supervisorId.trim();
    return supervisors.filter(
      (supervisor) =>
        !assignedSupervisorIds.has(supervisor.id) || supervisor.id === currentSupervisorId
    );
  }, [assignedSupervisorIds, availableSupervisors, editSite, supervisors]);

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

  const refreshSites = async () => {
    const [refreshedSites, refreshedSupervisors] = await Promise.all([
      currentRole === EUserRole.SUPERVISOR && currentUserId
        ? listSitesBySupervisor(currentUserId)
        : listSites(),
      listSupervisorUsers(),
    ]);

    setSites(refreshedSites);
    setSupervisors(refreshedSupervisors);
    return refreshedSites;
  };

  const handleCreateSubmit = async (payload: CreateSitePayload) => {
    setIsCreating(true);
    try {
      await createSite(toSiteApiPayload(payload));
      await refreshSites();
      setSearch('');
      setCreateOpen(false);
      setError(undefined);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data site.');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (payload: CreateSitePayload) => {
    if (!editSite) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateSite(editSite.id, toSiteApiPayload(payload));
      const refreshedSites = await refreshSites();
      const updatedSite = refreshedSites.find((site) => site.id === editSite.id);
      if (updatedSite && selectedSite?.id === editSite.id) {
        setSelectedSite({ id: updatedSite.id, name: updatedSite.name });
      }
      setEditSite(null);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui data site.');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);

    try {
      await deleteSite(deleteTarget.id);
      if (selectedSite?.id === deleteTarget.id) {
        clearSelectedSite();
      }
      await refreshSites();
      setDeleteTarget(null);
      setError(undefined);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus site.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectSite = (site: SiteRecord) => {
    if (!hasAdminAccess(currentRole)) return;

    setSelectedSite({ id: site.id, name: site.name });
    navigate('/site-dashboard');
  };

  const canViewDashboard = hasAdminAccess(currentRole);
  const canManageSite = hasAdminAccess(currentRole);

  return (
    <div className="flex flex-col">
      <PageHeader title="Manajemen Site" />

      <div className="flex flex-col p-10">
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
            disabled={showSkeleton || isCreating || isUpdating}
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
              disabled={showSkeleton}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 w-full shrink-0 sm:w-auto sm:min-w-[7.5rem]"
              leftIcon={<FilterLinesIcon />}
              onClick={() => {}}
              disabled={showSkeleton}
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
        ) : showSkeleton ? (
          <SiteCardGridSkeleton loadingLabel="Memuat data site…" />
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
                  canManageSite={canManageSite}
                  onViewDashboard={handleSelectSite}
                  onEdit={(target) => {
                    setError(undefined);
                    setEditSite(target);
                  }}
                  onDelete={(target) => {
                    setDeleteError(undefined);
                    setDeleteTarget(target);
                  }}
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
        supervisors={availableSupervisors}
        mode="create"
      />

      <CreateSiteModal
        open={editSite != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditSite(null);
          }
        }}
        onSubmit={handleEditSubmit}
        supervisors={editSupervisors}
        mode="edit"
        site={editSite ?? undefined}
      />

      <ConfirmationModalComponent
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(undefined);
          }
        }}
        title="Hapus Site"
        description={
          deleteTarget ? (
            <>
              Apakah anda yakin untuk menghapus site{' '}
              <span style={{ color: '#2563EB', textDecoration: 'underline', fontWeight: 600 }}>
                {deleteTarget.name}
              </span>
              ?
              {deleteError ? (
                <span className="mt-2 block text-sm" style={{ color: COLORS.primary }}>
                  {deleteError}
                </span>
              ) : null}
            </>
          ) : null
        }
        confirmLabel={isDeleting ? 'Menghapus…' : 'Hapus Site'}
        cancelLabel="Kembali"
        confirmDisabled={isDeleting}
        closeOnConfirm={false}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  );
}
