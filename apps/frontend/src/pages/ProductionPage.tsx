import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { Button, DataTable, type DataTableColumnDef, SearchFilterBar } from '../components/ui';
import { COLORS } from '../constants/colors';

type ProductionRow = {
  id: string;
  date: string;
  site: string;
  realization: number;
  target: number;
  efficiency: string;
  status: string;
};

const DEFAULT_USER = { name: 'Ghifary Modeong', role: 'admin' } as const;

const DUMMY_ROWS: ProductionRow[] = [
  { id: 'prod-1', date: '14 April 2026', site: 'Morowali', realization: 6500, target: 13000, efficiency: '50%', status: 'Warn' },
  { id: 'prod-2', date: '14 April 2026', site: 'Weda Bay', realization: 5000, target: 5000, efficiency: '100%', status: 'Good' },
  { id: 'prod-3', date: '14 April 2026', site: 'Morowali Utara', realization: 2000, target: 6000, efficiency: '40%', status: 'Danger' },
];

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

const TABLE_COLUMNS: DataTableColumnDef<ProductionRow>[] = [
  { id: 'date', header: 'Date', kind: 'text', accessorKey: 'date', sortable: true },
  { id: 'site', header: 'Site', kind: 'text', accessorKey: 'site', sortable: true },
  { id: 'realization', header: 'Realisasi', kind: 'text', accessorKey: 'realization', sortable: true },
  { id: 'target', header: 'Target', kind: 'text', accessorKey: 'target', sortable: true },
  {
    id: 'efficiency',
    header: 'Efficiency',
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

export default function ProductionPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return DUMMY_ROWS;
    return DUMMY_ROWS.filter(
      (row) =>
        row.site.toLowerCase().includes(keyword) ||
        row.date.toLowerCase().includes(keyword) ||
        row.status.toLowerCase().includes(keyword)
    );
  }, [search]);

  return (
    <div className="flex flex-col">
      <PageHeader title="Production Operational" user={DEFAULT_USER} />

      <div className="flex flex-col p-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              Production Operational
            </h1>
            <p className="mt-1 text-xs" style={{ color: COLORS.textSecondary }}>
              Pengelolaan Production untuk setiap site, data realisasi dan target yang ingin dicapai dapat diinput disini
            </p>
          </div>
          <Button type="button" size="sm" leftIcon={<PlusIcon />} onClick={() => navigate('/production/add')}>
            Tambah Production
          </Button>
        </div>

        <div className="mb-8">
          <SearchFilterBar
            placeholder="Search site by site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            filterLabel="Filters"
          />
        </div>

        <DataTable
          columns={TABLE_COLUMNS}
          data={filteredRows}
          getRowId={(row) => row.id}
          minWidth={900}
          onRowAction={() => {
            // Placeholder for edit/delete integration.
          }}
        />
      </div>
    </div>
  );
}
