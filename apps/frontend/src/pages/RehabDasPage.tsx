import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SitePageHeader from '../components/layout/SitePageHeader';
import {
  Button,
  ConfirmationModalComponent,
  DataTable,
  DataTableSkeleton,
  type DataTableColumnDef,
  SearchFilterBar,
} from '../components/ui';
import { useSiteTableLoading } from '../lib/use-site-table-loading';
import { COLORS } from '../constants/colors';
import { useSite } from '../lib/site-context';
import {
  deleteRehabDas,
  listRehabDasBySite,
  type ProductionRecord,
  type RehabDasEditState,
} from '../lib/cngr-api';
import { sortRowsByTableDateDesc } from '../lib/formatters';
import { TREND_VIEW_UNIT_SUFFIX } from '../lib/site-dashboard-api';

type RehabDasRow = {
  id: string;
  date: string;
  site: string;
  realization: number;
  target: number;
  efficiency: string;
  status: string;
};

function efficiencyPercent(value: string): number {
  return Number(value.replace('%', '').trim()) || 0;
}

function efficiencyColor(percent: number): string {
  if (percent < 50) return '#DC2626';
  if (percent < 80) return '#D97706';
  return '#16A34A';
}

function statusPillStyle(status: string): { color: string; backgroundColor: string } {
  const normalized = status.toLowerCase();
  if (normalized === 'good') {
    return { color: '#16A34A', backgroundColor: 'color-mix(in srgb, #22C55E 14%, #FFFFFF)' };
  }
  if (normalized === 'warn' || normalized === 'warning') {
    return { color: '#D97706', backgroundColor: 'color-mix(in srgb, #F59E0B 18%, #FFFFFF)' };
  }
  return { color: '#DC2626', backgroundColor: 'color-mix(in srgb, #EF4444 14%, #FFFFFF)' };
}

const TABLE_COLUMNS: DataTableColumnDef<RehabDasRow>[] = [
  {
    id: 'date',
    header: 'Tanggal',
    kind: 'date',
    accessorKey: 'date',
    sortable: true,
  },
  {
    id: 'target',
    header: 'Target',
    kind: 'number',
    accessorKey: 'target',
    unitSuffix: TREND_VIEW_UNIT_SUFFIX['rehab-das'],
    sortable: true,
  },
  {
    id: 'realization',
    header: 'Realisasi',
    kind: 'number',
    accessorKey: 'realization',
    unitSuffix: TREND_VIEW_UNIT_SUFFIX['rehab-das'],
    sortable: true,
  },
  {
    id: 'efficiency',
    header: 'Efisiensi',
    kind: 'text',
    accessorKey: 'efficiency',
    sortable: true,
    render: (row) => {
      const percent = efficiencyPercent(row.efficiency);
      return (
        <span className="text-sm font-semibold" style={{ color: efficiencyColor(percent) }}>
          {row.efficiency}
        </span>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    kind: 'text',
    accessorKey: 'status',
    sortable: true,
    render: (row) => {
      const tone = statusPillStyle(row.status);
      return (
        <span className="inline-flex rounded-full px-4 py-1 text-xs font-semibold" style={tone}>
          {row.status}
        </span>
      );
    },
  },
  { id: 'actions', header: 'Action', kind: 'actions', actions: ['edit', 'delete'] },
];

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 3.5V14.5M3.5 9H14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function RehabDasPage() {
  const navigate = useNavigate();
  const { selectedSite } = useSite();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<RehabDasRow[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<RehabDasRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const { showSkeleton, startLoad, finishLoad, resetForNoSite } = useSiteTableLoading(selectedSite?.id);

  useEffect(() => {
    let cancelled = false;

    async function loadRehabDas() {
      if (!selectedSite?.id) {
        setRows([]);
        resetForNoSite();
        setError(undefined);
        return;
      }

      startLoad();
      setError(undefined);
      try {
        const rehabDas = await listRehabDasBySite(selectedSite.id);
        if (cancelled) return;

        setRows(
          rehabDas.map<RehabDasRow>((row: ProductionRecord) => ({
            id: row.id,
            date: row.date,
            site: row.site || selectedSite.name,
            realization: row.realization,
            target: row.target,
            efficiency: row.efficiency,
            status: row.status,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data rehab DAS.');
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          finishLoad(selectedSite.id);
        }
      }
    }

    loadRehabDas();

    return () => {
      cancelled = true;
    };
  }, [selectedSite?.id, selectedSite?.name, finishLoad, resetForNoSite, startLoad]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const source = rows;
    const filtered = !keyword
      ? source
      : source.filter(
          (row) =>
            row.site.toLowerCase().includes(keyword) ||
            row.date.toLowerCase().includes(keyword) ||
            row.status.toLowerCase().includes(keyword)
        );
    return sortRowsByTableDateDesc(filtered);
  }, [rows, search]);

  const onConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteRehabDas(deleteTarget.id);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus data rehab DAS.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasSelectedSite = selectedSite != null;

  return (
    <div className="flex flex-col">
      <SitePageHeader />

      <div className="flex flex-col p-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              Operasional Rehab DAS
            </h1>
            <p className="mt-1 text-xs" style={{ color: COLORS.textSecondary }}>
              Pengelolaan Rehab DAS untuk setiap site, data realisasi dan target yang ingin dicapai dapat diinput disini
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={() => navigate('/rehab-das/add')}
            disabled={!hasSelectedSite || showSkeleton}
          >
            Tambah Rehab DAS
          </Button>
        </div>

        {!hasSelectedSite ? (
          <div
            className="mb-8 rounded-lg border bg-white p-6 text-sm shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            Silakan pilih site terlebih dahulu dari menu Manajemen Site.
          </div>
        ) : null}

        <div className="mb-8">
          <SearchFilterBar
            placeholder="Search site by site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            filterLabel="Filters"
            disabled={!hasSelectedSite || showSkeleton}
          />
        </div>

        {error ? (
          <div
            className="rounded-lg border bg-white p-6 text-sm shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            {error}
          </div>
        ) : showSkeleton ? (
          <DataTableSkeleton loadingLabel="Memuat data rehab DAS…" />
        ) : (
          <DataTable
            columns={TABLE_COLUMNS}
            data={filteredRows}
            getRowId={(row) => row.id}
            minWidth={900}
            onRowAction={(action, row) => {
              if (action === 'delete') {
                setDeleteError(undefined);
                setDeleteTarget(row);
              }
              if (action === 'edit') {
                const editState: RehabDasEditState = {
                  date: row.date,
                  realization: row.realization,
                  target: row.target,
                };
                navigate(`/rehab-das/edit/${row.id}`, { state: editState });
              }
            }}
          />
        )}
      </div>

      <ConfirmationModalComponent
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(undefined);
          }
        }}
        title="Hapus Rehab DAS"
        description={
          deleteTarget ? (
            <>
              Apakah anda yakin untuk menghapus data rehab DAS{' '}
              <span style={{ color: '#2563EB', textDecoration: 'underline', fontWeight: 600 }}>{deleteTarget.site}</span>
              {deleteError ? (
                <span className="mt-2 block text-sm" style={{ color: COLORS.primary }}>
                  {deleteError}
                </span>
              ) : null}
            </>
          ) : null
        }
        confirmLabel={isDeleting ? 'Menghapus…' : 'Hapus Data'}
        cancelLabel="Kembali"
        confirmDisabled={isDeleting}
        closeOnConfirm={false}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  );
}
