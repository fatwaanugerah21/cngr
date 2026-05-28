import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchUserDetail, listUsers, type UserManagementRecord } from './cngr-api';
import { UserDirectoryContext } from './user-directory-context';

const USER_DIRECTORY_PAGE_SIZE = 100;

async function loadAllUsers(): Promise<UserManagementRecord[]> {
  const users: UserManagementRecord[] = [];
  let page = 1;
  let total: number | undefined;

  while (total == null || users.length < total) {
    const result = await listUsers(page, USER_DIRECTORY_PAGE_SIZE);
    users.push(...result.items);
    total = result.total ?? users.length;

    if (result.items.length === 0) {
      break;
    }

    page += 1;
  }

  return users;
}

export default function UserDirectoryProvider({ children }: { children: ReactNode }) {
  const [users, setUsersState] = useState<UserManagementRecord[]>([]);
  const usersRef = useRef(users);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const setUsers = useCallback((nextUsers: UserManagementRecord[]) => {
    setUsersState(nextUsers);
  }, []);

  const clearUsers = useCallback(() => {
    setUsersState([]);
  }, []);

  const refreshUsers = useCallback(async () => {
    const nextUsers = await loadAllUsers();
    setUsersState(nextUsers);
    return nextUsers;
  }, []);

  const getUser = useCallback(
    async (id: string) => {
      const userId = id.trim();
      if (userId === '') {
        return undefined;
      }

      const cachedUser = usersRef.current.find((user) => user.id === userId);
      if (cachedUser) {
        return cachedUser;
      }

      const detailedUser = await fetchUserDetail(userId);
      if (!detailedUser) {
        return undefined;
      }

      setUsersState((currentUsers) => {
        const existingIndex = currentUsers.findIndex((user) => user.id === detailedUser.id);
        if (existingIndex === -1) {
          return [...currentUsers, detailedUser];
        }

        const nextUsers = [...currentUsers];
        nextUsers[existingIndex] = detailedUser;
        return nextUsers;
      });

      return detailedUser;
    },
    []
  );

  useEffect(() => {
    void refreshUsers().catch(() => {
      setUsersState([]);
    });
  }, [refreshUsers]);

  const value = useMemo(
    () => ({
      users,
      setUsers,
      clearUsers,
      refreshUsers,
      getUser,
    }),
    [users, setUsers, clearUsers, refreshUsers, getUser]
  );

  return <UserDirectoryContext.Provider value={value}>{children}</UserDirectoryContext.Provider>;
}
