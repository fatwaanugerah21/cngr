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
import { useTableLoading } from '../lib/use-table-loading';
import { COLORS } from '../constants/colors';
import {
  deleteReport,
  downloadReport,
  listReports,
  listReportsBySite,
  type ReportEditState,
  type ReportRecord,
} from '../lib/cngr-api';
import { useSite } from '../lib/site-context';

type ReportRow = {
  id: string;
  title: string;
  description: string;
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

const REPORT_TABLE_COLUMNS: DataTableColumnDef<ReportRow>[] = [
  {
    id: 'title',
    header: 'Judul & Deskripsi',
    kind: 'title',
    accessorKey: 'title',
    subtitleKey: 'description',
    maxWidth: 220,
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

function toReportRow(report: ReportRecord): ReportRow {
  return {
    id: report.id,
    title: report.title,
    description: report.description ?? '',
    uploadTime: report.uploadTime,
    uploader: report.uploader,
    uploaderAvatar: report.uploaderAvatar,
    fileUrl: report.fileUrl,
  };
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { selectedSite } = useSite();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [error, setError] = useState<string | undefined>();
  const reportLoadKey = selectedSite?.id ?? 'all';
  const { showSkeleton, startLoad, finishLoad } = useTableLoading(reportLoadKey);
  const [deleteTarget, setDeleteTarget] = useState<ReportRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const hasSelectedSite = selectedSite != null;

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      startLoad();
      setError(undefined);

      try {
        if (hasSelectedSite && selectedSite.id) {
          const reports = await listReportsBySite(selectedSite.id);
          if (cancelled) {
            return;
          }
          setRows(reports.map(toReportRow));
        } else {
          const result = await listReports(1, 1000);
          if (cancelled) {
            return;
          }
          setRows(result.items.map(toReportRow));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data laporan.');
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          finishLoad(reportLoadKey);
        }
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [finishLoad, hasSelectedSite, reportLoadKey, selectedSite?.id, startLoad]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSite?.id]);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(keyword) ||
        row.description.toLowerCase().includes(keyword) ||
        row.uploader.toLowerCase().includes(keyword)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / RESULTS_PER_PAGE));
  const pageClamped = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => paginationRange(pageClamped, totalPages), [pageClamped, totalPages]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (pageClamped - 1) * RESULTS_PER_PAGE;
    return filteredReports.slice(start, start + RESULTS_PER_PAGE);
  }, [filteredReports, pageClamped]);

  const emptyMessage = useMemo(() => {
    if (search.trim()) {
      return 'Tidak ada laporan yang cocok dengan pencarianmu.';
    }
    return 'Belum ada data laporan.';
  }, [search]);

  const onConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteReport(deleteTarget.id);
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus laporan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const paginationFooter = (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs" style={{ color: COLORS.textSecondary }}>
        Menampilkan {filteredReports.length === 0 ? 0 : (pageClamped - 1) * RESULTS_PER_PAGE + 1} sampai{' '}
        {Math.min(pageClamped * RESULTS_PER_PAGE, filteredReports.length)} dari {filteredReports.length} hasil
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
              Laporan
            </h1>
            <p className="mt-1 text-xs" style={{ color: COLORS.textSecondary }}>
              Monitoring Laporan dan Manajemen Data Laporan
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={() => navigate('/report/upload')}
            disabled={!hasSelectedSite || showSkeleton}
          >
            Tambah Data
          </Button>
        </div>

        {!hasSelectedSite ? (
          <div
            className="mb-8 rounded-lg border bg-white p-6 text-sm shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            Menampilkan semua laporan. Pilih site untuk melihat laporan per site atau menambah data baru.
          </div>
        ) : null}

        <div className="mb-8">
          <SearchFilterBar
            placeholder="Cari judul, deskripsi, atau pengunggah"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={showSkeleton}
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
          <DataTableSkeleton
            variant="document"
            loadingLabel="Memuat data laporan…"
            showPaginationFooter
          />
        ) : (
          <DataTable
            columns={REPORT_TABLE_COLUMNS}
            data={pageRows}
            getRowId={(row) => row.id}
            minWidth={720}
            footer={paginationFooter}
            emptyMessage={emptyMessage}
            onRowAction={(action, row) => {
              if (action === 'edit') {
                const editState: ReportEditState = {
                  title: row.title,
                  description: row.description,
                };
                navigate(`/report/edit/${row.id}`, { state: editState });
              }
              if (action === 'delete') {
                setDeleteError(undefined);
                setDeleteTarget(row);
              }
              if (action === 'download') {
                void downloadReport(row.id, row.title).catch((err) => {
                  setError(err instanceof Error ? err.message : 'Gagal mengunduh laporan.');
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
        title="Hapus Laporan"
        description={
          deleteTarget ? (
            <>
              Apakah anda yakin untuk menghapus laporan{' '}
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
