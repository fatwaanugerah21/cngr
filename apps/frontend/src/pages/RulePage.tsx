import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SitePageHeader from '../components/layout/SitePageHeader';
import {
  Button,
  ConfirmationModalComponent,
  DataTable,
  type DataTableColumnDef,
  SearchFilterBar,
} from '../components/ui';
import { COLORS } from '../constants/colors';
import {
  deleteRegulation,
  downloadRegulation,
  listRegulations,
  listRegulationsBySite,
  type RegulationEditState,
  type RegulationRecord,
} from '../lib/cngr-api';
import { useSite } from '../lib/site-context';

type RuleRow = {
  id: string;
  title: string;
  uploadTime: string;
  uploader: string;
  uploaderAvatar?: string;
  fileUrl?: string;
};

const RESULTS_PER_PAGE = 10;

function paginationRange(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'dots', total];
  }
  if (current >= total - 3) {
    return [1, 'dots', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, 'dots', current - 1, current, current + 1, 'dots', total];
}

const RULE_TABLE_COLUMNS: DataTableColumnDef<RuleRow>[] = [
  {
    id: 'title',
    header: 'Judul Peraturan',
    kind: 'title',
    accessorKey: 'title',
    sortable: true,
  },
  {
    id: 'uploadTime',
    header: 'Waktu Upload',
    kind: 'text',
    accessorKey: 'uploadTime',
    tone: 'secondary',
    sortable: true,
  },
  {
    id: 'uploader',
    header: 'Diunggah oleh',
    kind: 'person',
    accessorKey: 'uploader',
    avatarKey: 'uploaderAvatar',
    sortable: true,
  },
  {
    id: 'actions',
    header: 'Aksi',
    kind: 'actions',
    actions: ['edit', 'delete', 'download'],
  },
];

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 3.5V14.5M3.5 9H14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function toRuleRow(regulation: RegulationRecord): RuleRow {
  return {
    id: regulation.id,
    title: regulation.title,
    uploadTime: regulation.uploadTime,
    uploader: regulation.uploader,
    uploaderAvatar: regulation.uploaderAvatar,
    fileUrl: regulation.fileUrl,
  };
}

export default function RulePage() {
  const navigate = useNavigate();
  const { selectedSite } = useSite();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<RuleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RuleRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const hasSelectedSite = selectedSite != null;

  useEffect(() => {
    let cancelled = false;

    async function loadRegulations() {
      setIsLoading(true);
      setError(undefined);

      try {
        if (hasSelectedSite && selectedSite.id) {
          const regulations = await listRegulationsBySite(selectedSite.id);
          if (cancelled) {
            return;
          }
          setRows(regulations.map(toRuleRow));
        } else {
          const result = await listRegulations(1, 1000);
          if (cancelled) {
            return;
          }
          setRows(result.items.map(toRuleRow));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data peraturan.');
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRegulations();

    return () => {
      cancelled = true;
    };
  }, [hasSelectedSite, selectedSite?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSite?.id]);

  const filteredRules = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(keyword) || row.uploader.toLowerCase().includes(keyword)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRules.length / RESULTS_PER_PAGE));
  const pageClamped = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => paginationRange(pageClamped, totalPages), [pageClamped, totalPages]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (pageClamped - 1) * RESULTS_PER_PAGE;
    return filteredRules.slice(start, start + RESULTS_PER_PAGE);
  }, [filteredRules, pageClamped]);

  const emptyMessage = useMemo(() => {
    if (search.trim()) {
      return 'Tidak ada peraturan yang cocok dengan pencarianmu.';
    }
    return 'Belum ada data peraturan.';
  }, [search]);

  const onConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteRegulation(deleteTarget.id);
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus peraturan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const paginationFooter = (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs" style={{ color: COLORS.textSecondary }}>
        Menampilkan {filteredRules.length === 0 ? 0 : (pageClamped - 1) * RESULTS_PER_PAGE + 1} sampai{' '}
        {Math.min(pageClamped * RESULTS_PER_PAGE, filteredRules.length)} dari {filteredRules.length} hasil
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={pageClamped === 1}
          style={{ color: COLORS.textSecondary }}
        >
          ←
        </Button>
        {pageItems.map((item, index) =>
          item === 'dots' ? (
            <span key={`dots-${index}`} className="px-2 py-1.5 text-xs" style={{ color: COLORS.textSecondary }}>
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
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={pageClamped === totalPages}
          style={{ color: COLORS.textSecondary }}
        >
          →
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <SitePageHeader />

      <div className="flex flex-col p-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              Peraturan
            </h1>
            <p className="mt-1 text-xs" style={{ color: COLORS.textSecondary }}>
              Monitoring Peraturan dan Manajemen Data Peraturan
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={() => navigate('/rules/upload')}
            disabled={!hasSelectedSite || isLoading}
          >
            Tambah Data
          </Button>
        </div>

        {!hasSelectedSite ? (
          <div
            className="mb-8 rounded-lg border bg-white p-6 text-sm shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            Menampilkan semua peraturan. Pilih site untuk melihat peraturan per site atau menambah data baru.
          </div>
        ) : null}

        <div className="mb-8">
          <SearchFilterBar
            placeholder="Cari berdasarkan judul atau pengunggah"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error ? (
          <div
            className="rounded-lg border bg-white p-6 text-sm shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            {error}
          </div>
        ) : isLoading ? (
          <div
            className="rounded-lg border bg-white p-6 text-sm shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            Memuat data peraturan...
          </div>
        ) : (
          <DataTable
            columns={RULE_TABLE_COLUMNS}
            data={pageRows}
            getRowId={(row) => row.id}
            minWidth={720}
            footer={paginationFooter}
            emptyMessage={emptyMessage}
            onRowAction={(action, row) => {
              if (action === 'edit') {
                const editState: RegulationEditState = {
                  title: row.title,
                };
                navigate(`/rules/edit/${row.id}`, { state: editState });
              }
              if (action === 'delete') {
                setDeleteError(undefined);
                setDeleteTarget(row);
              }
              if (action === 'download') {
                void downloadRegulation(row.id, row.title).catch((err) => {
                  setError(err instanceof Error ? err.message : 'Gagal mengunduh peraturan.');
                });
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
        title="Hapus Peraturan"
        description={
          deleteTarget ? (
            <>
              Apakah anda yakin untuk menghapus peraturan{' '}
              <span style={{ color: '#2563EB', textDecoration: 'underline', fontWeight: 600 }}>
                {deleteTarget.title}
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
        confirmLabel={isDeleting ? 'Menghapus…' : 'Hapus Data'}
        cancelLabel="Kembali"
        confirmDisabled={isDeleting}
        closeOnConfirm={false}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  );
}
