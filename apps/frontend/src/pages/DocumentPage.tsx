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
  deleteDocument,
  downloadDocument,
  listDocuments,
  listDocumentsBySite,
  type DocumentEditState,
  type DocumentRecord,
} from '../lib/cngr-api';
import { useSite } from '../lib/site-context';

type DocumentRow = {
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

const DOCUMENT_TABLE_COLUMNS: DataTableColumnDef<DocumentRow>[] = [
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

function toDocumentRow(document: DocumentRecord): DocumentRow {
  return {
    id: document.id,
    title: document.title,
    description: document.description ?? '',
    uploadTime: document.uploadTime,
    uploader: document.uploader,
    uploaderAvatar: document.uploaderAvatar,
    fileUrl: document.fileUrl,
  };
}

export default function DocumentPage() {
  const navigate = useNavigate();
  const { selectedSite } = useSite();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const hasSelectedSite = selectedSite != null;

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setIsLoading(true);
      setError(undefined);

      try {
        if (hasSelectedSite && selectedSite.id) {
          const documents = await listDocumentsBySite(selectedSite.id);
          if (cancelled) {
            return;
          }
          setRows(documents.map(toDocumentRow));
        } else {
          const result = await listDocuments(1, 1000);
          if (cancelled) {
            return;
          }
          setRows(result.items.map(toDocumentRow));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data dokumen.');
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [hasSelectedSite, selectedSite?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSite?.id]);

  const filteredDocuments = useMemo(() => {
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

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / RESULTS_PER_PAGE));
  const pageClamped = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => paginationRange(pageClamped, totalPages), [pageClamped, totalPages]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (pageClamped - 1) * RESULTS_PER_PAGE;
    return filteredDocuments.slice(start, start + RESULTS_PER_PAGE);
  }, [filteredDocuments, pageClamped]);

  const emptyMessage = useMemo(() => {
    if (search.trim()) {
      return 'Tidak ada dokumen yang cocok dengan pencarianmu.';
    }
    return 'Belum ada data dokumen.';
  }, [search]);

  const onConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteDocument(deleteTarget.id);
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus dokumen.');
    } finally {
      setIsDeleting(false);
    }
  };

  const paginationFooter = (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs" style={{ color: COLORS.textSecondary }}>
        Menampilkan {filteredDocuments.length === 0 ? 0 : (pageClamped - 1) * RESULTS_PER_PAGE + 1} sampai{' '}
        {Math.min(pageClamped * RESULTS_PER_PAGE, filteredDocuments.length)} dari {filteredDocuments.length} hasil
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
              Dokumen
            </h1>
            <p className="mt-1 text-xs" style={{ color: COLORS.textSecondary }}>
              Monitoring Dokumen dan Manajemen Data Dokumen
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={() => navigate('/document/upload')}
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
            Menampilkan semua dokumen. Pilih site untuk melihat dokumen per site atau menambah data baru.
          </div>
        ) : null}

        <div className="mb-8">
          <SearchFilterBar
            placeholder="Cari judul, deskripsi, atau pengunggah"
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
            Memuat data dokumen...
          </div>
        ) : (
          <DataTable
            columns={DOCUMENT_TABLE_COLUMNS}
            data={pageRows}
            getRowId={(row) => row.id}
            minWidth={720}
            footer={paginationFooter}
            emptyMessage={emptyMessage}
            onRowAction={(action, row) => {
              if (action === 'edit') {
                const editState: DocumentEditState = {
                  title: row.title,
                  description: row.description,
                };
                navigate(`/document/edit/${row.id}`, { state: editState });
              }
              if (action === 'delete') {
                setDeleteError(undefined);
                setDeleteTarget(row);
              }
              if (action === 'download') {
                void downloadDocument(row.id, row.title).catch((err) => {
                  setError(err instanceof Error ? err.message : 'Gagal mengunduh dokumen.');
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
        title="Hapus Dokumen"
        description={
          deleteTarget ? (
            <>
              Apakah anda yakin untuk menghapus dokumen{' '}
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
