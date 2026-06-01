export type UserManagementListState = {
  search: string;
  currentPage: number;
};

const DEFAULT_LIST_STATE: UserManagementListState = {
  search: '',
  currentPage: 1,
};

export function readUserManagementListState(state: unknown): UserManagementListState {
  if (!state || typeof state !== 'object') {
    return DEFAULT_LIST_STATE;
  }

  const record = state as Record<string, unknown>;
  const search = typeof record.search === 'string' ? record.search : '';
  const currentPage =
    typeof record.currentPage === 'number' && Number.isFinite(record.currentPage) && record.currentPage >= 1
      ? Math.floor(record.currentPage)
      : 1;

  return { search, currentPage };
}

export function buildUserManagementListState(search: string, currentPage: number): UserManagementListState {
  return {
    search,
    currentPage: Math.max(1, Math.floor(currentPage)),
  };
}
