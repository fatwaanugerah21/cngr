import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { Button, DataTable, type DataTableColumnDef, SearchFilterBar } from '../components/ui';
import { COLORS } from '../constants/colors';

type RuleRow = {
  id: string;
  title: string;
  uploadTime: string;
  uploader: string;
  /** Optional profile image URL; when omitted or empty, the table shows an initial fallback. */
  uploaderAvatar?: string;
};

const DUMMY_RULES: RuleRow[] = [
  { id: '1', title: 'Peraturan Menteri ESDM No. 7 Tahun 2020', uploadTime: '25 Februari 2025 – 09.18', uploader: 'Sera Putri', uploaderAvatar: 'https://i.pravatar.cc/40?img=1' },
  { id: '2', title: 'Peraturan Daerah tentang Pengelolaan Lingkungan', uploadTime: '24 Februari 2025 – 14.30', uploader: 'Ahmad Rizki', uploaderAvatar: 'https://i.pravatar.cc/40?img=12' },
  { id: '3', title: 'Keputusan Direktur K3 Tambang', uploadTime: '23 Februari 2025 – 10.45', uploader: 'Dewi Sartika', uploaderAvatar: 'https://i.pravatar.cc/40?img=5' },
  { id: '4', title: 'Pedoman Teknis Revegetasi Pasca Tambang', uploadTime: '22 Februari 2025 – 16.15', uploader: 'Budi Santoso', uploaderAvatar: 'https://i.pravatar.cc/40?img=14' },
  { id: '5', title: 'Peraturan Internal Keselamatan Operasional', uploadTime: '21 Februari 2025 – 08.00', uploader: 'Maria Ulfa', uploaderAvatar: 'https://i.pravatar.cc/40?img=9' },
  { id: '6', title: 'SOP Pelaporan Lingkungan Triwulanan', uploadTime: '20 Februari 2025 – 11.20', uploader: 'Fajar Nugroho', uploaderAvatar: 'https://i.pravatar.cc/40?img=11' },
  { id: '7', title: 'Peraturan Bersama CSR dan Komunitas', uploadTime: '19 Februari 2025 – 15.45', uploader: 'Siti Aminah', uploaderAvatar: 'https://i.pravatar.cc/40?img=16' },
  { id: '8', title: 'Kebijakan Anti Suap dan Gratifikasi', uploadTime: '18 Februari 2025 – 09.30', uploader: 'Rizky Pratama', uploaderAvatar: 'https://i.pravatar.cc/40?img=3' },
  { id: '9', title: 'Peraturan Pengadaan Barang dan Jasa', uploadTime: '17 Februari 2025 – 13.00', uploader: 'Ani Wijaya', uploaderAvatar: 'https://i.pravatar.cc/40?img=20' },
  { id: '10', title: 'Panduan Kepatuhan AMDAL', uploadTime: '16 Februari 2025 – 17.30', uploader: 'Eko Prasetyo', uploaderAvatar: 'https://i.pravatar.cc/40?img=8' },
];

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

export default function RulePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalResults = 156;
  const resultsPerPage = 10;

  const filteredRules = DUMMY_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.uploader.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const paginationFooter = (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs" style={{ color: COLORS.textSecondary }}>
        Menampilkan {(currentPage - 1) * resultsPerPage + 1} sampai{' '}
        {Math.min(currentPage * resultsPerPage, totalResults)} dari {totalResults} hasil
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ color: COLORS.textSecondary }}
        >
          ←
        </Button>
        {[1, 2, 3].map((p) => (
          <Button
            key={p}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(p)}
            style={{
              backgroundColor: currentPage === p ? COLORS.primary : undefined,
              color: currentPage === p ? COLORS.white : COLORS.textPrimary,
            }}
          >
            {p}
          </Button>
        ))}
        <span className="px-2 py-1.5 text-xs" style={{ color: COLORS.textSecondary }}>
          ...
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          style={{ color: COLORS.textPrimary }}
        >
          {totalPages}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{ color: COLORS.textSecondary }}
        >
          →
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Data Peraturan"
        user={{ name: 'Ghifary Modeong', role: 'Administrator' }}
      />

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
          <Button type="button" size="sm" leftIcon={<PlusIcon />} onClick={() => navigate('/peraturan/upload')}>
            Tambah Data
          </Button>
        </div>

        <div className="mb-8">
          <SearchFilterBar
            placeholder="Cari berdasarkan judul atau pengunggah"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={RULE_TABLE_COLUMNS}
          data={filteredRules}
          getRowId={(row) => row.id}
          minWidth={720}
          footer={paginationFooter}
          onRowAction={(action, row) => {
            if (action === 'edit') navigate(`/peraturan/edit/${row.id}`);
          }}
        />
      </div>
    </div>
  );
}
