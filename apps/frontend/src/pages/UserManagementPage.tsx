import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import {
  Button,
  ConfirmationModalComponent,
  DataTable,
  type DataTableColumnDef,
  SearchInput,
} from '../components/ui';
import { COLORS } from '../constants/colors';
import { listUsers, type UserManagementRecord } from '../lib/cngr-api';
import { useUserDirectory } from '../lib/user-directory-context';

type UserRow = {
  id: string;
  fullName: string;
  username: string;
  role: string;
  nik: string;
  avatarUrl?: string;
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

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 3.5V14.5M3.5 9H14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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

function normalizeUserRow(user: UserManagementRecord): UserRow {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username || '-',
    role: user.role || '-',
    nik: user.nik || '-',
    avatarUrl: user.avatarUrl,
  };
}

const USER_COLUMNS: DataTableColumnDef<UserRow>[] = [
  {
    id: 'fullName',
    header: 'Nama Lengkap',
    kind: 'person',
    accessorKey: 'fullName',
    avatarKey: 'avatarUrl',
    sortable: true,
  },
  {
    id: 'username',
    header: 'Username',
    kind: 'text',
    accessorKey: 'username',
    sortable: true,
  },
  {
    id: 'role',
    header: 'Role',
    kind: 'text',
    accessorKey: 'role',
    sortable: true,
  },
  {
    id: 'nik',
    header: 'NIK',
    kind: 'text',
    accessorKey: 'nik',
    sortable: true,
  },
  {
    id: 'actions',
    header: 'Action',
    kind: 'actions',
    actions: ['edit', 'delete'],
  },
];

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { users, setUsers } = useUserDirectory();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setIsLoading(true);
      setError(undefined);

      const usersResult = await Promise.allSettled([listUsers(currentPage, RESULTS_PER_PAGE)]);

      if (cancelled) {
        return;
      }

      const [userListResult] = usersResult;
      if (userListResult.status === 'fulfilled') {
        setUsers(userListResult.value.items);
        setTotalResults(userListResult.value.total ?? userListResult.value.items.length);
      } else {
        setError(userListResult.reason instanceof Error ? userListResult.reason.message : 'Gagal memuat data user.');
        setUsers([]);
        setTotalResults(0);
      }

      setIsLoading(false);
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [currentPage, setUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) =>
      [user.fullName, user.username, user.role, user.nik].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE));
  const pageClamped = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => paginationRange(pageClamped, totalPages), [pageClamped, totalPages]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const pageRows = useMemo<UserRow[]>(
    () => filteredUsers.map(normalizeUserRow),
    [filteredUsers]
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setUsers(users.filter((user) => user.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const footer = (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs" style={{ color: COLORS.textSecondary }}>
        Menampilkan {totalResults === 0 ? 0 : (pageClamped - 1) * RESULTS_PER_PAGE + 1} sampai{' '}
        {Math.min(pageClamped * RESULTS_PER_PAGE, totalResults)} dari {totalResults} hasil
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
      <PageHeader title="Data User" />

      <div className="flex flex-col p-10" style={{ backgroundColor: COLORS.backgroundGray }}>
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              User
            </h1>
            <p className="mt-1 text-xs" style={{ color: COLORS.textSecondary }}>
              Data Manajemen untuk user beserta role nya
            </p>
          </div>
          <Button type="button" size="sm" leftIcon={<PlusIcon />} onClick={() => navigate('/user-management/add')}>
            Tambah Data
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <SearchInput
              visualVariant="toolbar"
              placeholder="Search by name, username, or NIK"
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
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            {error}
          </div>
        ) : isLoading ? (
          <div
            className="flex min-h-40 items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            Memuat data user...
          </div>
        ) : pageRows.length === 0 ? (
          <div
            className="flex min-h-40 items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
          >
            Tidak ada user yang cocok dengan pencarianmu.
          </div>
        ) : (
          <DataTable
            columns={USER_COLUMNS}
            data={pageRows}
            getRowId={(row) => row.id}
            minWidth={920}
            footer={footer}
            onRowAction={(action, row) => {
              if (action === 'edit') {
                navigate(`/user-management/edit/${row.id}`);
              }
              if (action === 'delete') {
                setDeleteTarget(row);
              }
            }}
          />
        )}
      </div>

      <ConfirmationModalComponent
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus User"
        description={
          deleteTarget ? (
            <>
              Apakah anda yakin untuk menghapus user{' '}
              <span style={{ color: '#2563EB', textDecoration: 'underline', fontWeight: 600 }}>
                {deleteTarget.fullName}
              </span>
              ?
            </>
          ) : null
        }
        confirmLabel="Hapus Data"
        cancelLabel="Kembali"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
