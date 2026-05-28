import { createContext, useContext } from 'react';
import type { UserManagementRecord } from './cngr-api';

export type UserDirectoryContextValue = {
  users: UserManagementRecord[];
  setUsers: (users: UserManagementRecord[]) => void;
  clearUsers: () => void;
  refreshUsers: () => Promise<UserManagementRecord[]>;
  getUser: (id: string) => Promise<UserManagementRecord | undefined>;
};

const UserDirectoryContext = createContext<UserDirectoryContextValue | undefined>(undefined);

export function useUserDirectory(): UserDirectoryContextValue {
  const ctx = useContext(UserDirectoryContext);
  if (!ctx) {
    throw new Error('useUserDirectory must be used inside UserDirectoryProvider');
  }
  return ctx;
}

export { UserDirectoryContext };
