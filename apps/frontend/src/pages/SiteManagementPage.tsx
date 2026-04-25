import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import CreateSiteModal, { type CreateSitePayload } from '../components/site-management/CreateSiteModal';
import { Button, DataTable, type DataTableColumnDef, SearchFilterBar } from '../components/ui';
import { COLORS } from '../constants/colors';
import { SITE_PIC_OPTIONS, sitePicLabelByValue } from '../data/site-pic-options';
import { buildDummySites, type SiteRecord } from '../data/sites-dummy';

type SiteRow = SiteRecord & Record<string, unknown>;

const SITE_TABLE_COLUMNS: DataTableColumnDef<SiteRow>[] = [
  {
    id: 'name',
    header: 'Nama Site',
    kind: 'text',
    accessorKey: 'name',
    fontWeight: 'semibold',
    sortable: true,
  },
  {
    id: 'pic',
    header: 'PIC Site',
    kind: 'person',
    accessorKey: 'picName',
    avatarKey: 'picAvatar',
    sortable: true,
  },
  {
    id: 'province',
    header: 'Province',
    kind: 'text',
    accessorKey: 'province',
    sortable: true,
  },
  {
    id: 'location',
    header: 'Location',
    kind: 'text',
    accessorKey: 'location',
    tone: 'secondary',
    sortable: true,
  },
  {
    id: 'status',
    header: 'Status',
    kind: 'badge',
    accessorKey: 'status',
    sortable: true,
  },
  {
    id: 'actions',
    header: 'Action',
    kind: 'actions',
    actions: ['edit', 'delete'],
  },
];

const DEFAULT_USER = { name: 'Ghifary Modeong', role: 'admin' } as const;

const RESULTS_PER_PAGE = 10;

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

function buildLocationLine(payload: CreateSitePayload): string {
  if (payload.location.trim()) return payload.location.trim();
  const parts = [payload.city.trim(), payload.province.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export default function SiteManagementPage() {
  const [sites, setSites] = useState<SiteRecord[]>(() => buildDummySites(156));
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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

  const pageRows: SiteRow[] = useMemo(() => {
    const start = (pageClamped - 1) * RESULTS_PER_PAGE;
    return filteredSites.slice(start, start + RESULTS_PER_PAGE) as SiteRow[];
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

  const handleCreateSubmit = (payload: CreateSitePayload) => {
    const picName = sitePicLabelByValue(payload.picValue);
    const newSite: SiteRecord = {
      id: `site-new-${Date.now()}`,
      name: payload.siteName,
      picName,
      province: payload.province.trim() || '—',
      location: buildLocationLine(payload),
      status: 'active',
    };
    setSites((prev) => [newSite, ...prev]);
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="Manajemen Site" user={DEFAULT_USER} />

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
          >
            Tambah Site
          </Button>
        </div>

        <div className="mb-8">
          <SearchFilterBar
            placeholder="Cari site berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            filterLabel="Filter"
            onFilterClick={() => { }}
          />
        </div>

        <DataTable
          columns={SITE_TABLE_COLUMNS}
          data={pageRows}
          getRowId={(row) => row.id}
          minWidth={960}
          footer={paginationFooter}
          onRowAction={(action, row) => {
            if (action === 'delete') {
              if (window.confirm(`Hapus site "${row.name}" dari daftar?`)) {
                setSites((prev) => prev.filter((s) => s.id !== row.id));
              }
              return;
            }
            if (action === 'edit') {
              /* Placeholder until edit flow / API exists */
            }
          }}
        />
      </div>

      <CreateSiteModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
        picOptions={SITE_PIC_OPTIONS}
      />
    </div>
  );
}
